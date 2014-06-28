#status msg
def status(ws,mode,msgType,msg)
	sendMsg = { "mode" => mode, "msg" => {"msgType" => msgType, "msg" => msg} }
	send(ws,STATUS,sendMsg)
end