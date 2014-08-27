# -*- coding: utf-8 -*-

class Network

	def self.main(data)
		if (data["control"] == "list") then
			SendMsg.diag("link",link(daicho))
			SendMsg.diag("l3",l3(daicho))
			end
		end

	end


	def self.link(daicho)
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

	def self.l3(daicho)
		jailset_network = []
		cable.each do |key, value|
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