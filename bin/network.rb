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
			link = to_link(@@daicho)
			if(link) then
				SendMsg.diag("link",link)
			end

			l3 = to_l3(@@daicho)
			if(l3) then
				SendMsg.diag("l3",l3)
			end

		elsif (data["mode"] == "link") then
			if (data["control"] == "add") then
				createLink(data["msg"])
			elsif (data["control"] == "delete") then
				deleteLink(data["msg"])
			end
		elsif (data["mode"] == "l3") then
			if (data["control"] == "create") then
				createL3(data["msg"])
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
	#	@@tomocha.save($daichoPath)
	end


	def self.to_link(daicho)
		num = 0
		source = ""
		target = ""
		jailset_links_name = []

		if (daicho != "") then	#daichoにデータが書き込まれていたら
			begin 
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
			rescue#不正なデータが書き込まれていたら
				jailset_links_name = "none"
			end
		else#daichoに何も書き込まれていなかったら
			jailset_links_name = "none"
		end
		return jailset_links_name
	end

	def self.to_l3(daicho)
		jailset_network = []
		if (daicho != "") then		#daichoにデータが書き込まれていたら
			begin
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
			rescue	#不正なデータが書き込まれていたら
				jailset_network = "none"
			end
		else	#daichoに何も書き込まれていなかったら
			jailset_network = "none"
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

		type = 
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
		@@tomocha.up(source,epaira)
		@@tomocha.connect(target,epairb)
		@@tomocha.up(target,epairb)

		@@tomocha.save($daichoPath)

		SendMsg.status(NETWORK,"success","完了しました。")


	end

	def self.deleteLink(link)
		epair = link
		epaira = epair + "a"
		epairb = epair + "b"
		epairaName = epairToname(@@daicho,epaira)
		epairbName = epairToname(@@daicho,epairb)

		puts "#{epairaName},#{epairbName}"

		@@tomocha.removepair(epairaName, epaira, epairbName, epairb)
		@@tomocha.save($daichoPath)

		SendMsg.status(NETWORK,"success","完了しました。")
	end

	def self.createL3(data)
		epair = data["epair"]
		name = epairToname(epair)
		ipaddr = data["ipaddr"]
		ipmask = data["ipmask"]
		ip6addr = data["ip6addr"]
		ip6mask = data["ip6mask"]
		as = data["as"]

		
		@@tomocha.setupserver(name)
		if(ipaddr != "" && ipmask != "") then
			@@tomocha.assignip(name,epair,ipaddr,ipmask,as="")
		end
		if(ip6addr != "" && ip6mask != "") then
			@@tomocha.assignip6(name,epair,ip6addr,ip6mask,as="")
		end
		@@tomocha.save($daichoPath)

		SendMsg.status(NETWORK,"success","完了しました。")		
	end

	def self.epairToname(daicho,epair)
		epairName = ""
		daicho.each do |key, value|
			if(key.to_s == epair) then
				epairName = value[0]
			end
		end
		return epairName
	end

	def self.nameToepair(daicho,name)

	end

end



