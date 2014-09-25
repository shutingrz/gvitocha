require '../bin/pkg.rb'
require 'open3'
pname = "vim"
=begin
dePkg = Pkg.recursiveList(pname)		#depends Pkg
		dePkg += pname

path = "/usr/ports/editors/vim"

db = Array.new
		Pkg.recPkg(db,path)
		db.sort!
		puts db
=end
column = Array.new
apkg = Array.new
ports = "/usr/ports"
s,e = Open3.capture3("cd #{ports}/;make search name=#{pname}")
	#	puts s
		s = s.split("\n")
		s.each do |line|	#念のため出現するパッケージが2つ以上と仮定しているが、実際に返すのは１つのみ。デバッグ用に複数入れるためのapkgを残している
				if(line.index("Path:") != nil) then
					line = line.gsub("Path:	","")
					column << line.gsub("#{ports}/","")
					apkg << column
					column = []
					flag = false
				end
		end
		puts apkg