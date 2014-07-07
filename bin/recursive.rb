#!/usr/local/bin/ruby

require 'open3'
ports = "/usr/ports"
path = ARGV[0]
db = Array.new

def recPkg(db,pkg)
	s,e = Open3.capture3("cd #{pkg};make build-depends-list")
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

recPkg(db,path)
db.sort!
puts db


=begin
		if (line.index("ports-mgmt/pkg") != nil) then
			next
		end



		$column.each do |column|
			column = column.chomp
			puts "#{column} ?? #{line}"
			if (column.include?(line) == true) then
				puts "=>true"
				return
			end
		end

=end