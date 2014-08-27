# -*- coding: utf-8 -*-

class Network

	@@tomocha = Operator.new
	@@daicho

	def initialize()
		begin
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
		if (data["mode"] == "list") then
			SendMsg.diag("link",to_link(@@daicho))
			SendMsg.diag("l3",to_l3(@@daicho))
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
				jailset_links_name << {"source" => source, "target" => target}
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

			jailset_network <<  {"name" => name, "ipaddr" => epairIP, "ipmask" =>  epairMASK, "ip6addr" => epairIP6, "ip6mask" => epairIP6MASK, "as" => as}
		end
		
		return jailset_network
	end



end