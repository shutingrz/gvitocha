# -*- coding: utf-8 -*-

require 'open3'

class Jail

	def initialize()
	end

	def self.main(data)

		if(data["control"] == "select") then
			list(data)
			return

		elsif (data["control"] == "new") then
			machine = data["machine"] #machineを入れる
			puts "machine creating."
			cmdLog,cause = create(machine)
			save($bootPath)

		elsif (data["control"] == "delete") then
			cmdLog,cause = delete(data["name"])
			save($bootPath)


		elsif (data["control"] == "boot") then
			cmdLog,cause = boot(data)
		end

		if(cmdLog == false) then
			SendMsg.status(MACHINE,"failed",cause)
		else
			SendMsg.status(MACHINE,"success","完了しました。")
		end
	end

	def self.create(machine)
		
		cmdLog = mkQjail(machine['flavour'],machine['name'])
		if(cmdLog == false) then
			return false,"qjail"
		end

		start(machine['name'])
		if(cmdLog == false) then
			return false,"jail"
		end

		SendMsg.status(MACHINE,"report","jail")
	
		templete = (SQL.select("templete",machine['templete']))[2]
		templete = templete.split(";")
		puts templete
		templete.each do |pname|
			SendMsg.status(MACHINE,"log","#{pname} adding...")
			Pkg.add(machine['name'], pname)		#templeteに入っている全てのpkgをインストール
			SendMsg.status(MACHINE,"log","ok<br>")			
		end
		SendMsg.status(MACHINE,"report","pkg")
		
		nextid = SQL.select("machine","maxid") + 1
		sqlid = 0
		SQL.insert("machine",machine)
		SQL.select("machine",nextid) do |id|	#作成したmachineのIDを取得
			sqlid = id
		end

		if (sqlid != nextid ) then #sqlidがnextidではない（恐らくnextid-1)場合は、machineが正常に作成されていない
			return false,"database"
		end	
=begin
		#ネットワーク関係の仕上げ操作
		if machine['machineType'] == SERVER.to_s then
			#reserved
		elsif machine["machineType"] == SWITCH.to_s then
			#reserved
		else
			#reserved
		end
