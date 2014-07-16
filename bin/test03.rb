#!/usr/local/bin/ruby

require './vitocha/vitocha.rb'
require './jail.rb'
require './sql.rb'
require 'open3'

$jails = "/usr/jails"
daichoPath = $jails + "/daicho.dat"
dBootPath = $jails + "/daicho.boot"


cable = Hash.new
tomocha=Operator.new
sql = SQL.new		#初期化
epairNum = 0

#puts Jail.upjail()

cable = eval(File.open(daichoPath).read)

ujail = File.open(dBootPath).read
ujail.each_line do |jail|
	Jail.start(jail.chomp)
	puts "#{jail.chomp} started."
end


cable.each do |key, value|		#ハッシュの数はepairの数の２倍（abがあるため）
	epairNum += 1
end
epairNum /= 2

num=0
while num < epairNum do
	tomocha.createpair			#予め作っておく
	num += 1
end	

cable.each do |key, value|
	epair = key.to_s
	name = value[0]
	epairIP = value[1]
	epairMASK = value[2]


	if(name == "_host_") then
		puts "#{key} is host"
		ifconfig(epair + " inet " + epairIP + " netmask " + epairMASK)
		ifconfig(epair + " up")
		tomocha.register(epair,"_host_",epairIP,epairMASK)

	elsif(epairIP == "switch") then
		switch=Bridge.new(name)
		if switch.find == false then
			switch.create(name)
			switch.on
		end
		switch.connect(epair)
		tomocha.register(epair,name,"","")
		switch.up(epair)
	else
		server = Server.new(name)
		server.connect(epair)
		server.assignip(epair,epairIP,epairMASK)
		tomocha.register(epair,name,epairIP,epairMASK)
		server.up(epair)		
	end
		
end

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