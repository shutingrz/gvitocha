	#console msg
	def console(message)
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
	end