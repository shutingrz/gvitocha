require 'em-websocket'
require 'open3'
pname = "vim-7.4.430_2"
s = ""
output = ""

if __FILE__ == $0 then
	out = StringIO.new
#	$stdout = out
#	$stdout = File.open("x.txt", "w") 
#	EventMachine::defer do
    #	Open3.pipeline("echo y|pkg-static fetch #{pname}")
IO.popen("echo aaa ;sleep 1 ; echo bbb") do |pipe|
    pipe.each do | line |
         print line
    end
end
puts "aaaaa"
	#	s,e = Open3.capture3("echo aaaa")
#	end
#	puts "out = #{out.string}"
=begin
	while(1) do
		puts output
		sleep 1
	end
=end
	
end