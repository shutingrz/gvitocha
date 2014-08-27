
//Message Type用
var CONSOLE = 1;
var STATUS = 2;
var MACHINE = 3;
var NETWORK = 4;
var ETC = 10;
var RETRYTIME=5;

var ws;
//var sdb;
var retryCount=0;
var myDisconnect = false;
var sendMsg = {
  msgType : "",
  data : ""
}
var machineDB = [{name:"_host_", type:"1", templete:"0", flavour:"0",comment:"host Machine",boot:"1"}];
var templeteDB = [];
var flavorDB = [];
var linkDB = [];
var l3DB = [];

function init(){
  wsConnection();
   $("#powerSwitch").bootstrapSwitch('size', 'normal');
 //  diagram();
}

//WebSocket
function wsConnection(){
  ws = new WebSocket("ws://192.168.56.103:3000");

    
        //接続時
  ws.onopen = function(event){

    status({"mode":STATUS, "msg" : {"msg" : "connected."}});
    reloadDB();
  }

  // メッセージ受信時の処理
  ws.onmessage = function(event){
    //console,status,network,machine,disk,etc
    msg = $.parseJSON(event.data);
  //  console.log("onmessage:" + msg.msgType)
      if(msg.msgType == CONSOLE) {
        vconsole(msg.data);
      }
      else if (msg.msgType == STATUS) {
        status(msg.data,'info');
      }
      else if (msg.msgType == MACHINE) {  //machine関数はpowerSwitch周りで不具合があるので封印 todo
        if(msg.data.mode == "templete"){
          templete_main(msg.data);
        }
        else if(msg.data.mode == "pkg"){
          getPackageResult(msg.data);
        }
        else if(msg.data.mode == "jail"){
          jail(msg.data);
        }
        else{
          machine(msg.data);
        }
      }
      else if(msg.msgType == NETWORK){
        diag(msg.data);
      }
  }
/*
  if(ws.readyState != WebSocket.OPEN){
  //  if(retryCount < RETRYTIME){
  //    if(ws.readyState != WebSocket.OPEN){
      if(retryCount < RETRYTIME){
        status_status("サーバーとの接続に失敗しました。5秒後に再接続します。");
        retryCount += 1;
        setTimeout(function(){
        wsConnection();
        },1000);
      }else{
        status_status("再度接続するには接続ボタンを押してください。");
        return;
      }
//  },700);
    }else{
*/
      
  //エラー時のメッセージ
  ws.onerror = function (event) {
    status('WebSocket Error ' + event);
  }

  //切断時のメッセージ
  ws.onclose = function (event) {
    if(myDisconnect == true){
      myDisconnect = false;
    }else{
      retryCount = 0;
      wsConnection();
    }
  }
}

//コンソールへのメッセージ
function vconsole(msg){
  //今までのデータに追加
  $("#contxt").append("<p>" + msg + "</p>");
  go_bottom("contxt");
}

//通知へのメッセージ
function status(msg,type){
  if (msg.mode == STATUS){//今までのデータに追加
    $("#statxt").append("<p>" + msg.msg.msg + "</p>");
    go_bottom("statxt");
    $.growl(msg.msg.msg, {  type: type,
                        position: {from: "top", align: "right"}});
  }
  else if(msg.mode == MACHINE){
    getMachineLog(msg.msg);
  }
} 

function status_status(msg){
  message = {"mode":STATUS, "msg" : {"msg" : msg}};
  status(message);
}

//machineへのメッセージ
function machine(msg){
  //  status(msg.key0.name)
  var row,culumn;

//  console.log("machine:" + msg.mode);

  if (msg.mode == "pkg"){
    getPackageResult(msg);
  }
  else if(msg.mode == "jail"){
    jail(msg);
  }
  else if(msg.mode == "templete"){
    templete_main(msg);
  }
}

//送信処理
function send(msgType,msg){
  sendMsg.msgType = msgType;
  sendMsg.data = msg;
  var jsonSendMsg = JSON.stringify(sendMsg);
  
  ws.send(jsonSendMsg);

}

//切断処理
function close(no,msg){
  myDisconnect = true;
  ws.close(no,msg);
}

