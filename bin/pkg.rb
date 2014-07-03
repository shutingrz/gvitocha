# -*- coding: utf-8 -*-

class Pkg
	def self.add(jname,pname)
		puts "pkg-static -j #{jname} add /pkg/#{pname}.txz"
		s,e = Open3.capture3("pkg-static -j #{jname} add /pkg/#{pname}.txz")
	end

	def self.search(pname)	#host側でやらせる
		s,e = Open3.capture3("pkg-static search #{pname}")
		return s
	end

	def self.install(pname)	#host側でやらせる
		puts("download #{pname}")
		s,e = Open3.capture3("echo y|pkg-static fetch #{pname}")		#リポジトリからパッケージを取得
		cmdLog,e = Open3.capture3("ls /var/cache/pkg/All/#{pname}.txz")
		cmdLog = cmdLog.chomp	#改行削除
		puts ("#{cmdLog} ?? /var/cache/pkg/All/#{pname}.txz")
		if(cmdLog != "/var/cache/pkg/All/#{pname}.txz")
			puts ("download error")
			return false,"download"
		end
		puts("...end")
		
		puts("copy")
		s,e = Open3.capture3("cp -pn /var/cache/pkg/All/* #{$jails}/basejail/pkg/")	#basejailにコピー
		cmdLog,e = Open3.capture3("ls #{$jails}/basejail/pkg/#{pname}.txz")
		cmdLog = cmdLog.chomp	#改行削除
		if(cmdLog != "#{$jails}/basejail/pkg/#{pname}.txz")
			return false,"copy"
		end
		puts("...end")

		nextid = SQL.select("pkg","maxid") + 1
		SQL.insert("pkg",pname)
		sqlid = SQL.select("pkg",nextid)[0]	#作成したpkgのIDを取得
		puts("sqlid = #{sqlid}")


		if (sqlid != nextid ) then #sqlidがnextidではない（恐らくnextid-1)場合は、データベースが正常に作成されていない
			return false,"database"
		end

		return true
	end

	def self.list(mode)
		if (mode == "all") then
			return SQL.sql("select name from pkg")
		end
	end

end