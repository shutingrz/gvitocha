#!/usr/local/bin/ruby
# -*- coding: utf-8 -*-

require 'rubygems'
require 'sqlite3'
require 'json'

include SQLite3


def sql(mode,id)
	db_file = "/usr/jails/gvitocha.db"


#初期化
	begin
		db = Database.new(db_file)
	rescue SQLite3::CantOpenException
		puts "cant open sqlite database."

	end

	begin
		db.execute("select * from machine;")
	rescue SQLite3::SQLException	#machineテーブルがない場合、初期状態とみなし、各テーブルをcreateし、insertし、masterRouterを作成
		db.execute("create table machine (id integer, name text, type integer, templete id, flavour id, comment text, jid integer);")
		db.execute("create table templete(id integer, name text, pkg text);")
		db.execute("create table flavour (id integer, name text);")
		db.execute("create table pkg(id integer, name text);")
		db.execute("insert into templete (id, name, pkg) values (0, 'default', '0');")
		db.execute("insert into templete (id, name, pkg) values (1, 'router', 'quagga-0.99.22.4_1');")
		db.execute("insert into flavour (id, name) values (0, 'default');")
		db.execute("insert into pkg(id, name) values (1, 'quagga-0.99.22.4_1');")

		db.execute("insert into machine (id, name, type, templete, flavour, comment) values ( 0, 'masterRouter', 1, 1, 0, 'master router');")
		
		mkjail(ROUTER,"masterRouter",0)
		tempnum = db.execute("select templete from machine where id = 0;")[0][0]	#masterRouterのtemplete idを取得
		pkgnum =  db.execute("select pkg from templete where id = #{tempnum};")[0][0]	#templete idのpkg一覧を表示

		
		s,e = Open3.capture3("pkg-static -j masterRouter add /pkg/quagga-0.99.22.4_1.txz")
		puts s
		puts e
	#	db.execute("select pkg from templete where id=1;")[0][0].split(/,/).each do |pname|
	#		puts "#{pname} adding..."
	#		pkg("add", "masterRouter", pname)
	#	end



		tomocha=Operator.new
		router=Router.new("masterRouter")		#tomochaを呼び、machineを作る

		epaira,epairb = tomocha.createpair
		ifconfig(epaira+" up")
		router.connect(epairb) # connect to realhost
	#	router.assignip("epair0b","192.168.11.254","255.255.255.0") 
	#	tomocha.register("epair0b","router0","192.168.11.254","255.255.255.0") # you need this if you did not use $tomocha.assignip .
		router.up(epairb)
		router.start("quagga")
	end		

#初期化ここまで
	maxid = db.execute("select max(id) from machine")[0][0]		#maxid

	if(mode == "select") then
		if(id == "maxid") then		
			return maxid 	
		else
			machine = db.execute("select id, name, type, templete, comment from machine where id=" + id.to_s + ";")[0]
			yield machine[0],machine[1],machine[2],machine[3],machine[4]	#machineのデータ返却
		end
	elsif(mode == "insert") then
		machine = id
		db.execute("insert into machine (id, name, type, templete, comment) values ('" + (maxid+1).to_s + "','" + machine['name'] + "','" + machine['machineType'] + "','" + machine['templete'] + "','" + machine['comment'] + "');");
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


{
	"msgType":3,
	"data":
		{
			"0":{
				"id":"0",
				"name":"testmachine",
				"type":0,
				"templete":"minimum",
				"comment":"testMachineだよ"
				},
			"1":{
				"id":"1",
				"name":"testrouter",
				"type":"router",
				"templete":"minimum",
				"comment":"testMachine2だよ"
				},
			"2":
				{
				"id":"2",
				"name":"testswitch",
				"type":"switch",
				"templete":"minimum",
				"comment":"testMachine3だよ"
				}
		}
}


=end