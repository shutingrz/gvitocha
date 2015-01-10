# -*- coding: utf-8 -*-

class Network

	#Vitochaインスタンス用変数を宣言
	#コンストラクタで初期化する。
	@@tomocha

	def initialize()
		#コンストラクタ
		#はじめにデータベースからL2情報を取得。
		#L2情報が空の配列、もしくは取得すらできない（初回起動）の場合は初期化メソッドinitを呼び出す
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
	end

	def self.main(data)
		#メインメソッド
		#クライアントからの全てのNetworkの処理は一旦mainメソッドで受け取る
		#jsonデータ構造
		#data = { mode: `L2であるかL3であるか`,  control: `modeに対しての処理`',  msg: `データ`}

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
				if(link == "_all")then
					res = deleteLinkAll()
				else
					res = deleteLink(link)
				end
				if(res) then
					SendMsg.status(NETWORK,"success","完了しました。")
				end
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
		#初期化メソッド
		#NAT用にホストとmasterRouterをつなぐ。

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
		#epairに対してL3(IPv4(=ip4),IPv6(=ip6))を登録する。
		#
		#epairF ・・・	epairの完全名(epair0aなど)。必須。
		#jailname ・・・	jail名。必須。
		#ip4　・・・		IPv4アドレス。
		#mask ・・・		IPv4のサブネットマスク。ip4がある場合は必須。
		#as ・・・		未使用。Vitochaとの後方互換性用。
		#ip6　・・・		IPv6アドレス。
		#prefixlen　・・・IPv6のプレフィックス長。ip6がある場合は必須。	
		#
		#データベースにepairを格納する場合はepairの数値とabをそれぞれepair,typeに分ける。
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
		#epairに接続する2つのjail(またはホスト)を登録する。
		#データベースにepairを登録する場合はepairの文字列を削除する。
		#ex.	epair 	=>	epair5
		#				=>  5
		epair = epair.gsub("epair","").to_i
		data = {epair: epair, a: a, b: b}

		result = SQL.insert("l2",data)

		return result
	end

	def self.unregisterL2(epairaName,epaira, epairbName, epairb)
		#データベースからepairの情報を削除する。
		#L2を削除するということは同時にL3も削除することから、L3のデータベースからも削除することになる。
		#データベースに問い合わせをするときは、epairの文字列を削除する。
		#ex. epair0a => 0a => 0

		epair = epaira.gsub("epair","").chop.to_i
		SQL.delete("l2",epair)
		SQL.delete("l3",epair)

	end

	def self.getL2(epairNum=nil)
		#データベースから全てのL2情報を取得する。
		#第一引数に数値が存在する場合、その番号のL2情報を返す。
		#返すデータ構造は、
		#l2List = [{source: `L2情報のtypeがaのjail名`, target: `L2情報のtypeがbのjail名`, epair: `epair名`},{...}]
		#データベースのL2情報が空の場合、"none"という文字列を返す。

		if (epairNum.class == Fixnum) then
			l2Data = SQL.select("l2",epairNum)[0]
			return {source: l2Data[1], target: l2Data[2], epair: l2Data[0]}
		end

		l2 = SQL.select("l2")
		l2List = []

		if (l2 == Array.new) then
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
		#データベースから全てのL3情報を取得する。
		#他メソッドはこのメソッドから全てのL3情報を取得し、そこから必要な情報を取り出すことになる。
		#返すデータ構造は、
		#l3List = [{epair: `epair名`, name: `jail名`, ipaddr: `IPv4アドレス`, ipmask: `IPv4サブネットマスク`, ip6addr: `IPv6アドレス`, ip6mask: `IPv6プレフィックス長`}, {...}]
		#データベースのL3情報が空の場合、"none"という文字列を返す。

		l3 = SQL.select("l3")
		l3List = []

		if (l3 == Array.new) then
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
		#name(jail名)の名前でブリッジを作成する。

		@@tomocha.setupbridge(name)
	end

	def self.createLink(source,target)
		#source,targetの2つのjail名でepairを作成する。
		#
		#ex. source　=>　"server01",　target　=>　"server03"
		#SERVER = 0
		#ROUTER = 1
		#SWITCH = 2		#データベースのtypeの数値

		machines = [source, target]

		machines.each do |name|
			machineType = SQL.select("machine","name",name)[2]
			case machineType
				when SERVER then
					@@tomocha.setupserver(name)
				when ROUTER then
					@@tomocha.setuprouter(name)
				when SWITCH then
					@@tomocha.setupbridge(name)
				else
					@@tomocha.setupserver(name)	#何も一致しなかった時はserverとして
			end
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

		#各jailのregisterL3を、名前だけで発行する(検索用)
		registerL3(epaira,source,"","","","","")
		registerL3(epairb,target,"","","","","")

		return epaira, epairb

	end

	def self.deleteLink(link)
		#epairを削除する。
		#

		epairNum = link.gsub("epair","").to_i 	#epairの数字部分のみ取り出す
		epair = link
		epaira = epair + "a"
		epairb = epair + "b"

		epairData = getL2(epairNum) 	#getL2の引数に数字を入れればその番号のepairのみ取り出す
		epairaName = epairData[:source]
		epairbName = epairData[:target]
		unregisterL2(epairaName,epaira, epairbName, epairb) 			#バグ？removepairのあとにunregisterL2を記述すると、epairaの文字列の最後が削られてしまう。
																		#(ex. 	epair1aがepair1に変化)　unregisterL2をremovepairよりも先に書けば大丈夫
		@@tomocha.removepair(epairaName, epaira, epairbName, epairb)
		

		return true
	end

	def self.deleteLinkAtJail(jname)
		#引数のjailに接続している全てのepairを削除する。
		#このメソッドは指定したJailに対して作用する。

		epairList = []

		l2DB = SQL.select("l2")
		l2DB.each do |l2|
			if(l2[1] == jname || l2[2] == jname)then	#L2情報のaまたはbにjnameが入っていた場合にそのepairを削除する
				epairList << ("epair" + l2[0].to_s)
			end
		end

		if(epairList != []) then
			epairList.each do |epair|
				deleteLink(epair)
			end
		end

	end

	def self.deleteLinkAll()
		#L2DBの全てのepairを削除する。
		#このメソッドはL2DBの全てのJailに対して作用する。

		epairList = []

		l2DB = getL2()
		l2DB.each do |l2|
			deleteLink(l2[:epair])
		end

		#_hostとmasterRouterを接続する
		init()

		return true
	end



	def self.createL3(epair,ipaddr,ipmask,ip6addr,ip6mask,as)
		#L3(IPv4またはIPv6)をepairの片方に割り当てる。

		type = epair[-1] 	#文字列の最後部
		epairNum = epair.gsub("epair","").chop
		puts "epairNum => #{epairNum}"
		l3Data = SQL.sql("select name,ip4,ip6 from l3 where epair=#{epairNum} and type='#{type}'")[0] 	#直接SQLを操作
		name = l3Data[0]
		oldIpaddr = l3Data[1]
		oldIp6addr = l3Data[2]

		
		@@tomocha.setupserver(name)
		if(ipaddr != "..." && ipmask != "...") then
			if(oldIpaddr != "")then
				puts "withdraw"
				@@tomocha.withdrawip(name,epair,oldIpaddr)
			end
			@@tomocha.assignip(name,epair,ipaddr,ipmask,as="")
		end
		if(ip6addr != "" && ip6mask != "") then
			if(oldIp6addr != "")then
				puts "withdraw6"
				@@tomocha.withdrawip6(name,epair,oldIp6addr)
			end
			@@tomocha.assignip6(name,epair,ip6addr,ip6mask,as="")
		end

		registerL3(epair,name,ipaddr,ipmask,"",ip6addr,ip6mask)
		return true	
	end

end



