#!/bin/sh

eval gvitocha_dir=`dirname $0`
cd ${gvitocha_dir}

bundle install

echo "-----------------------------------"
echo "Please type following command."
echo ""
echo 'echo "[devfsrules_jail=50]" >> /etc/devfs.rules'
echo "pkg install sqlite3"
echo "pkg install python27"
echo "pkg install qjail"
echo "-----------------------------------"
