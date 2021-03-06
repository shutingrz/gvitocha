#概要
FreeBSD上で動作するコンテナ技術であるJailと、仮想インターフェイスのVIMAGEをWebインターフェイスから操作可能にするシステムです。  
このリポジトリは実験用です。コミットのタイミングによっては動かないバージョンもあります。  
安定版はそのうちリリースします。

#システム要件
* FreeBSD10.x (64bitシステム推奨)
* メモリ1GB以上

##依存関係
以下のソフトウェアの設定・インストールを予め済ませておいてください。
###VIMAGE
カーネルコンパイルが必要です。

* (64bitシステムの場合)  
\#vi /usr/src/sys/amd64/conf/VIMAGE  

* (32bitシステムの場合)  
\#vi /usr/src/sys/i386/conf/VIMAGE

上記ファイルに以下の3行を記述します。
> 
ident VIMAGE  
include GENERIC  
options VIMAGE  


\#cd /usr/src  
\#make buildkernel KERNCONF=VIMAGE  
\#make installkernel KERNCONF=VIMAGE  
\#reboot

###Ruby2.0
\#pkg install ruby

###RubyGems
\#pkg install ruby20-gems  
\#gem update --system  

###bundler
\#gem install bundler

###SQLite3
\#pkg install sqlite3

###python2.7
\#pkg install python27

###qjail
\#pkg install qjail
\#qjail install

###Encoding
端末の文字コードをUTF-8に変更してください。

\#vi ~/.cshrc  
> 
setenv  LC_CTYPE en_US.UTF-8  
setenv  LANG     en_US.UTF-8

###devfs.rules
devfsのルールセット、50番をdevfs.rulesに追加します。  
ルールセット1行のみだと全てのデバイスがJailに見えるようになります。  
ルールセットの中身は都合に合わせて追記してください。

\#echo "[devfsrules_jail_gvit=50]" >> /etc/devfs.rules
\#echo "add include $devfsrules_jail" >> /etc/devfs.rules
\#service devfs restart

#設定ファイル
./bin/conf/gvit.confに設定ファイルがあるので自分の環境に合わせて修正してください。  
特にPythonのパスとpkgngのキャッシュのパスに注意してください。  
修正する場合は各パラメータのコメントアウトを外してください。  

#インストール
\#git clone https://github.com/shutingrz/gvitocha  
\#cd gvitocha  
\#bundle install  

#起動
\#ruby bin/gvitocha.rb
> websoket server start.  

と表示が出れば起動は完了です。  
クライアント側でht-docs以下のindex.htmlをWebブラウザ(Firefox推奨)で開いて表示してください。

#License
##./bin/*.rb
BSDライセンス。  

Copyright (c) 2014, Shuto Imai
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

##./ht-docs/*
Copyright (c) 2014, Shuto Imai
All rights reserved.
GPL 2.0

##./bin/third/webshell.py
Copyright (c) 2014, Shuto Imai
All rights reserved.
GPL 2.0