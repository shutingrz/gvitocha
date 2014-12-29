# -*- coding: utf-8 -*-
require 'net/http'
require 'digest/md5'
	#console msg
class Console

	@task = Hash.new
	@runningFlg = true

	def self.main(data)

		jname = data["jname"]
		jid = Jail.nameTojid(jname)

		if(data["mode"] == "write") then
			cmd = data["cmd"]
			self.write(jid,cmd)
		end

		if(data["mode"] == "register" ) then
			register(jid)
			self.loop(jid)
		end	
		if(data["mode"] == "unregister") then
			unregister(jid)
		end
		if(data["mode"] == "suspend") then
			suspend()
		end
	end

	def self.register(jid)
	#	sid = Digest::MD5.hexdigest(jid.to_s + Time.now.to_s)
		if(@task[jid] == false || @task[jid] == nil) then
			sid = jid.to_s+Time.now.to_i.to_s
			@task[jid] = sid
		end
		@runningFlg = true
	end

	def self.suspend()
		@runningFlg = false
	end

	def self.unregister(jid)
		@task[jid] = false
		@runningFlg = false
	end

	def self.unregisterAll()
		@task.each do |key, value|
			@task[key] = false
		end
	end

	def self.write(jid,cmd)
		param = "/u?s=#{@task[jid]}&jid=#{jid}&w=80&h=22&k=#{cmd}"
	#	param = "/u?s=0000#{jid}&jid=#{jid}&w=80&h=22&k=#{cmd}"
		res = self.send(param)
		SendMsg.console(res.gsub("\n","<br>"))
	end

	def self.read(jid)
		param = "/u?s=#{@task[jid]}&jid=#{jid}&w=80&h=22&k="
	#	param = "/u?s=0000#{jid}&jid=#{jid}&w=80&h=22&k="
		res = self.send(param)
		return res
	end

	def self.loop(jid)
		EM::defer do
			#puts "task:#{@task[jid]}"
			while(@runningFlg) do
				res = self.read(jid)
				if(res != "") then
					SendMsg.console(res.gsub("\n","<br>"))
				end
				sleep(0.1)
			end
			puts "#{jid} was suspended."
		end
	end

	def self.send(param)
		#puts "send:" + param
		url = URI.parse($webshellURI)
		req = Net::HTTP::Get.new(param)
		res = Net::HTTP.start(url.host, url.port) {|http|
		  http.request(req)
		}
		#puts "body:" + res.body
		return res.body
	end

end