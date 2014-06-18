
//Message Type用
var CONSOLE = 1;
var STATUS = 2;
var SERVER = 3;
var NETWORK = 4;
var ETC = 10;
var ws;
var sendMsg = {
  msgType : "",
  data : ""
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
    //console,status,network,server,disk,etc
    msg = $.parseJSON(event.data)
      if(msg.msgType == CONSOLE) {
        console(msg.data)
      }
      else if (msg.msgType == STATUS) {
        status(msg.data)
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
  function console(msg){
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
  //Server.newボタン
  $("#serverProperty .submitType .new").click(function(){
    alert();
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