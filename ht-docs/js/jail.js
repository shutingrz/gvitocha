
function jail(msg){
  if(msg.control == "list"){
      $("#machineList option").remove();
      sql("machine","delete","all")

      if (msg.msg == "none"){
        return
         //何もデータがない場合はsqlを保存しない
      } 
      else{
        for(var i in msg.msg){//サーバから送られたMachineデータを全てローカルsqlに保存
          sql("machine","insert",msg.msg[i])
        }
      }
      jail_show("all")//全マシン表示
  }
  else if(msg.control == "boot"){
  	for(var i in msg.msg){//サーバから送られたMachineのbootstateデータを全てローカルsqlに保存
          sql("machine","boot",msg.msg[i]);
    }
  }

}


//db内の指定されたidのmachineを表示する
function jail_show(id){

  if(id == "all"){//db内の全てのmachineを表示する
    $("#machineList").empty();
    jails = jail_list("all")
    jails.forEach(function(jail,index){
      $("#machineList").append($("<option>").html(jail[1]).val(jail[0])); 
    })
  }
  else{
    res = db.exec("select id, name from machine where id='" + id + "';")
    $("#machineList").append($("<option>").html(res[0].values[0][1]).val(res[0].values[0][0])); 
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
    tmp = (db.exec("select id, name from machine"))[0];    //idとnameを取得
    (tmp.values).forEach(function(value,index){ 
      jails.push(value);
    })
    return jails;
  }
}

/*  取得したデータの全てを表示
  res = db.exec("select * from machine")
  console.log(res)
  culumn = res[0].columns.length                 //列数取得
  row = db.exec("select count(*) from machine")   //行数取得
  row = row[0].values[0][0]
  for (var i=0 ; i<row ; i++){
    for(var j=0 ; j<culumn; j++){
      status(res[0].columns[j] + ":" + res[0].values[i][j])
    }
  }
*/

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

function jail_delete(jid){
	var data = {	mode : "jail",
								control: "delete",
								id : jid
							};
	send(MACHINE,data);
}


function jail_getList(){
  send(MACHINE,{"mode":"jail", "control":"select", "id":"all"})

}