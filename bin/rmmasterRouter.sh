#!/bin/sh
ezjail-admin stop masterRouter

umount /usr/jails/masterRouter/dev/
umount /usr/jails/masterRouter/basejail/

ezjail-admin delete masterRouter
rm -rd /usr/jails/masterRouter
rm /usr/jails/gvitocha.db
ifconfig epair0a destroy
