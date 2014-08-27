
//templeteへのメッセージ
function templete_main(msg){
  if(msg.control == "list"){
    db("templete","delete","all");
    for(var i in msg.msg){//サーバから送られたMachineデータを全てローカルsqlに保存
          db("templete","insert",msg.msg[i]);
    }
    templete_show("all");//全マシン表示
  }
}

function templete_show(name){
  var row,culumn

  if(name == "all"){//db内の全てのtempleteを表示する
    $("#newMachineForm .templete").empty();
    templete = templete_list("all")
    templete.forEach(function(value,index){
      $("#newMachineForm .templete").append($("<option>").html(value).val(index));  
    })
  }
}

function templete_list(name){
  var tmp;
  var templete = [];
  if(name == "all"){//db内の全てのtempleteを表示する
    tmp = db_templete("select","all");
    tmp.forEach(function(value,index){
      templete.push(value.name);
    });
    return templete;  
  }
  else{
    tmp = db_templete("select",name)
    return tmp;
  }
  return true;
}

function templete_getList(){
    var data = {  mode : "templete",
                  control: "select",
                  id : "all"
                }
    send(MACHINE,data)
}
 /* else{
    res = db.exec("select id, name from machine where id='" + id + "';")
    $("#machineList").append($("<option>").html(res[0].values[0][1]).val(res[0].values[0][0])); 
  }*/