	#console msg
	#gvitocha.rbよりws、massageを受け取る
	def console(ws,message)
		ws.send("console,>" + message)
		puts "コマンド：" + message
		begin
			Open3.popen3(message) do |stdin, stdout, stderr, thread|
				stdout.each do |line|
					ws.send("console," + line)
				end
				stderr.each do |line|
					ws.send("console," + line)
				end
				ws.send("console, ")
			end
		rescue => exc		#存在しないコマンドが打たれた時
			p exc
			ws.send("console,command not found: " + message + "\n")
		end
	end