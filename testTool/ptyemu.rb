=begin
require 'pty'
cmd = ""

def ppty(cmd)
  begin
    PTY.spawn( cmd ) do |stdin, stdout, pid|
      begin
        # Do stuff with the output here. Just printing to show it works
        stdin.each { |line| print line }
      rescue Errno::EIO
        puts "Errno:EIO error, but this probably just means " +
              "that the process has finished giving output"
      end
    end
  rescue PTY::ChildExited
    puts "The child process exited!"
  end
end


if __FILE__ == $0
  while 1
    print ">"
    cmd = gets
    cmd.chomp!
    ppty(cmd)
  end
end
=end

require 'pty'

def handle_escape(io)
  actions = 'ABCDEFGHJKSTfmnsulh'
  str, action = '', nil
  loop do
    c = io.read(1)
    if actions.include? c
      action = c
      break
    else
      str += c
    end
  end
  case action
  when 'J'
    ChumbyScreen.x = 0
  end
end

system '[ -e /dev/tty0 ] || mknod /dev/tty0 c 4 0'
shell = PTY.spawn 'env TERM=ansi COLUMNS=63 LINES=21 sh -i'
shell[1].puts("cat\nasdf")
s = shell[0].read(16)
puts s

Thread.new do
  k = open '/dev/tty0', File::RDONLY
  loop do
    shell[1].write k.read(1)
  end
end.priority = 1

loop do
  c = shell[0].read(1)
  if c == "\e"
    c2 = shell[0].read(1)
    if c2 == '['
      handle_escape shell[0]
      next
    else
      c += c2
    end
  end
  ChumbyScreen.write c
end