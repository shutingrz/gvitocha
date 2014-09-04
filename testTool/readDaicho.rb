#!/usr/local/bin/ruby
# -*- coding: utf-8 -*-

#require './vitocha/vitocha.rb'
#require './jail.rb'
#require './sql.rb'
#require 'open3'

$jails = "/usr/jails"
daichoPath = $jails + "/daicho.dat"


cable = Hash.new
#tomocha=Operator.new
#sql = SQL.new		#初期化
epairNum = 0

#puts Jail.upjail()

cable = eval(File.open(daichoPath).read)
=begin
var jailset_links_name = [
    {source : "_host_", target: "masterRouter"},
    {source : "masterRouter", target: "mswitch"},
    {source : "mswitch", target: "switch01"},
    {source : "mswitch", target: "switch02"},

=end

#json形式に
diag = {}
cable.each do |key, value|
	epair = key.to_s
	name = value[0]
	epairIP = value[1]
	epairMASK = value[2]
	epairIP6 = value[3]
	epairIP6MASK = value[4]
	as = value[5]

	diag[epair] =  {"name" => name, "ipaddr" => epairIP, "ipmask" =>  epairMASK, "ip6addr" => epairIP6, "ip6mask" => epairIP6MASK, "as" => as}
		
end

#jailset_links_nameを作成
num = 0
source = ""
target = ""
jailset_links_name = []
cable.each do |key,value|
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

#puts jailset_links_name


=begin

var jailset_network = [
    {name: "_host_", ipaddr : "10.254.254.1", ipmask : "255.255.255.0", ip6addr : "", ip6mask : "", as : ""},
    {name:"masterRouter", ipaddr : "10.254.254.2", ipmask : "255.255.255.0", ip6addr : "", ip6mask : "", as : ""},
    {name:"masterRouter", ipaddr : "192.168.20.1", ipmask : "255.255.255.0", ip6addr : "", ip6mask : "", as : ""}, 
    {name:"server01", ipaddr : "192.168.20.11", ipmask : "255.255.255.0", ip6addr : "", ip6mask : "", as : ""}, 
    {name:"server02", ipaddr : "192.168.20.12", ipmask : "255.255.255.0", ip6addr : "", ip6mask : "", as : ""}, 

=end

#jailset_networkの作成

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

puts jailset_network

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