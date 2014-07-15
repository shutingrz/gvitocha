#!/bin/sh
ifconfig bridge create
ifconfig bridge0 vnet switch
ifconfig epair create
ifconfig epair create
ifconfig epair create
ifconfig epair0a 192.168.20.1/24 up
ifconfig epair0b vnet switch
jexec switch ifconfig bridge0 192.168.20.254/24 up
jexec switch ifconfig epair0b up
jexec switch ifconfig bridge0 addm epair0b

ifconfig epair1a vnet server01
ifconfig epair1b vnet switch
jexec server01 ifconfig epair1a 192.168.20.11/24 up
jexec switch ifconfig epair1b up
jexec switch ifconfig bridge0 addm epair1b

ifconfig epair2a vnet server02
ifconfig epair2b vnet switch
jexec server02 ifconfig epair2a 192.168.20.12/24 up
jexec switch ifconfig epair2b up
jexec switch ifconfig bridge0 addm epair2b
