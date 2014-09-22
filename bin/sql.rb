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
			SendMsg.status(STATUS,"report","初期起動です。初期設定を行います。")
			@@db.execute("create table machine (id integer, name text, type integer, template id, flavour id, comment text, jid integer);")
			@@db.execute("create table template(id integer, name text, pkg text);")
			@@db.execute("create table flavour (id integer, name text);")
			@@db.execute("create table pkg(id integer, name text);")
			@@db.execute("create table easyConf(type integer, id integer, template integer, flavour integer);")
			@@db.execute("insert into template (id, name, pkg) values (0, 'default', '');")
			@@db.execute("insert into template (id, name, pkg) values (1, 'router', 'quagga-0.99.22.4_3');")
			@@db.execute("insert into flavour (id, name) values (0, 'default');")
			@@db.execute("insert into pkg(id, name) values (1, 'quagga-0.99.22.4_3');")
			@@db.execute("insert into easyConf(type, id, template, flavour) values (#{SERVER.to_s}, 0, 0, 0);")
			@@db.execute("insert into easyConf(type, id, template, flavour) values (#{ROUTER.to_s}, 0, 0, 0);")
			@@db.execute("insert into easyConf(type, id, template, flavour) values (#{SWITCH.to_s}, 0, 0, 0);")

			@@db.execute("insert into machine (id, name, type, template, flavour, comment) values ( -1, 'dummy', 0, 0, 0, 'dummy');")
		
			machine = {"name" => "masterRouter", "machineType" => ROUTER.to_s, "template" => "1", "flavour" => "0","comment" => "masterRouter" }
	
	#		s,e = Open3.capture3("mkdir #{$jails}/basejail/pkg")
	#		s,e = Open3.capture3("mkdir #{$jails}/flavours/default")
	#		s,e = Open3.capture3("ln -s /basejail/pkg #{$jails}/flavours/default/pkg")
	#		s,e = Open3.capture3("cp /usr/local/sbin/pkg-static #{$jails}/basejail/usr/sbin/pkg-static")

	#		s,e = Open3.capture3("qjail create -f default -4 0.0.0.0 masterRouter")

			puts "quagga download..."
	#		Pkg.download("quagga-0.99.22.4_1")

			Jail.create(machine)
			Jail.start("masterRouter")
			s,e = Open3.capture3("ln -s /sharedfs/pkg #{$jails}/masterRouter/pkg")

			
=begin
			tomocha=Operator.new
			router=Router.new("masterRouter")		#tomochaを呼び、machineを作る

			epaira,epairb = tomocha.createpair
			ifconfig(epaira+" up")
			router.connect(epairb) # connect to realhost
			router.up(epairb)
			router.start("quagga")
=end
		end		
  	end

	def self.sql(str)
		begin
			return @@db.execute(str)
		rescue
			puts "sql error:#{str}"
			return false
		end
	end

	def self.select(mode,id=nil,name=nil)
		begin
		if (mode == "pkg") then
			if (id == "maxid")
				return @@db.execute("select max(id) from pkg")[0][0]		#maxid
			else
				return @@db.execute("select id, name from pkg where id=" + id.to_s + ";")[0]
			end

		elsif (mode =="template") then 
			if (id == "maxid") then
				return @@db.execute("select max(id) from template")[0][0]		#maxid
			else
				return @@db.execute("select id, name, pkg from template where id=#{id};")[0]
			end

		elsif (mode == "machine") then
			if (id == "all")
				return @@db.execute("select id, name, type, template, flavour, comment from machine")
			elsif (id == "maxid")
				return @@db.execute("select max(id) from machine")[0][0]		#maxid
			elsif (id == "name")
				return @@db.execute("select id, name, type, template, flavour, comment from machine where name='" + name + "';")[0]
			else
				machine = @@db.execute("select id, name, type, template, flavour, comment from machine where id=" + id.to_s + ";")[0]
				yield machine[0],machine[1],machine[2],machine[3],machine[4],machine[5]	#machineのデータ返却
			end
		elsif (mode == "flavour") then
			return @@db.execute("select name from flavour where id = #{id}")[0][0]

		elsif (mode == "easyConf")
				return @@db.execute("select type, id, template, flavour from easyConf where type='" + id.to_s + "';")[0]
		end
		rescue
			return false
		end
	end

	def self.insert(table,data)
		maxid = @@db.execute("select max(id) from #{table}")[0][0]		#maxid

		if(table == "machine") then
			sql = "insert into machine (id, name, type, template, flavour, comment) values ('" + (maxid+1).to_s + "','" + data['name'] + "','" + data['machineType'] + "','" + data['template'] + "','" + data['flavour'] + "','" + data['comment'] + "');"
		elsif(table == "pkg") then
			sql = "insert into pkg (id,name) values ('" + (maxid+1).to_s + "','" + data + "');"
		elsif(table == "template") then
			sql = "insert into template(id,name,pkg) values('" + (maxid+1).to_s + "','" + data["name"] + "','" + data["pkglist"] + "');"
		end

		return @@db.execute(sql)

	end

	def self.delete(table,data)
		
		if(table == "machine") then
			sql = "delete from machine where name='"+ data + "';"
		end

	#	puts sql

		return @@db.execute(sql)
	end

	def self.update(table,data)

		if(table == "easyConf") then
			sql = "update easyConf set id=" + data["id"].to_s + ", template=" + data["template"].to_s + ", flavour=" + data["flavour"].to_s + " where type=" + data["type"].to_s + ";"
		end

		return @@db.execute(sql)
	end
end

=begin

#テーブル追加
#create table machine (id integer, name text, type integer, template text, comment text);

#カラム追加
#insert into machine (id, name, type, template, comment) values (0, "testmachine", 0,  "minimum", "testMachineだよ");

#カラムの内容を変更する際、カラムの削除ができないため、元のテーブルをtmpなり変更し、新しいテーブルを作成し、from で移行する必要がある。
sqlite> alter table machine rename to table_tmp;
sqlite> create table machine (id integer, name text, type integer, template text, comment text) ;
sqlite> insert into machine select id, name, type, template, comment from table_tmp;
sqlite> drop table table_tmp;



=end