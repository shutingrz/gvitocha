# -*- coding: utf-8 -*-
require 'inifile'
require "fileutils"


class System

	@ini
	@gvitdConfFile = "./gvitd.conf"
	@dbFile = "/usr/jails/gvitocha.db"
	@jailDir = "/usr/jails"
	@pkgDir = "/var/cache/pkg"

	@gvitHost = "0.0.0.0"
	@gvitPort = 3000

	@webshellHost = "127.0.0.1"
	@webshellPort = "8022"
	@webshellURI = ""

	@qjailLocalConfDir = "/usr/local/etc/qjail.local"
	@qjailGlobalConfDir = "/usr/local/etc/qjail.global"
	@qjailVnetConfDir = "/usr/local/etc/qjail.vnet"
	@qjailFstabConfDir = "/usr/local/etc/qjail.fstab"

	def self.init()
		checkConf()
		checkEnv()
		checkPanic()

		sql = SQL.new(System.getConf("dbFile"))		#初期化
		Jail.init()
		Pkg.init()
		Console.init()

		net = Network.new	#初期化
	end

	def self.getConf(key)
		eval("return @#{key}")
	end

	def self.checkConf(conf="./gvitd.conf")
		@ini = IniFile.load(conf)

		##gvitocha
		if(@ini["gvitocha"]["dbFile"]) then
			@dbFile = @ini["gvitocha"]["dbFile"]
		end
		if(@ini["gvitocha"]["host"]) then
			@gvitHost = @ini["gvitocha"]["host"]
		end
		if(@ini["gvitocha"]["port"]) then
			@gvitPort = @ini["gvitocha"]["port"]
		end

		##OS
		if(@ini["OS"]["jailDir"]) then
			@jailDir = @ini["OS"]["jailDir"]
		end
		if(@ini["OS"]["pkgDir"]) then
			@pkgDir = @ini["OS"]["pkgDir"]
		end
		if(@ini["OS"]["qjailLocalConfDir"]) then
			@qjailLocalConfDir = @ini["OS"]["qjailLocalConfDir"]
		end
		if(@ini["OS"]["qjailGlobalConfDir"]) then
			@qjailGlobalConfDir = @ini["OS"]["qjailGlobalConfDir"]
		end
		if(@ini["OS"]["qjailVnetConfDir"]) then
			@qjailVnetConfDir = @ini["OS"]["qjailVnetConfDir"]
		end
		if(@ini["OS"]["qjailFstabConfDir"]) then
			@qjailFstabConfDir = @ini["OS"]["qjailFstabConfDir"]
		end


		##WebShell
		if(@ini["WebShell"]["port"]) then
			if(@ini["WebShell"]["port"] < 1 ||@ini["WebShell"]["port"] > 65535) then
				puts confError("WebShell","port","1-65535の値を入力してください。")
				exit
			end
			@webshellPort = @ini["WebShell"]["port"].to_s
		end
		#puts @webshellPort.class
		@webshellURI = "http://" + @webshellHost + ":" + @webshellPort


	end


	def self.confError(section,name,msg)
		puts "Error[conf]: #{msg} ([#{section}]#{name}=#{eval("@ini[\"#{section}\"][\"#{name}\"]")})"

	end

	def self.checkEnv

		#root権限の判定
		s,e = Open3.capture3("whoami")
		if(s.chomp != "root") then
			puts "Error[env]: Please execute on superuser."
			exit
		end

		#OSの判定
		begin
			s,e = Open3.capture3("freebsd-version")
		rescue
			puts "Error[env]: FreeBSD Only."
			exit
		end

		#バージョンの判定
		mejor = s.split("-")[0].split(".")[0]
		if(mejor != "10") then
			puts "Error[env]: FreeBSD-10.x Only."
			exit
		end

		#VIMAGE有効判定
		s,e = Open3.capture3("sysctl -n kern.features.vimage")
		if(s.chomp != "1") then
			puts "Error[env]: VIMAGE is disabled."
			exit
		end

		#qjailのディレクトリが作成されているか
		if(!File.exist?(@qjailLocalConfDir)) then
			puts "Error[env]: qjail directory is not exist.(#{@qjailLocalConfDir})"
			exit
		end

	end

	def self.checkPanic
		#カーネルパニック検知
		s,e = Open3.capture3("ls -1 #{$qjailConfDir}/qjail.local/")
		s.each_line do |line|
			if(line.chomp == "jail.core") then
				puts "The karnelpanic happened to system. system initting..."
				Open3.capture3("rm -rf #{@qjailLocalConfDir}/*")
				Open3.capture3("rm -rf #{$qjailGlobalConfDir}/*")
				machine = SQL.select("machine","all")
				if(machine != false) then

					machine.each do |value|	
						jname = value[1]		
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
	end


	attr_reader :dbFile

end



##カーネルパニックの設定書き戻しについて
#	
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