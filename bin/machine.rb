#!/usr/local/bin/ruby
# -*- coding: utf-8 -*-

def machine (ws,data)
	machineList = { }
	sqlid = 0
	id = 1


	if (data["mode"] == "select") then

		if (data["id"] == "all") then
			#マシン情報を送信,dummyは送らない(id != 0)
			maxid = SQL.select("maxid")
		
			while id <= maxid do #|id, name, type, templete, comment|
				SQL.select("machine",id) do |id, name, type, templete, flavour, comment|
					machineList["key#{id}"] = {"id" => id.to_s, "name" => name, "type" => type.to_s, "templete" => templete.to_s, "flavour" => flavour.to_s, "comment" => comment}
				end
				id += 1
			end
			if (machineList == {})
				SendMsg.machine("list","none")
			else	
				SendMsg.machine("list",machineList)
			end
			id = 1
		else

		end

	elsif (data["mode"] == "new") then

		machine = data["machine"] #machineを入れる

		cmdLog = Jail.create(machine)

		if(cmdLog == false)
			SendMsg.status(MACHINE,"failed","jailへの登録に失敗")
			return
		end

		nextid = SQL.select("maxid") + 1
		SQL.insert(machine)
		SQL.select("machine",nextid) do |id|	#作成したmachineのIDを取得
			sqlid = id
		end

		if (sqlid != nextid ) then #sqlidがnextidではない（恐らくnextid-1)場合は、machineが正常に作成されていない
			SendMsg.status(MACHINE,"failed","machineの作成に失敗")

		else
			SendMsg.status(MACHINE,"success","完了しました。")
			
		end

	elsif (data["mode"] == "pkg" ) then
		if (data["control"] == "search") then
			Pkg.search(data["name"]).each_line do |pname|
				pname = pname.chomp
				puts pname
			end
		end
	end

		
end


=begin
	msg = { "mode" => MACHINE, "msg" => {"msgType" => "report", "msg" => "データベースへの登録が完了しました。"} } 
			send(ws,STATUS,msg)

			msg = { "mode" => MACHINE, "msg" => {"msgType" => "report", "msg" => "jailへの登録が完了しました。"} } 
			{send(ws,STATUS,msg)

=end