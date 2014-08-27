/* Data

{:epair8a=>["_host_", "10.254.254.1", "255.255.255.0", "", "", ""], 
:epair8b=>["masterRouter", "10.254.254.2", "255.255.255.0", "", "", ""],
 :epair9a=>["masterRouter", "192.168.20.1", "255.255.255.0", "", "", ""],
  :epair9b=>["tswitch", "switch", "", "", "", ""],
   :epair10a=>["server01", "192.168.20.11", "255.255.255.0", "", "", ""],
    :epair10b=>["tswitch", "switch", "", "", "", ""],
     :epair11a=>["server02", "192.168.20.12", "255.255.255.0", "", "", ""],
      :epair11b=>["tswitch", "switch", "", "", "", ""]
      }

*/

netDiag = {epair8a:["_host_", "10.254.254.1", "255.255.255.0", "", "", ""], epair8b:["masterRouter", "10.254.254.2", "255.255.255.0", "", "", ""], epair9a:["masterRouter", "192.168.20.1", "255.255.255.0", "", "", ""], epair9b:["tswitch", "switch", "", "", "", ""], epair10a:["server01", "192.168.20.11", "255.255.255.0", "", "", ""], epair10b:["tswitch", "switch", "", "", "", ""], epair11a:["server02", "192.168.20.12", "255.255.255.0", "", "", ""], epair11b:["tswitch", "switch", "", "", "", ""]};

function diag(data){
/*
	netDiag.forEach(function(value,index){
	
		console.log(value);
	});
*/
	console.log(data);
}

function diag_insert(){


}