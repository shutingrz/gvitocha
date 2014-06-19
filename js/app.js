
//Message Type用
var CONSOLE = 1;
var STATUS = 2;
var MACHINE = 3;
var NETWORK = 4;
var ETC = 10;

var ws;
var db;
var sendMsg = {
  msgType : "",
  data : ""
}

function init(){
  wsConnection()

  db = new SQL.Database();
  db.run("create table machine (id, name, type, templete, comment);")

}

//WebSocket
function wsConnection(){
  ws = new WebSocket("ws://192.168.56.102:3000");
    
  //接続時
  ws.onopen = function(event){
    status("connected.")
  }

  // メッセージ受信時の処理
  ws.onmessage = function(event){
    //console,status,network,machine,disk,etc
    msg = $.parseJSON(event.data)
      if(msg.msgType == CONSOLE) {
        vconsole(msg.data)
      }
      else if (msg.msgType == STATUS) {
        status(msg.data)
      }
      else if (msg.msgType == MACHINE) {
        machine(msg.data)
      }
  }

      
  //エラー時のメッセージ
  ws.onerror = function (event) {
    status('WebSocket Error ' + event);
  };

  //切断時のメッセージ
  ws.onclose = function (event) {
    status("disconnected");
  }

}

//コンソールへのメッセージ
function vconsole(msg){
  //今までのデータに追加
  $("#contxt").append("<p>" + msg + "</p>")
  go_bottom("contxt")
}

//通知へのメッセージ
function status(msg){
  //今までのデータに追加
  $("#statxt").append("<p>" + msg + "</p>")
  go_bottom("statxt")
} 

//machineへのメッセージ
function machine(msg){
  //  status(msg.key0.name)
  var row,culumn

  for(var i in msg){//サーバから送られたMachineデータを全てローカルsqlに保存
    db.run("insert into machine (id, name, type, templete, comment) values ('" + msg[i].id + "','" + msg[i].name + "','" + msg[i].type + "','" + msg[i].templete + "','" + msg[i].comment + "');");
  }
  res = db.exec("select id, name from machine")    //idとnameを取得
  
  row = db.exec("select count(*) from machine")   //全行数取得
  row = row[0].values[0][0]

  for(var i=0 ; i<row ; i++){//Machineリストに全マシンのnameとidを登録
    $("#machineList").append($("<option>").html(res[0].values[i][1]).val(res[0].values[i][0])); 
  } 

/*  取得したデータの全てを表示
  res = db.exec("select * from machine")
  console.log(res)
  row = db.exec("select count(*) from machine")   //行数取得
  row = row[0].values[0][0]
  for (var i=0 ; i<row ; i++){
    for(var j=0 ; j<culumn; j++){
      status(res[0].columns[j] + ":" + res[0].values[i][j])
    }
  }
*/
} 

//送信処理
function send(msgType,msg){
  sendMsg.msgType = msgType
  sendMsg.data = msg
  var jsonSendMsg = JSON.stringify(sendMsg);
  status(jsonSendMsg)
  ws.send(jsonSendMsg)
}

//切断処理
function close(no,msg){
  ws.close(no,msg)
}




//各種イベント系
$(document).ready(function(){

  //キーイベント
  $("#console").keypress(function(e) {
    //Ctrl-C
    if (e.which == 99 && e.ctrlKey == true){
      $("#contxt").append("^C")
    }

    //Enter key
   if (e.which == 13) {

      send(CONSOLE,$("#console").val())
      $("#console").val("")
   } 
  });

  //クリックイベント
  //Machine.newボタン
  $("#machineProperty .submitType .new").click(function(){

   // db.run("create table machine"

   // console.log(res)
   // console.log(res[0].values[0][0])


 //   status(obj.columns[0][0] + ":" + obj.values[0] + "," + obj.columns[1] + ":" + obj.values[1])
   // alert(db.run("insert into machine (id, name, type, templete, comment) values (0, 'testmachine', 'server',  'minimum', 'testMachineだよ');"))

  /*  SQLと返り値の関係 
    db.run("create table machine (id , name);")
    db.run("insert into machine (id, name) values ('aiai','test')")
    var res = db.exec("select name from machine where id='aiai';");
    
   // res[0].columns[0] => name , res[0].values[0][0] => test
   */

  });

  //接続ボタン
  $(".top .header .right .connect").click(function(){

    wsConnection()
  });

  //切断ボタン
  $(".top .header .right .disconnect").click(function(){
    close(4001,"切断ボタン")
  });
});


//その他関数     

//スクロールを最下部に移動する
function go_bottom(targetId){
  var obj = document.getElementById(targetId);
  if(!obj) return;
  obj.scrollTop = obj.scrollHeight;
}