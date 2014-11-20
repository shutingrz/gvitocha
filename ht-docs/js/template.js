
//templateへのメッセージ
function template_main(msg){
  if(msg.control == "list"){
    db("template","delete","all");
    for(var i in msg.msg){//サーバから送られたMachineデータを全てローカルsqlに保存
          db("template","insert",msg.msg[i]);
    }
    template_show("all");//全マシン表示
  }
}

function template_show(name){
  var row,culumn

  if(name == "all"){//db内の全てのtemplateを表示する
    $("#newMachineForm .template").empty();
    template = template_list("all")
    template.forEach(function(value,index){
      $("#newMachineForm .template").append($("<option>").html(value).val(index));  
    })
  }
}

function template_list(name){
  var tmp;
  var template = [];
  if(name == "all"){//db内の全てのtemplateを表示する
    tmp = db_template("select","all");
    tmp.forEach(function(value,index){
      template.push(value.name);
    });
    return template;  
  }
  else{
    tmp = db_template("select",name)
    return tmp;
  }
  return true;
}

function template_getList(){
    var data = {  mode : "template",
                  control: "select",
                  id : "all"
                }
    send(MACHINE,data)
}
 /* else{
    res = db.exec("select id, name from machine where id='" + id + "';")
    $("#machineList").append($("<option>").html(res[0].values[0][1]).val(res[0].values[0][0])); 
  }*/