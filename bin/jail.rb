# -*- coding: utf-8 -*-


class Jail

	def initialize()

	end

	def self.create(machine)
		puts machine['machineType']
		if machine['machineType'] == SERVER.to_s then
			s,e = Open3.capture3("./vitocha/mkserver #{machine['name']}")
		else
			s,e = Open3.capture3("./vitocha/mkrouter #{machine['name']}")
		end

		cmdLog = Open3.capture3("ezjail-admin list|grep #{machine['name']}")	#ezjail-admin listに載っていたら正常
		if(cmdLog == "")
			return false
		end
	
		SQL.select("pkglist",machine['templete']).each do |pname|
			puts "#{pname} adding..."
			Pkg.add(machine['name'], pname)		#templeteに入っている全てのpkgをインストール
		end

		nextid = SQL.select("machine","maxid") + 1
		sqlid = 0
		SQL.insert("machine",machine)
		SQL.select("machine",nextid) do |id|	#作成したmachineのIDを取得
			sqlid = id
		end

		if (sqlid != nextid ) then #sqlidがnextidではない（恐らくnextid-1)場合は、machineが正常に作成されていない
			#	SendMsg.status(MACHINE,"failed","machineの作成に失敗")
			return false,"database"
		end	
		
		return true
	end

	def self.start(machine)
		s,e = Open3.capture3("/usr/sbin/jail -c vnet host.hostname=#{machine} name=#{machine} path=#{$jails}/#{machine} persist")
		s,e = Open3.capture3("mount -t devfs devfs #{$jails}/#{machine}/dev")
		s,e = Open3.capture3("mount_nullfs #{$jails}/basejail #{$jails}/#{machine}/basejail")
	end

	def self.status(machine)

	end

end