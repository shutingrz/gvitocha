# VITOCHA Router Class
#
#Copyright (c) 2012-2013, Tsunehiko Suzuki
#All rights reserved.
#                                                                              
# Redistribution and use in source and binary forms, with or without           
# modification, are permitted provided that the following conditions           
# are met:                                                                     
# 1. Redistributions of source code must retain the above copyright            
#    notice, this list of conditions and the following disclaimer.             
# 2. Redistributions in binary form must reproduce the above copyright         
#    notice, this list of conditions and the following disclaimer in the       
#    documentation and/or other materials provided with the distribution.      
#                                                                              
# THIS SOFTWARE IS PROVIDED BY AUTHOR AND CONTRIBUTORS ``AS IS'' AND           
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE        
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE   
# ARE DISCLAIMED.  IN NO EVENT SHALL AUTHOR OR CONTRIBUTORS BE LIABLE          
# FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL   
# DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS      
# OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)        
# HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT   
# LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY    
# OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF       
# SUCH DAMAGE.                                                                 

# 	$Id: router.rb,v 1.11 2013/02/16 06:29:10 tss Exp $

# usage
# router=Router.new(jailname) : create a router
# router.up(epair)  : ifconfig <epair> up
# router.down(epair)  : ifconfig <epair> down
# router.connect(epair)  : connect epair to me
# router.assingip(epair,ip,mask) : ifconfig <epair> inet <ip> netmask <mask>
# router.destroy : jail -r in safe manner
 
class Router < Equipment

def initialize(jailname)
  super
  sh=Shell.new
  sh.transact{
#    if jls("host.hostname").to_a.index("#{jailname}\n")==nil
      jexec(jailname,"sysctl -w net.inet.ip.forwarding=1")
#    end
  }
end

end
