# -*- coding: utf-8 -*-
require 'net/http'
	#console msg
	def console(data)
=begin
		SendMsg.console(">" + message)
		begin
			Open3.popen3(message) do |stdin, stdout, stderr, thread|
				stdout.each do |line|
					line = line.chomp
					SendMsg.console(line)
				end
				stderr.each do |line|
					line = line.chomp
					SendMsg.console(line)
				end
				SendMsg.console("")
			end
		rescue => exc		#存在しないコマンドが打たれた時
			p exc
			SendMsg.console("command not found: " + message + "\n")
		end
=end
		jid = data["jid"]
		msg = data["msg"]
		url = URI.parse($webshellURI)
		req = Net::HTTP::Get.new("/u?s=00000#{jid}&jid=#{jid}&w=80&h=24&k=#{msg}")
		res = Net::HTTP.start(url.host, url.port) {|http|
		  http.request(req)
		}
		
		SendMsg.console(res.body.gsub("\n","<br>"))
	end