#!/usr/local/bin/ruby

require 'open3'
ports = "/usr/ports"
name = ARGV[0]


apkg = Array.new
column = Array.new
flag = false
s,e = Open3.capture3("cd #{ports}/;make search name=#{name}")
s = s.split("\n")
s.each do |line|
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
	#puts "name:#{pkg[0]},path:#{pkg[1]}"
	puts pkg[1]
end