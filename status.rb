#status msg
def status(ws,message)
	ws.send("status,"+ message)
end