function getMachineLog(machineLog){
  console.log(machineLog.msgType)
  if (machineLog.msgType == "success"){   //successメッセージが届いたら、
    status({"mode":STATUS, "msg" : {"msg" : machineLog.msg}});
    reloadDB();
    if(($("#powerSwitch").bootstrapSwitch('disabled')) == true){
      $("#powerSwitch").bootstrapSwitch('toggleDisabled');
      $('#machineList').removeAttr('disabled');
    }

    $("#nowLoadingModal .modal-dialog .modal-content .modal-body img").attr("src","./img/check.png");
    setTimeout(function(){
      $("#nowLoadingModal").modal("hide");
    },1500); 
  }
  else if(machineLog.msgType== "failed"){
    if(($("#powerSwitch").bootstrapSwitch('disabled')) == true){
      $("#powerSwitch").bootstrapSwitch('toggleDisabled');
      $('#machineList').removeAttr('disabled');
    }
    status({"mode":STATUS, "msg" : {"msg" : machineLog.msg}});
    $("#nowLoadingModal .modal-dialog .modal-content .modal-body img").attr("src","./img/failed.png");
    $("#nowLoadingModal .modal-dialog .modal-content .modal-body").append("<span class='br' id='failed'>"+ machineLog.msg +"</span>");
  }
  else if(machineLog.msgType == "report"){  //stateを１つ進める
    $("#state"+Number($("#state").text())).css("color","gray");
    $("#state"+Number($("#state").text())).css("font-weight","normal");
    $("#state").text(　Number($("#state").text()) + 1);
    $("#state"+Number($("#state").text())).css("font-weight","bolder");
  }
  else if(machineLog.msgType== "log"){  //logボックスに表示
    $("#nowLoadingLog").append("<span>" + machineLog.msg + "</span>");
    go_bottom("nowLoadingLog");
    
  }
}

function reloadDB(){
  jail_getList();
  templete_getList();
  diag_getDiag();
}

function reloadDiag(){
//  pushNetDiag();
  update();
}


