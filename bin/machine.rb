#!/usr/local/bin/ruby
# -*- coding: utf-8 -*-

def machine (ws,data)
	machineList = { }

	num = 0

	if (data["mode"] == "get") then
		#マシン情報を送信
		sql(SELECT,"select id, name, type, templete, comment from machine").each do |id, name, type, templete, comment|
			machineList["key#{num}"] = {"id" => id.to_s, "name" => name, "type" => type.to_s, "templete" => templete, "comment" => comment}
			num += 1
		end
		send(ws,MACHINE,machineList)
		num = 0
	elsif (data["mode"] == "new") then
		machine = data["machine"]
		nextid = sql("MAXID","dummy")[0][0] + 1
=begin
		sql(SELECT,"insert into machine (id, name, type, templete, comment) values ('" + nextid.to_s + "','" + machine['name'] + "','" + machine['machineType'] + "','" + machine['templete'] + "','" + machine['comment'] + "');");
		sql(SELECT,"select id from machine where id= #{nextid}").each do |id|
			sqlid = id
		end

		if (sqlid == nextid ) then
			msg = { "mode" => MACHINE, "msg" => "success"} 
			
		else
			msg = { "mode" => MACHINE, "msg" => "failed"}
		end

=end
		msg = { "mode" => MACHINE, "msg" => {"msgType" => "report", "msg" => "jailへの登録が完了しました。"} } 
		send(ws,STATUS,msg)
		sleep(1)
		msg = { "mode" => MACHINE, "msg" => {"msgType" => "report", "msg" => "データベースへの登録が完了しました。"} } 
		send(ws,STATUS,msg)
		sleep(1)
		msg = { "mode" => MACHINE, "msg" => {"msgType" => "success", "msg" => "完了しました。"} } 
		send(ws,STATUS,msg)



	end



end
