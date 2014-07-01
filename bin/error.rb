def error (ws,type, msg)
	msg = { "mode" => type, "msg" => {"msgType" => "failed", "msg" => msg} }
	send(ws,STATUS,msg)
end