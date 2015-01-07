#!/usr/local/bin/ruby
# -*- coding: utf-8 -*-


require './vitocha/vitocha.rb'
require 'em-websocket'
require 'open3'
require 'json'


require './console.rb'
require './sql.rb'
require './jail.rb'
require './pkg.rb'
require './sendmsg.rb'
require './template.rb'
require './network.rb'
require './system.rb'

CONSOLE = 1;
STATUS = 2;
MACHINE = 3;
NETWORK = 4;
INIT = 101;

#machine
SERVER = 0;
ROUTER = 1;
SWITCH = 2;

#SQL
CREATE = 201;
SELECT = 202;
INSERT = 203;

$ws
$msg = ""

#サーバ側での起動初期化が完了したか
#initがfalseなら各クラスはwebsocketを使わない
$init = false

Process.daemon(nochdir=true) if ARGV[0] == "-D"

System.init()


$init = true
puts "init ok!"
puts "websocket server start."

gvitHost = System.getConf("gvitHost")
gvitPort = System.getConf("gvitPort")
EM::run do
	EventMachine::WebSocket.start(host: gvitHost, port: gvitPort) do |ws|
	#start network then connect to client
		$ws = ws
		ws.onopen do				
			#	sid = @channel.subscribe{|mes| ws.send mes}
		end
		ws.onmessage do |message|
			#クライアントから送られてきたメッセージをパースして、msgTypeに合致する各クラスへ送る
			#EventMachine::deferを用いることで並列処理を行う(=サーバ側からのプッシュができる)。
			#

			EventMachine::defer do
				STDOUT.sync = true

				#デバッグ文
				puts "raw:" + message

        		msg = JSON.parse(message)
        		if (msg["msgType"] == CONSOLE) then
        			Console.main(msg["data"])

        		elsif (msg["msgType"] == MACHINE) then
        			data = msg["data"]

        			if (data["mode"] == "jail") then
						Jail.main(data)


					elsif (data["mode"] == "pkg" ) then
						Pkg.main(data)

					elsif (data["mode"] == "template") then
						Templete.main(data)
					end 


        		elsif (msg["msgType"] == NETWORK) then
        			Network.main(msg["data"])
        		end		
   			end
		end
	
		ws.onclose	do |event|
			puts "disconnected."
			Console.unregisterAll()
		end
	

	end

	#webshellの自動起動
	EM::defer do
		webshellBinPath = System.getConf("webshellBinPath")
		pythonExecPath = System.getConf("pythonExecPath")
		webshellExec = "#{pythonExecPath} #{webshellBinPath}"

		port = System.getConf("webshellPort")
        loop do
            s,e = Open3.capture3("ps|grep webshell|grep -v grep")
            if(s=="") then
                s,e = Open3.capture3("#{webshellExec} -d -p #{port} --ssl-disable")
                puts "webshell started."
            end
            sleep 1
        end
  	end



end
