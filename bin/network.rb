# -*- coding: utf-8 -*-

class Network

	@@tomocha
	@@daicho


	def initialize()
		@@tomocha = Operator.new
		begin
			l2DB = SQL.select("l2")

			if(l2DB == Array.new) then
				Network.init()
			end
		rescue 
			l2DB = Array.new
			Network.init()
		end
	#	if(@@daicho != Hash.new) then
		#	puts "start resume."
		#	Network.resume(@@daicho)
	#	end
	end

	def self.main(data)

		if (data["mode"] == "list") then
			link = getL2()

			if(link) then
				SendMsg.diag("link",link)
			end

			l3 = getL3()
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

		registerL3(epaira,"_host",epairaIP,epairaMASK)

		#masterRouter to hostjail
		serverNAME = "masterRouter"
		epairbIP = "10.254.254.2"
		epairbMASK = "255.255.255.0"

		@@tomocha.setuprouter(serverNAME)
		@@tomocha.connect(serverNAME,epairb)
		registerL2(epaira.chop,"_host",serverNAME)
		@@tomocha.assignip(serverNAME,epairb,epairbIP,epairbMASK)
		registerL3(epairb,serverNAME,epairbIP,epairbMASK)
		@@tomocha.up(serverNAME,epairb)



	end

	def self.registerL3(epairF,jailname,ip4="",mask="",as="",ip6="",prefixlen="")
		# ex.	epairF	=>	epair0a
		# 		epair 	=>	0 
		# 		type 	=> 	a
		epairF = epairF.gsub("epair","")
		type = epairF[-1]
		epair = epairF.chop

		data = {epair:epair, type:type, name: jailname, ip4: ip4, ip4mask: mask, ip6: ip6, ip6mask: prefixlen}
		result = SQL.insert("l3",data)

		return result

	end

	def self.registerL2(epair,a,b)
		epair = epair.gsub("epair","").to_i
		data = {epair: epair, a: a, b: b}

		result = SQL.insert("l2",data)

		return result
	end

	def self.unregisterL2(epairaName,epaira, epairbName, epairb)
		#ex. epair0a => 0a => 0

		epair = epaira.gsub("epair","").chop.to_i
		SQL.delete("l2",epair)
		SQL.delete("l3",epair)

	end

	def self.getL2()

		l2 = SQL.select("l2")
		l2List = []

		if (l2 == Array.new) then
			puts "Array.new!"
			return "none"
		end

		l2.each do |value|
			epair = "epair" + value[0].to_s
			a = value[1]
			b = value[2]
			l2List << {source: a, target: b, epair: epair}
		end
		return l2List
	end

	def self.getL3()

		l3 = SQL.select("l3")
		l3List = []

		if (l3 == Array.new) then
			puts "Array.new!"
			return "none"
		end

		l3.each do |value|
			epair = value[0]	#=> 0
			type = value[1]		#=> a
			epair = "epair" + epair.to_s + type	#=>epair0a

			name = value[2]
			ipaddr = value[3]
			ipmask = value[4]
			ip6addr = value[5]
			ip6mask = value[6]

			l3List << {epair: epair, name: name, ipaddr: ipaddr, ipmask: ipmask, ip6addr: ip6addr, ip6mask: ip6mask }
		end

		return l3List
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

		registerL2(epaira.chop, source, target)
		registerL3(epaira,source,"","","","","")
		registerL3(epairb,target,"","","","","")

		return epaira, epairb

	end

	def self.deleteLink(link)
		epairNum = link.gsub("epair","").to_i 	#epairの数字部分のみ取り出す
		epair = link
		epaira = epair + "a"
		epairb = epair + "b"

		epairData = SQL.select("l2",epairNum)[0] 	#第2引数に数字を入れればその番号のepairのみ取り出す
		epairaName = epairData[1]
		epairbName = epairData[2]
		puts "#{epairaName},#{epairbName}"
		unregisterL2(epairaName,epaira, epairbName, epairb) 			#バグ？removepairのあとにunregisterL2を記述すると、epairaの文字列の最後が削られてしまう。
																		#(ex. 	epair1aがepair1に変化)　unregisterL2をremovepairよりも先に書けば大丈夫
		@@tomocha.removepair(epairaName, epaira, epairbName, epairb)
		

		SendMsg.status(NETWORK,"success","完了しました。")
	end

	def self.deleteLinkAll(jname)

		epairList = []

		l2DB = SQL.select("l2")
		l2DB.each do |l2|
			if(l2[1] == jname || l2[2] == jname)then
				epairList << ("epair" + l2[0].to_s)
			end
		end

		if(epairList != []) then
			epairList.each do |epair|
				deleteLink(epair)
			end
		end

	end



	def self.createL3(epair,ipaddr,ipmask,ip6addr,ip6mask,as)

		type = epair[-1]
		epairNum = epair.chop[-1]
		name = SQL.sql("select name from l3 where epair=#{epairNum} and type='#{type}'")[0][0]
		
		@@tomocha.setupserver(name)
		if(ipaddr != "" && ipmask != "") then
			@@tomocha.assignip(name,epair,ipaddr,ipmask,as="")
		end
		if(ip6addr != "" && ip6mask != "") then
			@@tomocha.assignip6(name,epair,ip6addr,ip6mask,as="")
		end

		
		registerL3(epair,name,ipaddr,ipmask,"",ip6addr,ip6mask)
		return true	
	end

	def self.destroyDaicho(daichoPath)
		File::open(path,"w") do |f|
      		f.puts ""
    	end
	end

	def self.save(daicho)
		print "savedaicho=> "
		puts daicho
		SQL.update("daicho",daicho)
	end

	def self.load()
		begin
			daicho = SQL.select("daicho")
			daicho = eval(daicho)
		rescue
		end
	#	puts "return するdaicho => #{daicho}"
		return daicho
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



