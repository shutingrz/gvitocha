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

		elsif (data["control"] == "delete") then
			cmdLog,cause = delete(data["id"])


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
		if machine['machineType'] == SERVER.to_s then
			#reserved
		else
			#reserved
		end
		
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
		
		return true
	end

	def self.delete(mid)
		jname = ""
		SQL.select("machine",mid) do |id,name,type,templete,flavour,comment|
			jname = name
		end
	
		cmdLog,cause = stop(jname)
		if(cmdLog == false) then
			return cmdLog,cause
		end
		s,e = Open3.capture3("qjail delete #{jname}")
		cmdLog,e = Open3.capture3("qjail list|grep #{jname}")
		if(cmdLog != "") then
			return false,"削除に失敗"
		end

		s = SQL.delete("machine",mid)
		puts s
		return true
	end

	def self.boot(data)
		if(data["state"] == "start") then
			cmdLog,cause = start(data["name"])
		else
			cmdLog,cause = stop(data["name"])
		end
		
		return cmdLog,cause

	end

	def self.start(machine)
		s,e = Open3.capture3("qjail start #{machine}")
		
		upjail = upjail()
		flag = false
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
		id = 1

		if (data["id"] == "all") then
			#マシン情報を送信,masterRouterは送らない(id != 0)
			maxid = SQL.select("machine","maxid")
		
			while id <= maxid do #|id, name, type, templete, comment|
				SQL.select("machine",id) do |id, name, type, templete, flavour, comment|
					machineList["key#{id}"] = {"id" => id.to_s, "name" => name, "type" => type.to_s, "templete" => templete.to_s, "flavour" => flavour.to_s, "comment" => comment}
				end
				id += 1
			end
			if (machineList == {})
				SendMsg.machine("jail","list","none")
			else	
				SendMsg.machine("jail","list",machineList)
			end
			id = 1


		end	
		
		state = { }
		key = 0
		bootcheck().each do |data|
			state["key#{key.to_s}"] = {"name" => data[0], "state" => data[1]}
	#		puts data[0]
			key += 1
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
		dbjail.delete_at(0)	#masterRouterを除く

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

		upjail.delete_at(0)	#masterRouterを除く
		return upjail
	end

	def self.dbjail()
		dbjail = Array.new
		dbjail = SQL.sql("select name from machine order by id asc ;")
		dbjail.delete_at(0)

		return dbjail
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