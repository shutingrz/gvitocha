
function jail(msg){
  if(msg.control == "list"){
      $("#machineList option").remove();
      db_machine("delete","all");

      if (msg.msg == "none"){
        return
         //何もデータがない場合はsqlを保存しない
      } 
      else{
        for(var i in msg.msg){//サーバから送られたMachineデータを全てローカルsqlに保存
          db("machine","insert",msg.msg[i]);
        }
      }
  }
  else if(msg.control == "boot"){
  	for(var i in msg.msg){//サーバから送られたMachineのbootstateデータを全てローカルsqlに保存
          db("machine","boot",msg.msg[i]);
    }
    jail_show("all")//全マシン表示
  }

}


//db内の指定されたidのmachineを表示する
function jail_show(name){
/*
  if(name == "all"){//db内の全てのmachineを表示する
    $("#machineList").empty();
    jails = jail_list("all")
    jails.forEach(function(jail,index){
      $("#machineList").append($("<option>").html(jail.name).val(jail.name)); 
    })
  }
  else{
    res = db_machine("select",name);
    $("#machineList").append($("<option>").html(res.name).val(res.name)); 
  }
  */
  if(name == "all"){//db内の全てのmachineを表示する
    $("#machineTable tbody").empty();
    var tableSub = '\
            <tr>\
              <th>Name</th>\
              <th>Type</th>\
              <th>Template</th>\
              <th>コメント</th>\
              <th>作成日時</th>\
              <th>最終更新日時</th>\
            </tr>\
            '
    var tableData = ""
    var machineType = ""
    var machineTemplate = ""
    var machineStatus = ""
  //  $("#machineTable thead").append(tableSub);
    jails = jail_list("all")
    jails.forEach(function(jail,index){
      switch(jail.type){
        case ROUTER.toString():
          machineType = "Router";
          break;
        case SWITCH.toString():
          machineType = "Switch";
          break;
        default:
          machineType = "Server";
          break;
      }
      console.log(jail);
      if(jail.boot == "1"){
        machineStatus = '<i class="fa fa-toggle-on">UP';
      }else{
        machineStatus = '<i class="fa fa-toggle-off">DOWN';
      }
      machineTemplate = template_list("all")[jail.template];
      tableData = '\
            <tr>\
              <td>\
                <a href="javascript:diag_showMachineInfoModal(\''+ jail.name + '\')">' + jail.name + '</a>\
              </td>\
              <td>' + machineType + '</td>\
              <td>' + machineTemplate + '</td>\
              <td>' + jail.comment + '</td>\
              <td bgcolor="#BDC0BA">' + machineStatus + '</td>\
              <td>2014/01/01 00:00:00</td>\
              <td>2014/01/01 00:00:00</td>\
            </tr>\
            '
      $("#machineTable tbody").append(tableData); 
    })
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
  //  jails.splice(0,1);    //masterRouterを除く
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
                            template : $("#newMachineForm [name=template]").val(),
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

function jail_showDeleteModal(name){
  confirm_addHead("マシンの削除");
  confirm_addBody("以下のマシンを削除します。よろしいですか？");
  confirm_addBody("・" + name);
  confirm_addCmd('jail_delete("' + name + '");');
  confirm_show();
}


function jail_getList(){
  send(MACHINE,{mode:"jail", control:"select", id:"all"});
}

function jail_easyCreate(type){
  send(MACHINE,{mode:"jail", control:"new", machine:"easy", machineType:type});
}
