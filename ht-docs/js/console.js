//コンソールへのメッセージ
function console_dump(msg){
  if(msg != ""){
	  $("#term").html(msg);
  }
}


function console_write(jname,cmd){
	message = {"mode" : "write" , "jname" : jname, "cmd" : cmd};
	send(CONSOLE,message);
}

function console_register(name){
	jname = name;
//	$("#term").html("<span class=\"ff be\">Now loading...</span>");
	message = {"mode" : "register", "jname" : jname};
	send(CONSOLE,message);
	console_write(jname,"%0D");
}

function console_unregister(jname){
	message = {"mode" : "unregister", "jname" : jname};
	send(CONSOLE,message);
}

function console_suspend(){
	message = {"mode" : "suspend"};
	send(CONSOLE,message);
}
