	#console msg
	#gvitocha.rbよりws、massageを受け取る
	def console(ws,message)
		send(ws,CONSOLE,">" + message)
		begin
			Open3.popen3(message) do |stdin, stdout, stderr, thread|
				stdout.each do |line|
					send(ws,CONSOLE,line)
				end
				stderr.each do |line|
					send(ws,CONSOLE,line)
				end
				send(ws,CONSOLE,"")
			end
		rescue => exc		#存在しないコマンドが打たれた時
			p exc
			send(ws,CONSOLE,"command not found: " + message + "\n")
		end
	end