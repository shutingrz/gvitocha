# -*- coding: utf-8 -*-

require 'open3'

class Jail

	@jailDir

	def self.init()
		@jailDir = System.getConf("jailDir")
		load()
	end

	def self.main(data)

		if(data["control"] == "select") then
			list(data)
			return

		elsif (data["control"] == "new") then
			if(data["machine"] == "easy")then
				easyCreate(data["machineType"])
			else
				machine = data["machine"] #machineを入れる
				puts "machine creating."
				cmdLog,cause = create(machine)
			end
		elsif (data["control"] == "delete") then
			if(data["name"] == "_all") then
				cmdLog,cause = deleteAll()
			else
				cmdLog,cause = delete(data["name"])
			end

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
		time = Time.now.strftime("%Y-%m-%d %H:%M:%S")
		machine['createTime'] = time.to_s
		machine['modifyTime'] = time.to_s
		
		cmdLog = mkQjail(machine['flavour'],machine['name'])
		if(cmdLog == false) then
			return false,"qjail"
		end

		SQL.insert("boot",machine["name"])

		start(machine['name'])
		if(cmdLog == false) then
			return false,"jail"
		end

		SendMsg.status(MACHINE,"report","jail")
	
		template = (SQL.select("template",machine['template']))[2]
		template = template.split(";")
		puts template
		template.each do |pname|
			SendMsg.status(MACHINE,"log","#{pname} adding...")
			Pkg.add(machine['name'], pname)		#templateに入っている全てのpkgをインストール
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
		jname = name
		Network.deleteLinkAll(jname)
		cmdLog,cause = stop(jname)
		if(cmdLog == false) then
			return cmdLog,cause
		end
		s,e = Open3.capture3("qjail delete #{jname}")
		if(isExist(jname)) then
			return false,"削除に失敗"
		end
		#s = SQL.delete("machine",jname)
		SQL.delete("machine",jname)
		SQL.delete("boot",jname)
		#puts s
		return true
	end

	def self.deleteAll()
		dbjail = dbjail()
		dbjail.delete_at(0) #masterRouterを除く
		res = true
		cause = ""
		dbjail.each do |jail|
			res = delete(jail)
			if(!res) then
				cause = "削除に失敗:" + jail
				break
			end
		end

		#easyCreateの通し番号をリセット
		easyData = { "type" => SERVER, "id" => 0, "template" => 0, "flavour" => 0 }
		SQL.update("easyConf",easyData)
		easyData = { "type" => ROUTER, "id" => 0, "template" => 0, "flavour" => 0 }
		SQL.update("easyConf",easyData)
		easyData = { "type" => SWITCH, "id" => 0, "template" => 0, "flavour" => 0 }
		SQL.update("easyConf",easyData)

		return res, cause
	end

	def self.boot(data)
		if(data["state"] == 1) then
			cmdLog,cause = self.start(data["name"])
		else
			Network.deleteLinkAll(data["name"])
			cmdLog,cause = self.stop(data["name"])
		end

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
				save(machine,1)
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
		if(flag) then
			save(machine,0)
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
			if(machine != false) then
	#			machine.delete_at(0)
				machine.each do |value|
					machineList["key#{value[0]}"] = {"id" => value[0].to_s, "name" => value[1], "type" => value[2].to_s, "template" => value[3].to_s, "flavour" => value[4].to_s, "comment" => value[5], "createTime" => value[6], "modifyTime" => value[7]}
				end
			else
				return false
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
		cmdLog,e = Open3.capture3("qjail list")
		s,e = Open3.capture3("qjail create -f #{fname} -4 0.0.0.0 #{machine}")
		puts s
		cmdLog2,e = Open3.capture3("qjail list")
		if(cmdLog == cmdLog2)		#ダウンロード前後にlsの結果を取って、要素が同じならばダウンロードに失敗しているとわかる（ファイルが増えていない）
			puts ("qjailerror")
			return false
		end
		cmdLog,e = Open3.capture3("ln -s /sharedfs/pkg #{@jailDir}/#{machine}/pkg")
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
		s,e = Open3.capture3("jls |grep #{@jailDir}")	#Path(@jailDir)が含まれているものを抜き出せば最初の行を取り除ける

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
		dbjail2 = SQL.sql("select name from machine order by id asc ;")
		dbjail2.delete_at(0)
		dbjail2.each do |jail|
			dbjail << jail[0]
		end

		return dbjail
	end

	def self.save(name,state)
		data = Hash.new
		data["name"] = name
		data["state"] = state
		SQL.update("boot",data)
	end

	def self.load()
		name = SQL.select("boot","name")
		states = SQL.select("boot","state")

		name.each_with_index do |jail, i|
			jail = jail[0].chomp	#Array取り除き
			state = states[i][0]	#Array取り除き
			if(state == 1)then
				print "starting #{jail}..."
				flg = self.start(jail)
				if (flg) then
					print "ok\n"
				else
					print "ng\n"
				end
			end
		end
	end

	def self.nameTojid(name)
		jid = 0
		s,e = Open3.capture3("jls |grep #{@jailDir}|grep #{name}")
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
		s,e = Open3.capture3("jls |grep #{@jailDir}|grep #{name}")
		s.each_line do |line|
			str = line.split(" ")
			if(str[2] == name) then
				isExist = true
				break
			end
		end
		return isExist
	end

	def self.easyCreate(type)
		cause = ""
		tmp = SQL.select("easyConf",type)
		id = tmp[1]+1
		template = tmp[2]
		flavour = tmp[3]
		easyData = { "type" => type, "id" => id, "template" => template, "flavour" => flavour }

		cmdLog = SQL.update("easyConf",easyData)	#万が一jailが作成できなくても先にupdateしておけば重複を防げる

		case type
		when SERVER then
			name = "_Server#{id}"
		when ROUTER then
			name = "_Router#{id}"
		when SWITCH then
			name = "_Switch#{id}"
		else
			name = "_Server#{id}"
		end

		machine = { "name" => name , "machineType" => type.to_s, "template" => template.to_s, "flavour" => flavour.to_s, "comment" => "created by easyCreate" }
	
		cmdLog, cause = create(machine)

		return cmdLog, cause
	end


end
