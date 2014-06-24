#!/usr/local/bin/ruby
# -*- coding: utf-8 -*-

require 'rubygems'
require 'sqlite3'
require 'json'

include SQLite3


def sql(mode,sql)
	db = Database.new("/jails/gvitocha.db")
	
	if(mode == "MAXID") then
		return db.execute("select max(id) from machine")
	else
		return db.execute(sql)
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