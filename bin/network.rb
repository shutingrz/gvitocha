# -*- coding: utf-8 -*-

class Network

	@@tomocha
	@@daicho

	def initialize()
		@@tomocha = Operator.new
		begin
		#	@@tomocha.load($daichoPath)
			@@daicho = eval(File.open($daichoPath).read)
		rescue Errno::ENOENT
			puts "no daicho.dat file."
			tmp = File.open($daichoPath,"w")
			tmp.close
			Network.init()
			retry
		end
		if(@@daicho != Hash.new) then
		#	puts "start resume."
		#	Network.resume(@@daicho)
		end
	end

	def self.main(data)
		if(@@daicho != "") then
			@@tomocha.load(@@daicho)	#毎回ファイルからdaichoを読み込む
		end
	#	@@daicho = @@tomocha.getDaicho()
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
				source = data["msg"]["source"]
				target = data["msg"]["target"]
				res = createLink(source,target)
				if(res) then
					SendMsg.status(NETWORK,"success","完了しました。")
				end
			elsif (data["control"] == "delete") then
				link = data["msg"]
				deleteLink(link)
			end
		elsif (data["mode"] == "l3") then
			if (data["control"] == "create") then
				epair = data["msg"]["epair"]
				ipaddr = data["msg"]["ipaddr"]
				ipmask = data["msg"]["ipmask"]
				ip6addr = data["msg"]["ip6addr"]
				ip6mask = data["msg"]["ip6mask"]
				as = data["msg"]["as"]

				res = createL3(epair,ipaddr,ipmask,ip6addr,ip6mask,as)
				if(res) then
					SendMsg.status(NETWORK,"success","完了しました。")	
				end
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
	#	@@tomocha.register(epaira,"_host_",epairaIP,epairaMASK)

		#masterRouter to hostjail
		serverNAME = "masterRouter"
		epairbIP = "10.254.254.2"
		epairbMASK = "255.255.255.0"

		@@tomocha.setuprouter(serverNAME)
		@@tomocha.connect(serverNAME,epairb)
		@@tomocha.assignip(serverNAME,epairb,epairbIP,epairbMASK)
	#	@@tomocha.register(epairb,serverNAME,epairbIP,epairbMASK)
		@@tomocha.up(serverNAME,epairb)
	#	@@tomocha.save($daichoPath)
	end


	def self.to_link(daicho)
		num = 0
		source = ""
		target = ""
		jailset_links_name = []

		if (daicho != Hash.new) then	#daichoにデータが書き込まれていたら
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
		if (daicho != Hash.new) then		#daichoにデータが書き込まれていたら
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

	def self.createLink(source,target)
		#{"source"=>"server01", "target"=>"server03"}
		#SERVER = 0
		#ROUTER = 1
		#SWITCH = 2		#データベースのtypeの数値


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

		puts "#{source}(#{epaira}) connect"
		@@tomocha.connect(source,epaira)
		puts "#{source}(#{epaira}) up"
		@@tomocha.up(source,epaira)
		puts "#{target}(#{epairb}) connect"
		@@tomocha.connect(target,epairb)
		puts "#{target}(#{epairb}) up"
		@@tomocha.up(target,epairb)

		@@tomocha.save($daichoPath)

		return epaira, epairb

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

	def self.deleteLinkAll(jname)
		epairList = []
		@@daicho.each do |key, value|
			epair = key.to_s
			name = value[0]
			if (name == jname) then
				epairList << epair.chop
			end
		end
		if(epairList != []) then
			epairList.each do |epair|
				deleteLink(epair)
			end
		end
	end

	def self.createL3(epair,ipaddr,ipmask,ip6addr,ip6mask,as)
		name = epairToname(@@daicho,epair)

		
		@@tomocha.setupserver(name)
		if(ipaddr != "" && ipmask != "") then
			@@tomocha.assignip(name,epair,ipaddr,ipmask,as="")
		end
		if(ip6addr != "" && ip6mask != "") then
			@@tomocha.assignip6(name,epair,ip6addr,ip6mask,as="")
		end
		@@tomocha.save($daichoPath)

		return true	
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

	def self.destroyDaicho(daichoPath)
		File::open(path,"w") do |f|
      		f.puts ""
    	end
	end

	def self.resume(path)
		@@tomocha.daicho = ""
		if(@@daicho != "") then
			num = 0
			source = ""
			target = ""
			epaira = ""
			epairb = ""
			valuea = []
			valueb = []
			@@daicho.each do |key, value|	
			#	name = value[0]
			#	ipaddr = value[1]
			#	ipmask = value[2]
			#	ip6addr = value[3]
			#	ip6mask = value[4]
			#	as = value[5]
			#######################
				if (num%2 == 0) then			#a
					valuea = value
					source = valuea[0]
				else							#b
					valueb = value
					target = valueb[0]
					epaira, epairb = createLink(source,target)

					createL3(epaira,valuea[1], valuea[2], valuea[3], valuea[4], valuea[5])
					createL3(epairb,valueb[1], valueb[2], valueb[3], valueb[4], valueb[5])
				end
				num += 1
			end
		end
	end

end



