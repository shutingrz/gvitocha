# -*- coding: utf-8 -*-

class Pkg
	def self.add(jname,pname)
		puts "pkg-static -j #{jname} add /pkg/#{pname}.txz"
		s,e = Open3.capture3("pkg-static -j #{jname} add /pkg/#{pname}.txz")
	end

	def self.search(pname)	#host側でやらせる
		s,e = Open3.capture3("pkg-static search #{pname}")
		return s
	end

	def self.install(pname)	#host側でやらせる
		s,e = Open3.capture3("pkg-static fetch #{pname}")
		s,e = Open3.capture3("cp /var/cache/pkg/All/#{pname}.txz #{$jails}/basejail/pkg/")
	end

end