
//sql処理
function sql(mode,control,msg){
  if(mode == "machine"){
    sql_machine(control,msg)
  }
  else if(mode == "templete"){
    sql_templete(control,msg)
  }

}

function sql_machine(control,msg){
  if (control == "delete"){
    if (msg == "all"){
      db.run("delete from machine;")
    }
    else{
      db.run("delete from machine where id='" + msg +"';")
    }
  }
  else if (control == "select"){
    if (msg == "all"){
      db.run("select * from machine ;")
    }
    else{
      db.run("select * from machine where id='" + msg +"';")
    }
  }
  else if (control == "insert"){
    db.run("insert into machine (id, name, type, templete, flavour, comment) values ('" + msg.id + "','" + msg.name + "','" + msg.type + "','" + msg.templete + "','" + msg.flavour + "','" + msg.comment + "');");
  }
  else if (control == "boot"){
    db.run("update machine set boot ='" + msg.state + "' where name='" + msg.name + "';");
  }

}

function sql_templete(control,msg){
  if (control == "delete"){
    if (msg == "all"){
      db.run("delete from templete;");
    }else{
      db.run("delete from templete where id='" + msg +"';");
    }
  }

  else if (control == "select"){
    if (msg == "all"){
      db.run("select * from templete ;")
    }
    else{
      db.run("select * from templete where id='" + msg +"';")
    }
  }

  else if (control == "insert"){
    db.run("insert into templete (id, name, pkg) values ('" + msg.id + "','" + msg.name + "','" + msg.pkg + "');");
  }

}