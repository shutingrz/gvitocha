
function jail(msg){
  if(msg.control == "list"){
      $("#machineList option").remove();
  //    sql("machine","delete","all")
      db_machine("delete","all");

      if (msg.msg == "none"){
        return
         //何もデータがない場合はsqlを保存しない
      } 
      else{
        for(var i in msg.msg){//サーバから送られたMachineデータを全てローカルsqlに保存
      //    sql("machine","insert",msg.msg[i]);
          db("machine","insert",msg.msg[i]);
        }
      }
      jail_show("all")//全マシン表示
  }
  else if(msg.control == "boot"){
  	for(var i in msg.msg){//サーバから送られたMachineのbootstateデータを全てローカルsqlに保存
        //  sql("machine","boot",msg.msg[i]);
          db("machine","boot",msg.msg[i]);
    }
  }

}


//db内の指定されたidのmachineを表示する
function jail_show(name){

  if(name == "all"){//db内の全てのmachineを表示する
    $("#machineList").empty();
    jails = jail_list("all")
    jails.forEach(function(jail,index){
      $("#machineList").append($("<option>").html(jail.name).val(jail.name)); 
    })
  }
  else{
  //  res = db.exec("select id, name from machine where id='" + id + "';")
    res = db_machine("select",name);
    $("#machineList").append($("<option>").html(res.name).val(res.name)); 
  }
}

function jail_start(jname){
	  var data = { mode : "jail",
               control: "boot",
                state : "start",
                name : jname
              };

//	console.log("jail_start:"+ name);
	send(MACHINE,data);

}

function jail_sstart(jname){}

function jail_sstop(jname){}

function jail_stop(jname){
	var data = { mode : "jail",
               control: "boot",
                state : "stop",
                name : jname 
              };
//	console.log("jail_stop:"+ name);
	send(MACHINE,data);

}

function jail_list(id){
  var tmp;
  var jails = [];

  if(id == "all"){//db内の全てのmachineを表示する
    tmp = db_machine("select","all");
    tmp.forEach(function(value,index){ 
      jails.push(value);
    })
    jails.splice(0,1);    //_host_を除く
    return jails;
  }
}

//新規マシン情報送信
function jail_createJail(){
  var data = { mode : "jail",
               control: "new",
                machine : {
                            name : $("#newMachineForm [name=name]").val(),
                            machineType : $("#newMachineForm [name=machineType]").val(),
                            templete : $("#newMachineForm [name=templete]").val(),
                            flavour : $("#newMachineForm [name=flavour]").val(),
                            comment : $("#newMachineForm [name=comment]").val()
                          }
              };
  send(MACHINE,data)
}

function jail_delete(name){
	var data = {	mode : "jail",
								control: "delete",
								name : name
							};
	send(MACHINE,data);
}


function jail_getList(){
  send(MACHINE,{"mode":"jail", "control":"select", "id":"all"})

}