function getPackageResult(log){
  if (log.control == "search"){
    var flag = false;
    $("#newPackageModal .modal-dialog .modal-content .modal-body .packageSearchForm .searchPkgLoading").css("display","none");  
    $("#pkgList option").each( function() { //インストール済のパッケージを全て回して重複しないかを確認
      if (log.msg == $(this).text()){
        $("#pkgSearchResult").append($("<option disabled>").html(log.msg + " (インストール済)").val(0));
        flag = true     //フラグ立てるのはあんまり良くない・・・できたら直す todo
        return;
      }
    })
    if ( flag == false){  //インストール済のパッケージになかったら
      $("#pkgSearchResult").append($("<option>").html(log.msg).val(0));
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
      $("#contxt").append("^C");
    }

    //Enter key
   if (e.which == 13) {

      send(CONSOLE,$("#console").val())
      $("#console").val("");
   } 
  });

  //クリックイベント
  //Machine.newボタン
  $(".top .machine .new").click(function(){
    alert();
  });

  //接続ボタン
  $(".top .header .right .connect").click(function(){
    retryCount = 0;
    wsConnection();
  });

  //切断ボタン
  $(".top .header .right .disconnect").click(function(){
    retryCount = RETRYTIME;
    close(4001,"切断ボタン");
  });


  //machinePropertyのPowerSwitchボタン
  $(".plabel").click(function(){
    if(($("#powerSwitch").bootstrapSwitch('disabled')) == true){

    }else{
      $("#powerSwitch").bootstrapSwitch('toggleDisabled');
      $('#machineList').attr('disabled', 'disabled');
      if(($("#powerSwitch").bootstrapSwitch('state')) == true){  //falseだったものがクリックされたらtrueになるため
        jail_start($("#machineProperty .name .name").val());
      }
      else{
        jail_stop($("#machineProperty .name .name").val());
      }
    }
  });

  //machinePropertyのdeleteボタン
  $("#machineDelete").click(function(){
    confirm_addHead("マシンの削除");
    confirm_addBody("以下のマシンを削除します。よろしいですか？");
    confirm_addBody("・" + $("#machineProperty .name .name").val());
    confirm_addCmd('jail_delete($("#machineProperty .name .name").val());');
    confirm_show();
  //  jail_delete($("#machineProperty .id").text());
  });

  //新しいマシンを作成ボタン
  $("#newMachineForm").submit(function() {
    $("#newMachineModal").modal("hide");
    $("#nowLoadingModal .modal-dialog .modal-content .modal-body img").attr("src","./img/loading.gif").addClass("nowloadingIcon");
    mkNowLoading.addHead(3,"新しいマシンを作成中...");
    mkNowLoading.addBody("state1","・jailへ登録");
    mkNowLoading.addBody("state2","・パッケージを追加");
    mkNowLoading.addBody("state3","・データベースへ登録");
    mkNowLoading.show();
    jail_createJail();
    $("#nowLoadingModal").modal("show");
  });

  //nowLoadingキャンセルボタン
  $("#nowLoadingModalCancel").click(function() {
    $("#nowLoadingModal").modal("hide");
  });


  //パッケージSearchボタン
  $("#newPackageModal .modal-dialog .modal-content .modal-body .packageSearchForm").submit(function(){
    var data = { mode : "pkg",
                 control : "search",
                 name : $("#newPackageModal .modal-dialog .modal-content .modal-body .searchText").val()
                }
    send(MACHINE,data);
    $("#pkgSearchResult option").remove();   //検索したパッケージリストの中身を全て消す
    $("#newPackageModal .modal-dialog .modal-content .modal-body .packageSearchForm .searchPkgLoading").css("display","inline");  
    $("#newPackageModal .modal-dialog .modal-content .modal-body .packageSearchForm .searchPkgLoading").attr("src","./img/loading.gif").addClass("minimumNowloadingIcon");
  });

  //パッケージ追加ボタン
  $("#newPackageModal .modal-dialog .modal-content .modal-body .packageInstallForm").submit(function(){
    var data = { mode : "pkg",
                 control : "install",
                 name : $("#pkgSearchResult option:selected").text()
                }
    
    mkNowLoading.addHead(3,"新しいパッケージを追加中...");
    mkNowLoading.addBody("state1","・リポジトリからダウンロード");
    mkNowLoading.addBody("state2","・sharedfsへコピー");
    mkNowLoading.addBody("state3","・データベースへ登録");

    $("#newPackageModal").modal("hide");
    mkNowLoading.show();
    send(MACHINE,data);
  });

  //テンプレート作成ボタン
  $("#newTempleteModal .modal-dialog .modal-content .modal-body .templeteCreateForm").submit(function(){
    var pkglist = "";
    $('[name="pkgCheckBox"]:checked').each(function(){
   //   console.log($(this).val())  
      pkglist += $(this).val() + ";";
    })
    var data = { mode : "templete",
                 control : "create",
                 msg : {
                        name :  $("#newTempleteModal .modal-dialog .modal-content .modal-body .name").val(),
                        pkglist : pkglist
                        }
                }
    mkNowLoading.addHead(1,"新しいパッケージを追加中...");
    mkNowLoading.addBody("state1","・データベースへ登録");

    $("#newTempleteModal").modal("hide");
    mkNowLoading.show();
    send(MACHINE,data);

  });

  //ConfirmOKボタン
  $("#confirmForm").submit(function(){
    $("#confirmModal").modal("hide");
  //  console.log($("#confirmForm .cmd").val());
    eval($("#confirmForm .cmd").val());
  });


  //フォーカスイベント
  //MachineListでmachineを選択した時
  $("#machineList").change(function(){    //プロパティにフォーカスした項目のname,machineType,commentを表示する
  //  var id = $("#machineList option:selected").val();
    var name = $("#machineList option:selected").text();
  //  machine = ((sdb.exec("select * from machine where id == '" +id+ "'"))[0]).values[0];
    machine = db_machine("select",name);

    if (machine.boot == "1"){
      $('#powerSwitch').bootstrapSwitch('state', true, true);
    }else{
      $('#powerSwitch').bootstrapSwitch('state', false,false);
    }    

  //  $("#machineProperty .id").text(id);
    $("#machineProperty .name .name").val(machine.name);
    $("#machineProperty .machineType .machineType").val(machine.type);

    $("#machineProperty .templete .templete").empty();
    ftemplete = templete_list("all");
    ftemplete.forEach(function(value,index){
      $("#machineProperty .templete .templete").append($("<option>").html(value).val(index));  
    });
    $("#machineProperty .templete .templete").val(machine.templete);  
    $("#machineProperty .machineType .templete").val(ftemplete);
    $("#machineProperty .flavour .flavour").val(machine.flavour);
    $("#machineProperty .comment .comment").val(machine.comment);     
  });


  //newMachineFormでtempleteを選択した時
  $("#newMachineForm .templete").change(function(){
    var pkg;
    var name = ($("#newMachineForm .templete option:selected").text());
    $("#newMachineForm .package").empty();
    pkg = (db_templete("select",name)).pkg;
    pkg = pkg.split(";");
    pkg.forEach(function(pkg, index){
      $("#newMachineForm .package").append($("<option disabled>").html(pkg).val(0)); 
    });
    

  });

  //モーダルが開いた時のイベント
  $('#newPackageModal, #newTempleteModal').on('shown.bs.modal', function() {
    $(".installedPkgLoading").attr("src","./img/loading.gif").addClass("minimumNowloadingIcon");
    $(".installedPkgLoading").attr("src","./img/loading.gif").addClass("minimumNowloadingIcon");
    var data = { mode : "pkg",
                 control : "list",
                }
    send(MACHINE,data);
  });

  $("#newMachineModal").on("shown.bs.modal", function(){

  })


  //モーダルが消えた場合のイベント
  $('#newPackageModal, #newTempleteModal').on('hidden.bs.modal', function () {      //newTempleteとnewPackageは構造が似ているので同じ関数に
    $(".modal-content select option").remove();
    $("#pkgCheckBox").empty();
    $("#packageSearchForm .searchText").val("");
    $("#templeteCreateForm .name").val("");
    reloadDB();
    
  });


  $('#nowLoadingModal').on('hidden.bs.modal', function () {
   $("#nowLoadingModal .modal-dialog .modal-content span").remove();
  });

  $('#newMachineModal').on('hidden.bs.modal', function () {
   $("#newMachineModal .modal-dialog .modal-content .modal-body .name").val("");
   $("#newMachineModal .modal-dialog .modal-content .modal-body .machineType").val("0");
   $("#newMachineModal .modal-dialog .modal-content .modal-body .templete").val("0");
   $("#newMachineModal .modal-dialog .modal-content .modal-body .flavour").val("0");
   $("#newMachineModal .modal-dialog .modal-content .modal-body .comment").val("");
   $("#newMachineModal .modal-dialog .modal-content .modal-body .package option").remove();
  });

  $('#confirmModal').on('hidden.bs.modal', function () {
   $("#confirmModal .modal-dialog .modal-content span").remove();
   $("#confirmForm .cmd").empty();
  });



});


