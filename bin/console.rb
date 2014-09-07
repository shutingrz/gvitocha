# -*- coding: utf-8 -*-
require 'net/http'
	#console msg
class Console

	@task = Hash.new

	def self.main(data)

		if(data["mode"] == "write") then
			jname = data["msg"]["jname"]
			jid = Jail.nameTojid(jname)
			cmd = data["msg"]["cmd"]
			self.write(jid,cmd)
		end

		if(data["mode"] == "register" ) then
			jname = data["jname"]
			jid = Jail.nameTojid(jname)
			register(jid)
			self.loop(jid)
		end	
		if(data["mode"] == "unregister") then
			jname = data["jname"]
			jid = Jail.nameTojid(jname)
			unregister(jid)
		end
	end

	def self.register(jid)
		@task[jid] = true
	end

	def self.unregister(jid)
		@task[jid] = false
	end

	def self.unregisterAll()
		@task.each do |key, value|
			@task[key] = false
		end
	end

	def self.write(jid,cmd)
		param = "/u?s=00000#{jid}&jid=#{jid}&w=80&h=24&k=#{cmd}"
		res = self.send(param)
		SendMsg.console(res.gsub("\n","<br>"))
	end

	def self.read(jid)
		param = "/u?s=00000#{jid}&jid=#{jid}&w=80&h=24&k="
		res = self.send(param)
		return res
	end

	def self.loop(jid)
		EM::defer do
			#puts "task:#{@task[jid]}"
			while(@task[jid]) do
				res = self.read(jid)
				if(res != "") then
					SendMsg.console(res.gsub("\n","<br>"))
				end
				sleep(1)
			end
			puts "#{jid} unregisterd."
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