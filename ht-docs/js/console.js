//コンソールへのメッセージ
function console_dump(msg){
  if(msg != ""){
	  $("#term").html(msg);
  }
}


function console_write(jname,cmd){
	message = {"mode" : "write" , "msg" : {"jname" : jname, "cmd" : cmd}};
	send(CONSOLE,message);
}

function console_register(jname){
	message = {"mode" : "register", "jname" : jname};
	send(CONSOLE,message);
	console_write(jname,"%0D");
}

function console_unregister(jname){
	message = {"mode" : "unregister", "jname" : jname};
	send(CONSOLE,message);
}
