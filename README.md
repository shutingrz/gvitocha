#依存関係
以下のソフトウェアの設定・インストールを予め済ませておいてください。
##VIMAGE
カーネルコンパイルが必要です。


\#vi /usr/src/sys/amd64/conf/VIMAGE
> 
ident VIMAGE  
include GENERIC  
ptions VIMAGE  

\#cd /usr/src  
\#make buildkernel KERNCONF=VIMAGE  
\#make installkernel KERNCONF=VIMAGE  
\#reboot

##ruby2.0
\#pkg install ruby

##rubygems
\#pkg install ruby20-gems  
\#gem update --system  

##bundler
\#gem install bundler

##SQLite3
\#pkg install sqlite3

##python2.7
\#pkg install python27

##qjail
\#pkg install qjail

##Encoding
端末の文字コードをUTF-8に変更してください。

\#vi ~/.cshrc  
> 
setenv  LC_CTYPE en_US.UTF-8  
setenv  LANG     en_US.UTF-8

##devfs.rules
devfsのルールセットをdevfs.rulesに追加します。  
ルールセット1行のみだと全てのデバイスがJailに見えるようになります。  
ルールセットの中身は都合に合わせて追記してください。

\#echo "[devfsrules_jail=50]" >> /etc/devfs.rules

#設定ファイル
./bin/gvit.confに設定ファイルがありますので自分の環境に合わせて修正してください。  
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
クライアント側でht-docs以下のindex.htmlをブラウザで開いて表示してください。

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