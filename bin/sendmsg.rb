# -*- coding: utf-8 -*-

class SendMsg

	def self.asend(type,data)
		msg = JSON.generate({"msgType" => type, "data" =>data})
	#	puts msg
		if ($init) then
			$ws.send(msg)
		end
	end
	def self.machine(mode,control,data)		#各モードに合わせてmsgの書式を変えていく
		msg = {"mode" => mode, "control" => control, "msg" => data}
		self.asend(MACHINE,msg)
	end

	def self.console(data)
		data = data.force_encoding("UTF-8")
		self.asend(CONSOLE,data)
	end

	def self.status(mode,msgType,data)
		msg = { "mode" => mode, "msg" => {"msgType" => msgType, "msg" => data} }	
		self.asend(STATUS,msg)
	end

	def self.diag(mode,data)
		msg = { "mode" => mode, "msg" => data }
		asend(NETWORK,msg)
	end




end
