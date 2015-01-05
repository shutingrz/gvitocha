#README
##dependence
###VIMAGE
You need KernelCompile your System.  


\#vi /usr/src/sys/amd64/conf/VIMAGE
> 
ident VIMAGE  
include GENERIC  
Options VIMAGE  

\#cd /usr/src  
\#make buildkernel KERNCONF=VIMAGE  
\#make installkernel KERNCONF=VIMAGE  

###ruby2.0
\#pkg install ruby
###rubygems
\#pkg install ruby20-gems  
\#gem update --system  
###bundler
\#gem install bundler
###python2.7
\#pkg install python27
###qjail
\#pkg install qjail



#License
##./bin/*
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

##./third/webshell.py
Copyright (c) 2014, Shuto Imai
All rights reserved.
GPL 2.0