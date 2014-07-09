# -*- coding: utf-8 -*-


class Jail

	def initialize()

	end

	def self.main(data)
		machineList = { }
		sqlid = 0
		id = 1

		if(data["control"] == "select") then

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

		elsif (data["control"] == "new") then
			machine = data["machine"] #machineを入れる
			puts "machine creating."
			cmdLog,cause = Jail.create(machine)

			if(cmdLog == false)
				SendMsg.status(MACHINE,"failed",cause)
				return
			else
				SendMsg.status(MACHINE,"success","完了しました。")	
			end
		end

	end

	def self.create(machine)
		if machine['machineType'] == SERVER.to_s then
			#reserved
		else
			#reserved
		end
		
		cmdLog = mkEzjail(machine['flavour'],machine['name'])
		if(cmdLog == false) then
			return false,"ezjail"
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
			puts "#{pname} adding..."
			Pkg.add(machine['name'], pname)		#templeteに入っている全てのpkgをインストール
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

	def self.start(machine)

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

	def self.stop(machine)
		s,e = Open3.capture3("ezjail-admin stop #{machine} ")
		s,e = Open3.capture3("umount #{$jails}/#{machine}/dev")
		s,e = Open3.capture3("umount #{$jails}/#{machine}/basejail")
		cmdLog = Open3.capture3("jls|grep #{machine}")	#jlsに載っていたら正常
		if(cmdLog != "")
			return false
		end
		return true
	end

	def self.status(machine)

	end

	def self.mkEzjail(flavour,machine)
		fname = SQL.select("flavour",flavour)
		s,e = Open3.capture3("ezjail-admin create -f #{fname} -r #{machine} #{machine} 0.0.0.0")
		cmdLog = Open3.capture3("ezjail-admin list|grep #{machine}")	#ezjail-admin listに載っていたら正常
		if(cmdLog == "")
			return false
		end
	end

end