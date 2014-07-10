#!/usr/local/bin/ruby

require 'open3'
require './jail.rb'
require './vitocha/vitocha.rb'
require 'sqlite3'
require 'json'

include SQLite3

db_file = "/usr/jails/gvitocha.db"
@@db = Database.new(db_file)

$jails = "/usr/jails"
upjail = Array.new
dbjail = Array.new
state = Array.new
str = Array.new
snum = 0
s,e = Open3.capture3("jls |grep #{$jails}")	#Path($jails)が含まれているものを抜き出せば最初の行を取り除ける

s.each_line do |line|
	str = line.split(" ")
	str.each do |sstr|
		if (snum%4 == 2) then
			upjail << sstr
		end
		snum += 1
	end
end

upjail.delete_at(0)	#masterRouterを除く

dbjail = @@db.execute("select name from machine order by id asc ;")
dbjail.delete_at(0)
dbjail.delete_at(0)	#dummyとmasterRouterを除く

dbjail.each do |odbjail|
	odbjail = odbjail[0]
	flag = false
	upjail.each do |oupjail|
		if (odbjail == oupjail) then
			flag = true
		end
	end
	if (flag == true) then
		state << ["name" => "#{odbjail}", "state" => "1"]
	else
		state << ["name" => "#{odbjail}", "state" => "0"]
	end
end

puts state
