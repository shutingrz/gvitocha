#!/usr/local/bin/ruby

def machine (ws,data)
	machineList = { }

	num = 0

	if (data == INIT) then
		#マシン情報を送信
		sql(SELECT,"select id, name, type, templete, comment from machine").each do |id, name, type, templete, comment|
			machineList["key#{num}"] = {"id" => id.to_s, "name" => name, "type" => type.to_s, "templete" => templete, "comment" => comment}
			num += 1
		end
		send(ws,MACHINE,machineList)
		num = 0
	elsif (data["mode"] == "new") then
		machine = data["machine"]
		maxid = sql("MAXID","dummy")[0][0]
		puts "maxid: #{maxid}"
	#	sql("insert into machine (id, name, type, templete, comment) values ('" + machine["name" +"');

	end



end
