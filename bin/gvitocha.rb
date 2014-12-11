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

$DB_FILE = "/usr/jails/gvitocha.db"
$jails = "/usr/jails"
$ws
$msg = ""
#$channel
$webshellURI = "http://192.168.56.104:8022"
$qjailConfDir = "/usr/local/etc"

#サーバ側での起動初期化が完了したか
#initがfalseなら各クラスはwebsocketを使わない
$init = false

Process.daemon(nochdir=true) if ARGV[0] == "-D"
#@channel = EM::Channel.new
#$channel = @channel

sql = SQL.new		#初期化

#カーネルパニック検知
s,e = Open3.capture3("ls -1 #{$qjailConfDir}/qjail.local/")
s.each_line do |line|
	if(line.chomp == "jail.core") then
		puts "カーネルパニックを検知。初期化します"
		Open3.capture3("rm -rf #{$qjailConfDir}/qjail.local/*")
		Open3.capture3("rm -rf #{$qjailConfDir}/qjail.global/*")

		machine = SQL.select("machine","all")
		if(machine != false) then
			machine.each do |value|	
				jname = value[1]
				
#本来なら設定を全て書き戻すが、カーネルパニックによっては/usr/jails/以下のjailのディレクトリを破壊してしまうので、書き戻しが難しい。
#当分は初期化の方向で　
=begin
			conf = <<"EOS"
name="#{jname}"
ip4="0.0.0.0"
ip6=""
path="/usr/jails/#{jname}"
interface="lo0"
fstab="/usr/local/etc/qjail.fstab/#{jname}"
securelevel=""
cpuset=""
fib=""
vnet=""
vinterface=""
rsockets=""
ruleset=""
sysvipc=""
quotas=""
nullfs=""
zfs=""
poststartssh=""
deffile="/usr/local/etc/qjail.local/#{jname}"
image=""
imagetype=""
imageblockcount=""
imagedevice=""
EOS
				File::open("#{$qjailConfDir}/qjail.local/#{jname}","w") do |f|
					f.puts conf
				end	
				File::open("#{$qjailConfDir}/qjail.global/#{jname}","w") do |f|
					f.puts conf
				end	
=end
				Open3.capture3("rm -rf #{$jails}/#{jname}")
			end
			SQL.sql("delete from boot")
			SQL.sql("delete from machine where id>=0")
			SQL.update("daicho",'')

			machine = {"name" => "masterRouter", "machineType" => ROUTER.to_s, "template" => "1", "flavour" => "0","comment" => "masterRouter" }
			Jail.create(machine)
			Jail.start("masterRouter")

		end
	end
end

#
#boot情報からjailを起動させる
Jail.load()

net = Network.new	#初期化




$init = true
puts "init ok!"
puts "websocket server start."
EM::run do
	EventMachine::WebSocket.start(host: "0.0.0.0", port: 3000) do |ws|
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


end
