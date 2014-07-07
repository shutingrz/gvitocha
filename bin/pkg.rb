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

	def self.download(pname)
		SendMsg.status(MACHINE,"log","downloading #{pname}...")
		cmdLog,e = cmdLog,e = Open3.capture3("ls /var/cache/pkg/All")
		s,e = Open3.capture3("echo y|pkg-static fetch #{pname}")		#リポジトリからパッケージを取得
		cmdLog2,e = Open3.capture3("ls /var/cache/pkg/All")

		if(cmdLog == cmdLog2)		#ダウンロード前後にlsの結果を取って、要素が同じならばダウンロードに失敗しているとわかる（ファイルが増えていない）
			puts ("error")
			return false,"download"
		end
		SendMsg.status(MACHINE,"log","ok<br>")
	end

	def self.install(pname)	#host側でやらせる
	
		dePkg = recursiveList(pname)		#depends Pkg
		dePkg.each do |depkg|
			cmdLog,cause = download(depkg)
			if (cmdLog == false)
				return cmdLog,cause
			end
		end
		download(pname)
		$msg = ""
		
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

	def self.recursiveList(pname)
		ports = "/usr/ports"
		path = ""		#実際に入れるパッケージのパス
	#指定されたパッケージのパスを検索するパート
		apkg = Array.new
		column = Array.new
		flag = false
		s,e = Open3.capture3("cd #{ports}/;make search name=#{pname}")
		s = s.split("\n")
		s.each do |line|	#念のため出現するパッケージが2つ以上と仮定しているが、実際に返すのは１つのみ。デバッグ用に複数入れるためのapkgを残している
			if(line.index("Port:") != nil) then
				column << line.gsub("Port:	","")
				flag = true
				next
			end
			if(flag == true) then
				if(line.index("Path:") != nil) then
					column << line.gsub("Path:	","")
					apkg << column
					column = []
					flag = false
				end
			end
			if(line == "\n") then
				flag = false
				column = []
			end
		end
		apkg.sort!
		apkg.each do |pkg|
			puts "pname:#{pkg[0]}　　　path:#{pkg[1]}"
			path = pkg[1]
		end
	#ここまで

		db = Array.new
		recPkg(db,path)
		db.sort!
		puts db
		return db

	end

	def self.recPkg(db,pname)		#依存関係を全て探索する再帰的な関数
		s,e = Open3.capture3("cd #{pname};make build-depends-list")
		s.each_line do |line|
			flag = false		#重複してたよフラグ
			line = line.chomp
			db.each do |column|
				if (line.include?(column) == true) then
					flag = true		#重複してたよ
					break
				end
			end
			if(flag == false) then	#重複していない場合はdbに依存情報を挿入
				db << line.gsub("/usr/ports/","")	
				recPkg(db,line.chomp)
			end
		end
	end

end