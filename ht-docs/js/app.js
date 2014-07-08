
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
  db.run("create table machine (id, name, type, templete, flavour, comment);")

}

//WebSocket
function wsConnection(){
  ws = new WebSocket("ws://192.168.56.103:3000");
    
  //接続時
  ws.onopen = function(event){
    status({"mode":STATUS, "msg" : "connected."})
    getJailResult()
  }

  // メッセージ受信時の処理
  ws.onmessage = function(event){
    //console,status,network,machine,disk,etc
    msg = $.parseJSON(event.data)
      if(msg.msgType == CONSOLE) {
        vconsole(msg.data)
      }
      else if (msg.msgType == STATUS) {
        status(msg.data,'info')
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
function status(msg,type){
  if (msg.mode == STATUS){//今までのデータに追加
    $("#statxt").append("<p>" + msg.msg + "</p>")
    go_bottom("statxt")
    $.growl(msg.msg, {  type: type,
                        position: {from: "top", align: "right"}});
  }
  else if(msg.mode == MACHINE){
    getMachineLog(msg.msg)  
  }
} 

//machineへのメッセージ
function machine(msg){
  //  status(msg.key0.name)
  var row,culumn

  if (msg.mode == "pkg"){
    getPackageResult(msg)
  }
  else if(msg.mode == "jail"){
    if(msg.control == "list"){
      $("#machineList option").remove();
      db.run("delete from machine;")
      if (msg.machine == "none"){
         //何もデータがない場合はsqlを保存しない
      } 
      else{
        for(var i in msg.msg){//サーバから送られたMachineデータを全てローカルsqlに保存
          sql("insert",msg.msg[i])
        }
      }
      showMachine("all")//全マシン表示
    }
  }
}


//db内の指定されたidのmachineを表示する
function showMachine(id){
  var row,culumn

  if(id == "all"){//db内の全てのmachineを表示する
    res = db.exec("select id, name from machine")    //idとnameを取得
    row = db.exec("select count(*) from machine")   //全行数取得
    row = row[0].values[0][0]

    for(var i=0 ; i<row ; i++){//Machineリストに全マシンのnameとidを登録
      $("#machineList").append($("<option>").html(res[0].values[i][1]).val(res[0].values[i][0])); 
    }
  }
  else{
    res = db.exec("select id, name from machine where id='" + id + "';")
    $("#machineList").append($("<option>").html(res[0].values[0][1]).val(res[0].values[0][0])); 
  }

}
/*  取得したデータの全てを表示
  res = db.exec("select * from machine")
  console.log(res)
  culumn = res[0].columns.length                 //列数取得
  row = db.exec("select count(*) from machine")   //行数取得
  row = row[0].values[0][0]
  for (var i=0 ; i<row ; i++){
    for(var j=0 ; j<culumn; j++){
      status(res[0].columns[j] + ":" + res[0].values[i][j])
    }
  }
*/

//sql処理
function sql(mode,msg){
  if (mode == "delete"){
    db.run("delete from machine where id='" + msg +"';")
  }

  else if (mode == "select"){
    if (msg == "all"){
      db.run("select * from machine ;")
    }
    else{
      db.run("select * from machine where id='" + msg +"';")
    }
  }

  else if (mode == "insert"){
    db.run("insert into machine (id, name, type, templete, flavour, comment) values ('" + msg.id + "','" + msg.name + "','" + msg.type + "','" + msg.templete + "','" + msg.flavour + "','" + msg.comment + "');");
  }

}

//送信処理
function send(msgType,msg){
  sendMsg.msgType = msgType
  sendMsg.data = msg
  var jsonSendMsg = JSON.stringify(sendMsg);
  ws.send(jsonSendMsg)
}

//切断処理
function close(no,msg){
  ws.close(no,msg)
}

//新規マシン情報送信
function createNewMachine(){
  var data = { mode : "jail",
               control: "new",
                machine : {
                            name : $("#newMachineForm [name=name]").val(),
                            machineType : $("#newMachineForm [name=machineType]").val(),
                            templete : $("#newMachineForm [name=templete]").val(),
                            flavour : $("#newMachineForm [name=flavour]").val(),
                            comment : $("#newMachineForm [name=comment]").val()
                          }
              }
  send(MACHINE,data)
}

function getMachineLog(machineLog){
  console.log(machineLog.msgType)
  if (machineLog.msgType == "success"){   //successメッセージが届いたら、
    if(machineLog.control == "jail"){
      getJailResult()
    }
    $("#nowLoadingModal .modal-dialog .modal-content .modal-body img").attr("src","./img/check.png")
    setTimeout(function(){
      $("#nowLoadingModal").modal("hide")
   //   $("#nowLoadingModal .modal-dialog .modal-content .modal-header span").remove()
   //   $("#nowLoadingModal .modal-dialog .modal-content .modal-body span").remove()
    },1500); 
  }
  else if(machineLog.msgType== "failed"){
    $("#nowLoadingModal .modal-dialog .modal-content .modal-body img").attr("src","./img/failed.png")
    $("#nowLoadingModal .modal-dialog .modal-content .modal-body").append("<span class='br' id='failed'>"+ machineLog.msg +"</span>")
  }
  else if(machineLog.msgType == "report"){
    $("#state"+Number($("#state").text())).css("color","gray")
    $("#state"+Number($("#state").text())).css("font-weight","normal")
    $("#state").text(　Number($("#state").text()) + 1)
    $("#state"+Number($("#state").text())).css("font-weight","bolder")
  }
  else if(machineLog.msgType== "log"){
    $("#nowLoadingLog").append("<span>" + machineLog.msg + "</span>")
    go_bottom("nowLoadingLog")
    
  }
}

function getJailResult(){
  send(MACHINE,{"mode":"jail", "control":"select", "id":"all"})

}

function getPackageResult(log){
  if (log.control == "search"){
    var flag = false
    $("#newPackageModal .modal-dialog .modal-content .modal-body .packageSearchForm .searchPkgLoading").css("display","none");  
    $("#pkgList option").each( function() { //インストール済のパッケージを全て回して重複しないかを確認
      if (log.msg == $(this).text()){
        $("#pkgSearchResult").append($("<option disabled>").html(log.msg + " (インストール済)").val(0))
        flag = true     //フラグ立てるのはあんまり良くない・・・できたら直す todo
        return;
      }
    })
    if ( flag == false){  //インストール済のパッケージになかったら
      $("#pkgSearchResult").append($("<option>").html(log.msg).val(0))
    }
  }
  else if(log.control == "list"){
    $(".installedPkgLoading").css("display","none"); 
    $("#pkgList").append($("<option>").html(log.msg).val(0)); 
    $("#pkgCheckBox").append('<label><input type="checkbox" name="pkgCheckBox" value="' + log.msg + '" />' + log.msg + '</label><br>');

  }

}





//各種イベント系
$(document).ready(function(){
  

  //各種初期化


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
  $(".top .machine .new").click(function(){
    alert()
  });

  //接続ボタン
  $(".top .header .right .connect").click(function(){

    wsConnection()
  });

  //切断ボタン
  $(".top .header .right .disconnect").click(function(){
    close(4001,"切断ボタン")
  });

  //新しいマシンを作成ボタン
  $("#newMachineForm").submit(function() {
    $("#newMachineModal").modal("hide")
    $("#nowLoadingModal .modal-dialog .modal-content .modal-body img").attr("src","./img/loading.gif").addClass("nowloadingIcon")
    mkNowLoading.addHead(3,"新しいマシンを作成中...")
    mkNowLoading.addBody("state1","・jailへ登録")
    mkNowLoading.addBody("state2","・パッケージを追加")
    mkNowLoading.addBody("state3","・データベースへ登録")
    mkNowLoading.show()
    createNewMachine()
    $("#nowLoadingModal").modal("show")
  });

  //nowLoadingキャンセルボタン
  $("#nowLoadingModalCancel").click(function() {
    $("#nowLoadingModal").modal("hide")
  });


  //パッケージSearchボタン
  $("#newPackageModal .modal-dialog .modal-content .modal-body .packageSearchForm").submit(function(){
    var data = { mode : "pkg",
                 control : "search",
                 name : $("#newPackageModal .modal-dialog .modal-content .modal-body .searchText").val()
                }
    send(MACHINE,data)
    $("#pkgSearchResult option").remove()   //検索したパッケージリストの中身を全て消す
    $("#newPackageModal .modal-dialog .modal-content .modal-body .packageSearchForm .searchPkgLoading").css("display","inline");  
    $("#newPackageModal .modal-dialog .modal-content .modal-body .packageSearchForm .searchPkgLoading").attr("src","./img/loading.gif").addClass("minimumNowloadingIcon")
  });

  //パッケージ追加ボタン
  $("#newPackageModal .modal-dialog .modal-content .modal-body .packageInstallForm").submit(function(){
    var data = { mode : "pkg",
                 control : "install",
                 name : $("#pkgSearchResult option:selected").text()
                }
    
    mkNowLoading.addHead(3,"新しいパッケージを追加中...")
    mkNowLoading.addBody("state1","・リポジトリからダウンロード")
    mkNowLoading.addBody("state2","・basejailへコピー")
    mkNowLoading.addBody("state3","・データベースへ登録")

    $("#newPackageModal").modal("hide")
    mkNowLoading.show()
    send(MACHINE,data)


  });

  //テンプレート作成ボタン
  $("#newTempleteModal .modal-dialog .modal-content .modal-body .templeteCreateForm").submit(function(){
    var pkglist = ""
    $('[name="pkgCheckBox"]:checked').each(function(){
   //   console.log($(this).val())  
      pkglist += $(this).val() + ";"
    })
    var data = { mode : "templete",
                 control : "create",
                 name :  $("#newTempleteModal .modal-dialog .modal-content .modal-body .name").val(),
                 pkglist : pkglist
                }

    console.log(data)

  });







  //フォーカスイベント
  //MachineListのフォーカス
  $("#machineList").change(function(){    //プロパティにフォーカスした項目のname,machineType,commentを表示する
    var id = ($("#machineList option:selected").val())
    machine = db.exec("select * from machine where id == '" +id+ "'")
    $("#machineProperty .name .name").val(machine[0].values[0][1])
    $("#machineProperty .machineType .machineType").val(machine[0].values[0][2])
    $("#machineProperty .machineType .templete").val(machine[0].values[0][3])
    $("#machineProperty .flavour .flavour").val(machine[0].values[0][4])   
    $("#machineProperty .comment .comment").val(machine[0].values[0][5])      
  });

  //モーダルが開いた時のイベント
  $('#newPackageModal, #newTempleteModal').on('shown.bs.modal', function() {
    $(".installedPkgLoading").attr("src","./img/loading.gif").addClass("minimumNowloadingIcon")
    $(".installedPkgLoading").attr("src","./img/loading.gif").addClass("minimumNowloadingIcon")
    var data = { mode : "pkg",
                 control : "list",
                }
    send(MACHINE,data)
  });


  //モーダルが消えた場合のイベント
  $('#newPackageModal, #newTempleteModal').on('hidden.bs.modal', function () {      //newTempleteとnewPackageは構造が似ているので同じ関数に
    $(".modal-content select option").remove()
    $("#pkgCheckBox").empty()
    $("#packageSearchForm .searchText").val("")
    $("#templeteCreateForm .name").val("")
    
  });


  $('#nowLoadingModal').on('hidden.bs.modal', function () {
   $("#nowLoadingModal .modal-dialog .modal-content span").remove()
  });

  $('#newMachineModal').on('hidden.bs.modal', function () {
   $("#newMachineModal .modal-dialog .modal-content .modal-body .name").val("")
   $("#newMachineModal .modal-dialog .modal-content .modal-body .machineType").val("0")
   $("#newMachineModal .modal-dialog .modal-content .modal-body .templete").val("0")
   $("#newMachineModal .modal-dialog .modal-content .modal-body .flavour").val("0")
   $("#newMachineModal .modal-dialog .modal-content .modal-body .comment").val("")
   $("#newMachineModal .modal-dialog .modal-content .modal-body .package option").remove()
  });



});


//その他関数     

//スクロールを最下部に移動する
function go_bottom(targetId){
  var obj = document.getElementById(targetId);
  if(!obj) return;
  obj.scrollTop = obj.scrollHeight;
}

//nowLoadingを形成する
function mkNowLoading(){}
mkNowLoading.addBody = mkNowLoading_addBody
mkNowLoading.addHead = mkNowLoading_addHead
mkNowLoading.show = mkNowLoading_show

function mkNowLoading_addBody(id,str){
  $("#nowLoadingModal .modal-dialog .modal-content .modal-body").append("<span class='br' id='" + id + "'>"+ str + "</span>") 
}
function mkNowLoading_addHead(num,str){
  $("#nowLoadingModal .modal-dialog .modal-content .modal-header").append("<span>" + str + "...(</span><span id='state'>1</span><span>/" + num + ")</span>")
}

function mkNowLoading_show(){
  mkNowLoading.addBody("hr","<hr>")
  $("#nowLoadingModal .modal-dialog .modal-content .modal-body img").attr("src","./img/loading.gif").addClass("nowloadingIcon")
  $("#state1").css("font-weight","bolder")

  $("#nowLoadingModal").modal("show")
}


