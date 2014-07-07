# -*- coding: utf-8 -*-

class SendMsg

	def self.asend(type,data)
		msg = JSON.generate({"msgType" => type, "data" =>data})
		puts msg
		$ws.send(msg)
	end
	def self.machine(mode,data)		#各モードに合わせてmsgの書式を変えていく
		if (mode == "list") then
			msg = {"mode" => mode, "machine" => data}
		end
		self.asend(MACHINE,msg)
	end

	def self.console(data)
		self.asend(CONSOLE,data)
	end

	def self.status(mode,msgType,data)
		if (msgType == "search" || msgType == "install" || msgType == "add" || msgType == "list") then		#pkg操作の場合
			msg = { "mode" => mode, "msg" => {"msgType" => msgType, "control" => "pkg", "msg" => data} }
		elsif(msgType == "jail") then
			msg = { "mode" => mode, "msg" => {"msgType" => msgType, "control" => "jail", "msg" => data} }
		else 
			msg = { "mode" => mode, "msg" => {"msgType" => msgType, "control" => "jail", "msg" => data} }
		end
		
		self.asend(STATUS,msg)
	end




end