=end		
		return true
	end

	def self.delete(name)
		jname = ""
		#SQL.select("machine",name) do |id,name,type,templete,flavour,comment|
			jname = name
		#end
		Network.deleteLinkAll(jname)
		cmdLog,cause = stop(jname)
		if(cmdLog == false) then
			return cmdLog,cause
		end
		s,e = Open3.capture3("qjail delete #{jname}")
		if(isExist(jname)) then
			return false,"削除に失敗"
		end

		s = SQL.delete("machine",jname)
		puts s
		return true
	end

	def self.boot(data)
		if(data["state"] == "start") then
			cmdLog,cause = self.start(data["name"])
		else
			Network.deleteLinkAll(data["name"])
			cmdLog,cause = self.stop(data["name"])
		end

		save($bootPath)
		
		return cmdLog,cause

	end

	def self.start(machine)
		s,e = Open3.capture3("qjail start #{machine}")
		flag = false
		
		upjail = upjail()
		upjail.each do |jail|
			if(jail == machine) then	#upjailに存在したらtrue
				s,e = Open3.capture3("jail -m name=#{machine} devfs_ruleset=5")
				s,e = Open3.capture3("jail -m name=#{machine} allow.raw_sockets=1")
				flag = true
			end
		end


		return flag,"起動に失敗"
	end

	def self.stop(machine)
		s,e = Open3.capture3("qjail stop #{machine}")

		upjail = upjail()
		flag = true
		upjail.each do |jail|
			if(jail == machine) then	#upjailに存在したらfalse
				flag = false
			end
		end
		return flag,"停止に失敗"
	end

	def self.status(machine)

	end

	def self.list(data)
		machineList = { }
		sqlid = 0
		id = 0 #マシン情報を送信,masterRouterも送る(id == 0)

		if (data["id"] == "all") then

			machine = SQL.select("machine","all")
			machine.delete_at(0)
			machine.each do |value|
				machineList["key#{value[0]}"] = {"id" => value[0].to_s, "name" => value[1], "type" => value[2].to_s, "templete" => value[3].to_s, "flavour" => value[4].to_s, "comment" => value[5]}
			end
		end	
		
		state = { }
		key = 0
		bootcheck().each do |data|
			state["key#{key.to_s}"] = {"name" => data[0], "state" => data[1]}
	#		puts data[0]
			key += 1
		end

		if (machineList == {})
				SendMsg.machine("jail","list","none")
		else	
				SendMsg.machine("jail","list",machineList)
		end
		SendMsg.machine("jail","boot",state)

	end

	def self.mkEzjail(flavour,machine)
		fname = SQL.select("flavour",flavour)
		s,e = Open3.capture3("ezjail-admin create -f #{fname} -r #{machine} #{machine} 0.0.0.0")
		cmdLog = Open3.capture3("ezjail-admin list|grep #{machine}")	#ezjail-admin listに載っていたら正常
		if(cmdLog == "")
			return false
		end
	end

	def self.mkQjail(flavour,machine)
		fname = SQL.select("flavour",flavour)
		puts fname
		cmdLog,e = Open3.capture3("qjail list")
		s,e = Open3.capture3("qjail create -f #{fname} -4 0.0.0.0 #{machine}")
		puts s
		cmdLog2,e = Open3.capture3("qjail list")
		if(cmdLog == cmdLog2)		#ダウンロード前後にlsの結果を取って、要素が同じならばダウンロードに失敗しているとわかる（ファイルが増えていない）
			puts ("qjailerror")
			return false
		end
		cmdLog,e = Open3.capture3("ln -s /sharedfs/pkg #{$jails}/#{machine}/pkg")
	end

	def self.bootcheck()
		state = Array.new
		str = Array.new
		
		
		upjail = upjail()
		dbjail = dbjail()

	#	upjail.delete_at(0)
	#	dbjail.delete_at(0)	#masterRouterを除く <=2014.08.27 除かないようにした(クライアントでもmasterRouterの操作ができるようにするため)

		key = 0
		dbjail.each do |odbjail|
			odbjail = odbjail[0]
			flag = false
			upjail.each do |oupjail|
				if (odbjail == oupjail.chomp) then
					flag = true
				end
			end
			if (flag == true) then
				state << [odbjail,"1"]
			else
				state << [odbjail,"0"]
			end
			key += 1
		end

		return state
	end

	def self.upjail()
		snum = 0
		upjail = Array.new
		s,e = Open3.capture3("jls |grep #{$jails}")	#Path($jails)が含まれているものを抜き出せば最初の行を取り除ける

		s.each_line do |line|
			str = line.split(" ")
			str.each do |sstr|
				if (snum%4 == 2) then
					upjail << sstr
				end
				snum += 1
			end
		end

	#	upjail.delete_at(0)	#masterRouterを除く
		return upjail
	end

	def self.dbjail()
		dbjail = Array.new
		dbjail = SQL.sql("select name from machine order by id asc ;")
		dbjail.delete_at(0)

		return dbjail
	end

	def self.save(path)
		upjail = upjail()
		File::open(path,"w") do |f|
			upjail.each do |ujail|
    			f.puts ujail
    		end
    	end
    end

    def self.load(path)
    	begin
			ujail = File.open(path).read
		rescue
			return false
		end
		ujail.each_line do |jail|
			jail.chomp!
			print "starting #{jail}..."
			flg = self.start(jail)
			if (flg) then
				print "ok\n"
			else
				print "ng\n"
			end
		end
	end

	def self.nameTojid(name)
		jid = 0
		s,e = Open3.capture3("jls |grep #{$jails}|grep #{name}")
		s.each_line do |line|
			str = line.split(" ")
			if(str[2] == name) then
				jid = str[0]
				break
			end
		end
		return jid
	end

	def self.isExist(name)
		isExist = false
		s,e = Open3.capture3("jls |grep #{$jails}|grep #{name}")
		s.each_line do |line|
			str = line.split(" ")
			if(str[2] == name) then
				isExist = true
				break
			end
		end
		return isExist
	end


end



=begin

	def self.start_obsolute(machine)

		s,e = Open3.capture3("/usr/sbin/jail -c vnet host.hostname=#{machine} name=#{machine} path=#{$jails}/#{machine} persist")
		puts s
		s,e = Open3.capture3("mount -t devfs devfs #{$jails}/#{machine}/dev")
		puts s
		s,e = Open3.capture3("mount_nullfs #{$jails}/basejail #{$jails}/#{machine}/basejail")
		puts s
		cmdLog = Open3.capture3("jls|grep #{machine}")	#jlsに載っていたら正常
		if(cmdLog == "")
			return false
		end
		return true
	end

	def self.stop_obsolute(machine)
		s,e = Open3.capture3("ezjail-admin stop #{machine} ")
		s,e = Open3.capture3("umount #{$jails}/#{machine}/dev")
		s,e = Open3.capture3("umount #{$jails}/#{machine}/basejail")
		cmdLog = Open3.capture3("jls|grep #{machine}")	#jlsに載っていたら正常
		if(cmdLog != "")
			return false
		end
		return true
	end

=end