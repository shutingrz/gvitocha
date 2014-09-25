/*
dbval

machineDB
templateDB
flavorDB

*/



//sql処理
function db(mode,control,msg){
  if(mode == "machine"){
    db_machine(control,msg)
  }
  else if(mode == "template"){
    db_template(control,msg)
  }

}

function db_machine(control,msg){

  if (control == "delete"){
    if (msg == "all"){
      machineDB = [];
    }
    else{
      machineDB.splice(db_selectDB("machine",msg),1);
    }
  }
  else if (control == "select"){
    if (msg == "all"){
      return machineDB;
    }
    else{
      return machineDB[db_selectDB("machine",msg)];
    }
  }
  else if (control == "insert"){
    machineDB.push({name: msg.name, type: msg.type, template: msg.template, flavour: msg.flavour, comment: msg.comment, boot: "0"});
  }
  else if (control == "boot"){
    machineDB[db_selectDB("machine",msg.name)].boot = msg.state;
  }
}

function db_template(control,msg){
  if (control == "delete"){
    if (msg == "all"){
      templateDB = [];
    }else{
      templateDB.splice(db_selectDB("template",msg),1);
    }
  }

  else if (control == "select"){
    if (msg == "all"){
      return templateDB;
    }
    else{
      return templateDB[db_selectDB("template",msg)];
    }
  }

  else if (control == "insert"){
    templateDB.push({name: msg.name, pkg: msg.pkg});
  }

}

function db_selectDB(control,name){
  idx = 0;

  if(control == "machine"){
    machineDB.forEach(function(values,index){
      if(name == values.name){
        idx = index;    //ここでreturnしても恐らくスコープの関係で値返せないので外の変数に渡す
      }
    });
  }else if(control == "template"){
    templateDB.forEach(function(values,index){
      if(name == values.name){
        idx = index;    //ここでreturnしても恐らくスコープの関係で値返せないので外の変数に渡す
      }
    });
  }else if(control == "l3"){
    l3DB.forEach(function(values,index){
      if(name == values.epair){
        idx = index;
      }
    });
  }
  return idx;
}

