#!/usr/local/bin/ruby
# -*- coding: utf-8 -*-

require '/jails/bin/vitocha.rb'
require 'em-websocket'
require 'open3'
require 'expect'

require './console.rb'
require './status.rb'

STDIN .set_encoding( Encoding.locale_charmap, "UTF-8" )
STDOUT.set_encoding( Encoding.locale_charmap, "UTF-8" )
STDERR.set_encoding( Encoding.locale_charmap, "UTF-8" )

$jails = "/jails"
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
		#status(ws,"connected.")
		puts "connected."

	end
	ws.onmessage do |message|
		STDOUT.sync = true
		puts "生メッセージ:" + message
        msg = message.split(/,/, 2)		#送り先とその後のコマンドを分離し、適切な送り先へ引数つけて呼び出し
        message = msg[1]
        if (msg[0] == "console") then
        	console(ws,message)
        	status(ws,"console command:" + msg[0])
        end		
	end
	
	ws.onclose	do |event|
		puts "disconnected."
	end


end









