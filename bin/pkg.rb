# -*- coding: utf-8 -*-



class Pkg

	@pkgDir
	@jailDir

	def self.init()
		@pkgDir = System.getConf("pkgDir")
		@jailDir = System.getConf("jailDir")
	end

	def self.main(data)
		if (data["control"] == "search") then
			search(data["name"]).each_line do |pname|
				pname = pname.chomp
				SendMsg.machine("pkg","search",pname)
			end

		elsif(data["control"] == "list") then
			pkg = list("all")
			pkg.each do |pname|
				SendMsg.machine("pkg","list",pname[0])
			end

		elsif(data["control"] == "install") then
			cmdLog,cause = install(data["name"])

			if(cmdLog == false)
				SendMsg.status(MACHINE,"failed",cause)
				return
			else
				SendMsg.status(MACHINE,"success","完了しました。")
			end	
		end

	end
	def self.add(jname,pname)
		puts "pkg-static -j #{jname} add /pkg/#{pname}.txz"
		s,e = Open3.capture3("pkg-static -j #{jname} add /pkg/#{pname}.txz")
	end

	def self.search(pname)	#host側でやらせる
		s,e = Open3.capture3("pkg-static search #{pname}")
		return s
	end

	def self.download(pname)
		flag = false
		pkgVal = 0
		now = 1
		IO.popen("echo y|pkg-static fetch -d #{pname}") do |pipe|
    		pipe.each do | line |
    	#		puts line
    			if(line.include?("New packages to be FETCHED:")) then	#ダウンロードするパッケージの数を計算(NEw packages〜からThe process〜までの行数)
    				flag = true
    			end
    			if(line.include?("The process will require")) then
    				pkgVal -= 2
    				flag = false
    			end
    			if(flag == true) then
    				pkgVal += 1
    			end
    		    if(line.include?("Fetching")) then
    		    	if(line.include?("Proceed with fetching packages? [y/N]: ")) then
    		    		line.gsub!("Proceed with fetching packages? [y/N]: ","")
    		    	end
    		     	SendMsg.status(MACHINE,"log","#{line}(#{now}/#{pkgVal})")
    		     	now += 1
    		    end
    		end
		end
		cmdLog,e = Open3.capture3("ls #{@jailDir}/sharedfs/pkg")
		s,e = Open3.capture3("cp -pn #{@pkgDir}/* #{@jailDir}/sharedfs/pkg/")	#sharedfsにコピー(qjail)
		cmdLog2,e = Open3.capture3("ls #{@jailDir}/sharedfs/pkg")
=begin
		if(cmdLog == cmdLog2)		#ダウンロード前後にlsの結果を取って、要素が同じならばダウンロードに失敗しているとわかる（ファイルが増えていない）
			puts ("pkgcopyerror")
			return false,"pkgcopy"
		end
=end
	end

	def self.install(pname)	#host側でやらせる

		cmdLog, cause = download(pname)

		SendMsg.status(MACHINE,"report","pkgdownload")
		
		
		cmdLog,e = Open3.capture3("ls #{@jailDir}/sharedfs/pkg/#{pname}.txz")
		cmdLog = cmdLog.chomp	#改行削除
		if(cmdLog != "#{@jailDir}/sharedfs/pkg/#{pname}.txz")
			return false,"copy"
		end
		
		SendMsg.status(MACHINE,"report","pkgcopy")

		nextid = SQL.select("pkg","maxid") + 1
		SQL.insert("pkg",pname)
		sqlid = SQL.select("pkg",nextid)[0]	#作成したpkgのIDを取得

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