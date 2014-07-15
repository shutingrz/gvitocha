#!/usr/local/bin/ruby

require './vitocha/vitocha.rb'
require './jail.rb'
require './sql.rb'

$jails = "/usr/jails"
#tomocha=Operator.new
sql = SQL.new		#初期化

puts Jail.dbjail()


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