var ws;

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
    var msg = event.data.split(",", 2)
    if (msg[0] == "console") {
      console(msg[1])
    }
    else if (msg[0] == "status") {
      status(msg[1])
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
      ws.send("console," + $("#console").val())
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
    ws.close(4001,"切断ボタン")
  });
});


//その他関数     

//スクロールを最下部に移動する
function go_bottom(targetId){
  var obj = document.getElementById(targetId);
  if(!obj) return;
  obj.scrollTop = obj.scrollHeight;
}