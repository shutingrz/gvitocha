#!/usr/local/bin/ruby
# -*- coding: utf-8 -*-

def machine (ws,data)

	if (data["mode"] == "jail") then
		Jail.main(data)


	elsif (data["mode"] == "pkg" ) then
		Pkg.main(data)


	elsif (data["mode"] == "templete") then
		Templete.main(data)
	end 

end
