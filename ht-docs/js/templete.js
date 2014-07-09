
//templeteへのメッセージ
function templete(msg){
  if(msg.control == "list"){
    db.run("delete from templete;")
    for(var i in msg.msg){//サーバから送られたMachineデータを全てローカルsqlに保存
          sql("templete","insert",msg.msg[i])
    }
    templete_show("all")//全マシン表示
  }
}

function templete_show(id){
  var row,culumn

  if(id == "all"){//db内の全てのtempleteを表示する
    $("#newMachineForm .templete").empty();
    templete = templete_list("all")
    templete.forEach(function(value,index){
      $("#newMachineForm .templete").append($("<option>").html(value).val(index));  
    })
  }
}

function templete_list(id){
  var tmp;
  var templete = [];
  if(id == "all"){//db内の全てのmachineを表示する
    tmp = (db.exec("select name from templete"))[0];    //idとnameを取得

    (tmp.values).forEach(function(value,index){ 
      templete.push(value[0])
    })
    return templete;
  }
  else{
    tmp = ((db.exec("select name from templete where id == '" + id + "'"))[0]).values[0][1];
    return tmp
  }
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