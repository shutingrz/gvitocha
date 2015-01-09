#!/usr/local/bin/ruby
# -*- coding: utf-8 -*-

class Templete

	def self.main(data) 
		if(data["control"] == "create") then
			create(data["msg"])
			SendMsg.status(MACHINE,"success","完了しました")
		
		elsif(data["control"] == "select") then
			tmpList = {}
			template = select(data["id"])
			template.each do |tmp|
				tmpList["key#{tmp[0]}"] = {"id" => tmp[0].to_s, "name" => tmp[1], "pkg" => tmp[2] }
			end
			SendMsg.machine("template","list",tmpList)
		end


	end

	def self.create(data)
		#";"で区切られた任意のpkgの数の文字列が格納される
		SQL.insert("template",data)
		return true
	end

	def self.select(id)
		template = Array.new
		if(id == "all") then
			maxid = 0
			maxid = SQL.select("template","maxid")
			num = 0
			while (num <= maxid) do 
				template << SQL.select("template",num)	
				num += 1
			end
			return template
		else

		end
	end
end