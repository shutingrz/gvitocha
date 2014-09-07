#!/usr/local/bin/ruby
# -*- coding: utf-8 -*-

require './vitocha/vitocha.rb'
require 'em-websocket'
require 'open3'
require 'json'


require './console.rb'
require './machine.rb'
require './sql.rb'
require './jail.rb'
require './pkg.rb'
require './sendmsg.rb'
require './templete.rb'
require './network.rb'


#STDIN .set_encoding( Encoding.locale_charmap, "UTF-8" )
#STDOUT.set_encoding( Encoding.locale_charmap, "UTF-8" )
#STDERR.set_encoding( Encoding.locale_charmap, "UTF-8" )

CONSOLE = 1;
STATUS = 2;
MACHINE = 3;
NETWORK = 4;
ETC = 10;
INIT = 101;

#machine
SERVER = 0;
ROUTER = 1;
SWITCH = 2;

#SQL
CREATE = 201;
SELECT = 202;
INSERT = 203;

$jails = "/usr/jails"
$ws
$msg = ""
$channel
$webshellURI = "http://192.168.56.103:8022"

$daichoPath = $jails + "/daicho.dat"
$bootPath = $jails + "/daicho.boot"



Process.daemon(nochdir=true) if ARGV[0] == "-D"
@channel = EM::Channel.new
$channel = @channel

#必ずmasterRouterは起動させる
Open3.capture3("qjail start masterRouter")
#boot情報からjailを起動させる
Jail.load($bootPath)

EM::run do
	EventMachine::WebSocket.start(host: "0.0.0.0", port: 3000) do |ws|
	#start network then connect to client
		$ws = ws
		ws.onopen do				
				sid = @channel.subscribe{|mes| ws.send mes}
				sql = SQL.new		#初期化
				#daicho
				net = Network.new	#初期化
		end
		ws.onmessage do |message|
			EventMachine::defer do
				STDOUT.sync = true
				puts "raw:" + message
        		msg = JSON.parse(message)
        		message = msg[1]
        		if (msg["msgType"] == CONSOLE) then
        			console(msg["data"])
	
				elsif (msg["msgType"] == STATUS) then
        			p "STATUS"

        		elsif (msg["msgType"] == MACHINE) then
        			machine(msg["data"])

        		elsif (msg["msgType"] == NETWORK) then
        			Network.main(msg["data"])

        		elsif (msg["msgType"] == ETC) then
        			p "ETC"

        		end		
   			end
		end
	
		ws.onclose	do |event|
			puts "disconnected."
		end
	

	end


end