#!/usr/local/bin/ruby
# -*- coding: utf-8 -*-

class Templete

	def self.main(data) 
		if(data["control"] == "create") then
			create(data["msg"])
			SendMsg.status(MACHINE,"success","完了しました")
		
		elsif(data["control"] == "select") then
			tmpList = {}
			templete = select(data["id"])
			templete.each do |tmp|
				puts "id:#{tmp[0]}, name:#{tmp[1]}, pkg:#{tmp[2]}"
				tmpList["key#{tmp[0]}"] = {"id" => tmp[0].to_s, "name" => tmp[1], "pkg" => tmp[2] }
			end
			SendMsg.machine("templete","list",tmpList)
		end


	end

	def self.create(data)
		SQL.insert("templete",data)
		return true
	end

	def self.select(id)
		templete = Array.new
		if(id == "all") then
			maxid = SQL.select("templete","maxid")
			num = 0
			while (num <= maxid) do 
				templete << SQL.select("templete",num)	
				num += 1
			end
			return templete
		else

		end
	end
end