//その他関数     

//スクロールを最下部に移動する
function go_bottom(targetId){
  var obj = document.getElementById(targetId);
  if(!obj) return;
  obj.scrollTop = obj.scrollHeight;
}

//eval
function cmdEval(str){
  eval(str);
}

//nowLoadingを形成する
function mkNowLoading(){}
mkNowLoading.addBody = mkNowLoading_addBody;
mkNowLoading.addHead = mkNowLoading_addHead;
mkNowLoading.show = mkNowLoading_show;

function mkNowLoading_addBody(id,str){
  $("#nowLoadingModal .modal-dialog .modal-content .modal-body").append("<span class='br' id='" + id + "'>"+ str + "</span>");
}
function mkNowLoading_addHead(num,str){
  $("#nowLoadingModal .modal-dialog .modal-content .modal-header").append("<span>" + str + "...(</span><span id='state'>1</span><span>/" + num + ")</span>");
}

function mkNowLoading_show(){
  mkNowLoading.addBody("hr","<hr>");
  $("#nowLoadingModal .modal-dialog .modal-content .modal-body img").attr("src","./img/loading.gif").addClass("nowloadingIcon");
  $("#state1").css("font-weight","bolder");

  $("#nowLoadingModal").modal("show");
}

//Confirmを形成する
function confirm_addHead(str){
  $("#confirmModal .modal-dialog .modal-content .modal-header").append("<span>" + str + "</span>");
}

function confirm_addBody(str){
  $("#confirmModal .modal-dialog .modal-content .modal-body").append("<span class='br'>" + str + "</span>");
}

function confirm_addCmd(str){
  $("#confirmForm .cmd").val(str);
}

function confirm_show(){
  $("#confirmModal").modal("show");
}

