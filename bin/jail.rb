# -*- coding: utf-8 -*-


class Jail

	def initialize()

	end

	def self.create(machine)
		puts machine['machineType']
		if machine['machineType'] == SERVER.to_s then
			s,e = Open3.capture3("./vitocha/mkserver #{machine['name']}")
		else
			s,e = Open3.capture3("./vitocha/mkrouter #{machine['name']}")
		end

		cmdLog = Open3.capture3("ezjail-admin list|grep #{machine['name']}")	#ezjail-admin listに載っていたら正常
		if(cmdLog == "")
			return false
		end
	
		SQL.select("pkg",machine['templete']).each do |pname|
			puts "#{pname} adding..."
			Pkg.add(machine['name'], pname)		#templeteに入っている全てのpkgをインストール
		end
	end

end