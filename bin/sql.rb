#!/usr/local/bin/ruby
# -*- coding: utf-8 -*-

require 'rubygems'
require 'sqlite3'
require 'json'

include SQLite3

class SQL

	@@db = nil

	def initialize()
		db_file = "/usr/jails/gvitocha.db"
    	begin
			@@db = Database.new(db_file)
		rescue SQLite3::CantOpenException
			puts "cant open sqlite database."
			return false
		end

		begin
			@@db.execute("select * from machine;")
		rescue SQLite3::SQLException	#machineテーブルがない場合、初期状態とみなし、各テーブルをcreateし、insertし、masterRouterを作成
			@@db.execute("create table machine (id integer, name text, type integer, templete id, flavour id, comment text, jid integer);")
			@@db.execute("create table templete(id integer, name text, pkg text);")
			@@db.execute("create table flavour (id integer, name text);")
			@@db.execute("create table pkg(id integer, name text);")
			@@db.execute("insert into templete (id, name, pkg) values (0, 'default', '');")
			@@db.execute("insert into templete (id, name, pkg) values (1, 'router', 'quagga-0.99.22.4_1');")
			@@db.execute("insert into flavour (id, name) values (0, 'default');")
			@@db.execute("insert into pkg(id, name) values (1, 'quagga-0.99.22.4_1');")

			@@db.execute("insert into machine (id, name, type, templete, flavour, comment) values ( 0, 'masterRouter', 1, 1, 0, 'master router');")
		
			machine = {"name" => "masterRouter", "machineType" => 1, "templete" => 1, "flavour" => 0 }
			
			s,e = Open3.capture3("./vitocha/mkrouter masterRouter")
			s,e = Open3.capture3("pkg-static -j masterRouter add /pkg/quagga-0.99.22.4_1.txz")

			tomocha=Operator.new
			router=Router.new("masterRouter")		#tomochaを呼び、machineを作る

			epaira,epairb = tomocha.createpair
			ifconfig(epaira+" up")
			router.connect(epairb) # connect to realhost
			router.up(epairb)
			router.start("quagga")
		end		
  	end

	def self.sql(str)
		begin
			return @@db.execute(str)
		rescue
			puts "sql error"
		end
	end

	def self.select(mode,id=nil)
		if (mode == "maxid")
			return @@db.execute("select max(id) from machine")[0][0]		#maxid
		elsif (mode == "pkg") then
			return @@db.execute("select pkg from templete where id=#{id};")[0][0].split(/,/)
		elsif (mode == "machine") then
			machine = @@db.execute("select id, name, type, templete, flavour, comment from machine where id=" + id.to_s + ";")[0]
			yield machine[0],machine[1],machine[2],machine[3],machine[4],machine[5]	#machineのデータ返却
		end
	end

	def self.insert(machine)
		maxid = @@db.execute("select max(id) from machine")[0][0]		#maxid
		return @@db.execute("insert into machine (id, name, type, templete, flavour, comment) values ('" + (maxid+1).to_s + "','" + machine['name'] + "','" + machine['machineType'] + "','" + machine['templete'] + "','" + machine['flavour'] + "','" + machine['comment'] + "');");
	end

end

=begin

#テーブル追加
#create table machine (id integer, name text, type integer, templete text, comment text);

#カラム追加
#insert into machine (id, name, type, templete, comment) values (0, "testmachine", 0,  "minimum", "testMachineだよ");

#カラムの内容を変更する際、カラムの削除ができないため、元のテーブルをtmpなり変更し、新しいテーブルを作成し、from で移行する必要がある。
sqlite> alter table machine rename to table_tmp;
sqlite> create table machine (id integer, name text, type integer, templete text, comment text) ;
sqlite> insert into machine select id, name, type, templete, comment from table_tmp;
sqlite> drop table table_tmp;



=end