#!/usr/local/bin/ruby

require './vitocha/vitocha.rb'
require './jail.rb'

tomocha=Operator.new

$jails = "/usr/jails"
daichoPath = $jails + "/daicho.dat"
dBootPath = $jails + "/daicho.boot"

#create switch
switchNAME = "switch"
switch=Bridge.new(switchNAME)
switch.on

#hostjail connect switch
epaira, epairb = tomocha.createpair
epairaIP = "192.168.20.1"
epairaMASK = "255.255.255.0"

ifconfig(epaira + " inet " + epairaIP + " netmask " + epairaMASK)
ifconfig(epaira + " up")
tomocha.register(epaira,"_host_",epairaIP,epairaMASK)

switch.connect(epairb)
tomocha.register(epairb,switchNAME,"switch","")
#tomocha.connect(switch,epairb)
switch.up(epairb)


#create server01
serverNAME = "server01"
epairaIP = "192.168.20.11"
epairaMASK = "255.255.255.0"

server = Server.new(serverNAME)
epaira, epairb = tomocha.createpair
server.connect(epaira)
server.assignip(epaira,epairaIP,epairaMASK)
tomocha.register(epaira,serverNAME,epairaIP,epairaMASK)
server.up(epaira)
switch.connect(epairb)
tomocha.register(epairb,switchNAME,"switch","")
#tomocha.connect(switch,epairb)
switch.up(epairb)

#create server02
serverNAME = "server02"
epairaIP = "192.168.20.12"
epairaMASK = "255.255.255.0"

server = Server.new(serverNAME)
epaira, epairb = tomocha.createpair
server.connect(epaira)
server.assignip(epaira,epairaIP,epairaMASK)
tomocha.register(epaira,serverNAME,epairaIP,epairaMASK)
server.up(epaira)
switch.connect(epairb)
tomocha.register(epairb,switchNAME,"switch","")
#tomocha.connect(switch,epairb)
switch.up(epairb)

tomocha.save(daichoPath)
Jail.save(dBootPath)

=begin
#いつもの３点セットを作成

#!/usr/local/bin/ruby

require './vitocha/vitocha.rb'

tomocha=Operator.new

#create switch
switchNAME = "switch"
switch=Bridge.new(switchNAME)
switch.on

#hostjail connect switch
epaira, epairb = tomocha.createpair
epairaIP = "192.168.20.1"
epairaMASK = "255.255.255.0"

ifconfig(epaira + " inet " + epairaIP + " netmask " + epairaMASK)
ifconfig(epaira + " up")
switch.connect(epairb)
switch.up(epairb)


#create server01
serverNAME = "server01"
epairaIP = "192.168.20.11"
epairaMASK = "255.255.255.0"

server = Server.new(serverNAME)
epaira, epairb = tomocha.createpair
server.connect(epaira)
server.assignip(epaira,epairaIP,epairaMASK)
tomocha.register(epaira,serverNAME,epairaIP,epairaMASK)
server.up(epaira)
switch.connect(epairb)
switch.up(epairb)

#create server02
serverNAME = "server02"
epairaIP = "192.168.20.12"
epairaMASK = "255.255.255.0"

server = Server.new(serverNAME)
epaira, epairb = tomocha.createpair
server.connect(epaira)
server.assignip(epaira,epairaIP,epairaMASK)
tomocha.register(epaira,serverNAME,epairaIP,epairaMASK)
server.up(epaira)
switch.connect(epairb)
switch.up(epairb)

=end





=begin
#daichoのsaveをする

#!/usr/local/bin/ruby

require './vitocha/vitocha.rb'

$jails = "/usr/jails"
tomocha=Operator.new


for num in 1..30 do
	epaira = "epair" + num.to_s + "a"
	serverNAME = "server" + num.to_s
	epairaIP = "192.168.20." + num.to_s
	epairaMASK = "255.255.255.0"

	tomocha.register(epaira,serverNAME,epairaIP,epairaMASK)
end

#puts tomocha.exportDaicho
#puts tomocha.echoDaicho("epair4a")
tomocha.save($jails + "/daicho.dat")

=end


=begin
#daichoの読み込みをする

#!/usr/local/bin/ruby

require './vitocha/vitocha.rb'

$jails = "/usr/jails"
daichoPath = $jails + "/daicho.dat"
tomocha=Operator.new
daicho=Hash.new

tomocha.load(daichoPath)


tomocha.daicho.each do |key, value|
	puts value[0]
end

=end