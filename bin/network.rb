# -*- coding: utf-8 -*-

class Network

	@@tomocha
	@@daicho

	def initialize()
		@@tomocha = Operator.new
		begin
			@@tomocha.load($daichoPath)
			@@daicho = eval(File.open($daichoPath).read)
		rescue Errno::ENOENT
			puts "no daicho.dat file."
			tmp = File.open($daichoPath,"w")
			tmp.close
			Network.init()
			retry
		end
	end

	def self.main(data)
		@@tomocha.load($daichoPath)	#毎回ファイルからdaichoを読み込む
		@@daicho = @@tomocha.getDaicho()
#		puts "Network.mainの最初"
#		puts @@tomocha.getDaicho()

		if (data["mode"] == "list") then
			SendMsg.diag("link",to_link(@@daicho))
			SendMsg.diag("l3",to_l3(@@daicho))
		elsif (data["mode"] == "link") then
			if (data["control"] == "add") then
				createLink(data["msg"])
			elsif (data["control"] == "delete") then
				deleteLink(data["msg"])
			end
		end

	end

	def self.init()
		#hostjail connect masterRouter
		epaira, epairb = @@tomocha.createpair
		epairaIP = "10.254.254.1"
		epairaMASK = "255.255.255.0"

		ifconfig(epaira + " inet " + epairaIP + " netmask " + epairaMASK)
		ifconfig(epaira + " up")
		@@tomocha.register(epaira,"_host_",epairaIP,epairaMASK)

		#masterRouter to hostjail
		serverNAME = "masterRouter"
		epairbIP = "10.254.254.2"
		epairbMASK = "255.255.255.0"

		@@tomocha.setuprouter(serverNAME)
		@@tomocha.connect(serverNAME,epairb)
		@@tomocha.assignip(serverNAME,epairb,epairbIP,epairbMASK)
		@@tomocha.register(epairb,serverNAME,epairbIP,epairbMASK)
		@@tomocha.up(serverNAME,epairb)
		@@tomocha.save($daichoPath)
	end


	def self.to_link(daicho)
		num = 0
		source = ""
		target = ""
		jailset_links_name = []
		daicho.each do |key,value|
			epair = key.to_s
			name = value[0]
			epairIP = value[1]
			epairMASK = value[2]
			epairIP6 = value[3]
			epairIP6MASK = value[4]
			as = value[5]
		
			if (num%2 == 0) then
				source = name
			else
				target = name
				jailset_links_name << {"source" => source, "target" => target, "epair" => epair.chop}
			end

			num += 1
		end
		return jailset_links_name
	end

	def self.to_l3(daicho)
		jailset_network = []
		daicho.each do |key, value|
			epair = key.to_s
			name = value[0]
			epairIP = value[1]
			epairMASK = value[2]
			epairIP6 = value[3]
			epairIP6MASK = value[4]
			as = value[5]

			jailset_network <<  {"epair" => epair, "name" => name, "ipaddr" => epairIP, "ipmask" =>  epairMASK, "ip6addr" => epairIP6, "ip6mask" => epairIP6MASK, "as" => as}
		end
		
		return jailset_network
	end

	def self.createBridge(name)
		@@tomocha.setupbridge(name)
	end

	def self.createLink(data)
		#{"source"=>"server01", "target"=>"server03"}
		#SERVER = 0
		#ROUTER = 1
		#SWITCH = 2		#データベースのtypeの数値

		source = data["source"]
		target = data["target"]


		case (SQL.select("machine","name",source))[2]
			when SERVER then
				@@tomocha.setupserver(source)
			when ROUTER then
				@@tomocha.setuprouter(source)
			when SWITCH then
				@@tomocha.setupbridge(source)
			else
				@@tomocha.setupserver(source)	#何も一致しなかった時はserverとして
		end

		case (SQL.select("machine","name",target))[2]
			when SERVER then
				@@tomocha.setupserver(target)
			when ROUTER then
				@@tomocha.setuprouter(target)
			when SWITCH then
				@@tomocha.setupbridge(target)
			else
				@@tomocha.setupserver(target)	#何も一致しなかった時はserverとして
		end
		epaira, epairb = @@tomocha.createpair

		@@tomocha.connect(source,epaira)
		@@tomocha.connect(target,epairb)

		@@tomocha.save($daichoPath)

		SendMsg.status(NETWORK,"success","完了しました。")


	end

	def self.deleteLink(link)
		epair = link
		epaira = epair + "a"
		epairb = epair + "b"
		epairaName = "_host_"
		epairbName = "_host_"

		num = 0

		#epairは数字1つあたり、a,bの2つがあるため、全ての各ループ時にnumを加算し、num mod 2にすることでa,bとして扱う。
		@@daicho.each do |key, value|
			if(num%2 == 0) then
				if(key.to_s == epaira) then
					epairaName = value[0]
				end
			else
				if(key.to_s == epairb) then
					epairbName = value[0]
				end	
			end
			num += 1
		end
		puts "#{epairaName},#{epairbName}"

		@@tomocha.removepair(epairaName, epaira, epairbName, epairb)
		@@tomocha.save($daichoPath)

		SendMsg.status(NETWORK,"success","完了しました。")
	end

end



