/*
dbval

machineDB
templeteDB
flavorDB

*/



//sql処理
function db(mode,control,msg){
  if(mode == "machine"){
    db_machine(control,msg)
  }
  else if(mode == "templete"){
    db_templete(control,msg)
  }

}

function db_machine(control,msg){

  if (control == "delete"){
    if (msg == "all"){
      machineDB = [{name:"_host_", type:"1", templete:"0", flavour:"0",comment:"host Machine",boot:"1"}];
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
  //  sdb.run("insert into machine (id, name, type, templete, flavour, comment) values ('" + msg.id + "','" + msg.name + "','" + msg.type + "','" + msg.templete + "','" + msg.flavour + "','" + msg.comment + "');");
    machineDB.push({name: msg.name, type: msg.type, templete: msg.templete, flavour: msg.flavour, comment: msg.comment, boot: "0"});
  }
  else if (control == "boot"){
  //  sdb.run("update machine set boot ='" + msg.state + "' where name='" + msg.name + "';");
    machineDB[db_selectDB("machine",msg.name)].boot = msg.state;
  }
}

function db_templete(control,msg){
  if (control == "delete"){
    if (msg == "all"){
      templeteDB = [];
    }else{
      templeteDB.splice(db_selectDB("templete",msg),1);
    }
  }

  else if (control == "select"){
    if (msg == "all"){
      return templeteDB;
    }
    else{
      return templeteDB[db_selectDB("templete",msg)];
    }
  }

  else if (control == "insert"){
    templeteDB.push({name: msg.name, pkg: msg.pkg});
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
  }else if(control == "templete"){
    templeteDB.forEach(function(values,index){
      if(name == values.name){
        idx = index;    //ここでreturnしても恐らくスコープの関係で値返せないので外の変数に渡す
      }
    });
  }

  return idx;
}





function db_selectMachine(name){
  idx = 0;
  machineDB.forEach(function(values,index){
 //   console.log(values.name);
    if(name == values.name){
      idx = index;    //ここでreturnしても恐らくスコープの関係で値返せないので外の変数に渡す
    }
  });
  return idx;
}

