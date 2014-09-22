#!/usr/local/bin/ruby
# -*- coding: utf-8 -*-

def machine (data)

	if (data["mode"] == "jail") then
		Jail.main(data)


	elsif (data["mode"] == "pkg" ) then
		Pkg.main(data)


	elsif (data["mode"] == "template") then
		Templete.main(data)
	end 

end
