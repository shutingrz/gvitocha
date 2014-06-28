#!/usr/local/bin/ruby
# -*- coding: utf-8 -*-

require './vitocha/vitocha.rb'
require 'em-websocket'
require 'open3'
require 'json'
require 'shellwords'


require './console.rb'
require './status.rb'
require './machine.rb'
require './sql.rb'
require './mkjail.rb'
require './pkg.rb'


STDIN .set_encoding( Encoding.locale_charmap, "UTF-8" )
STDOUT.set_encoding( Encoding.locale_charmap, "UTF-8" )
STDERR.set_encoding( Encoding.locale_charmap, "UTF-8" )

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
$Jls = Array.new
$Line = Array.new
$list = Hash.new
$NetName
tomocha=Operator.new

Process.daemon(nochdir=true) if ARGV[0] == "-D"

EventMachine::WebSocket.start(host: "0.0.0.0", port: 3000) do |ws|
#start network then connect to client
	ws.onopen do
		#console(ws,"echo Hello. Type shell command.")

	end
	ws.onmessage do |message|
		STDOUT.sync = true
		puts "生メッセージ:" + message
        #msg = message.split(/,/, 2)		#送り先とその後のコマンドを分離し、適切な送り先へ引数つけて呼び出し
        msg = JSON.parse(message)
        message = msg[1]
        if (msg["msgType"] == CONSOLE) then
        	p "CONSOLE"
        	console(ws,msg["data"])

		elsif (msg["msgType"] == STATUS) then
        	p "STATUS"

        elsif (msg["msgType"] == MACHINE) then
        	machine(ws,msg["data"])

        elsif (msg["msgType"] == NETWORK) then
        	p "NETWORK"	

        elsif (msg["msgType"] == ETC) then
        	p "ETC"

        end		
	end
	
	ws.onclose	do |event|
		puts "disconnected."
	end

	def send(ws,msgType,data)
		msg = JSON.generate({"msgType" => msgType, "data" =>data})
		puts msg
		ws.send(msg)
	end

	

end







