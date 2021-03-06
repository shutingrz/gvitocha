
//Message Type用
var CONSOLE = 1;
var STATUS = 2;
var MACHINE = 3;
var NETWORK = 4;
var ETC = 10;
var RETRYTIME=5;

var SERVER = 0;
var ROUTER = 1;
var SWITCH = 2;

var ws;
//var sdb;
var retryCount=0;
var myDisconnect = false;
var sendMsg = {
  msgType : "",
  data : ""
}
//var machineDB = [{name:"_host_", type:"1", template:"0", flavour:"0",comment:"host Machine",boot:"1"}];
var machineDB = [];
var templateDB = [];
var flavorDB = [];
var linkDB = [];
var l3DB = [];
var t;
var jname = "masterRouter";
var initok = false;		//初期化が済んだか
var openContext = false;	//contextmenuが開いているかどうか
var openConsole = false;	//shellが開いたかどうか
var consoleName = "";

var serverHost = "0.0.0.0";	//接続中のホスト名
var serverPortNum = "3000";	//接続中のホストのポート番号

function init(){
   $("#powerSwitch").bootstrapSwitch('size', 'normal');
   $("#ciscoSwitch").bootstrapSwitch('size', 'normal');
	if(($("#ciscoSwitch").bootstrapSwitch('state')) == true){  //ciscoライク表示スイッチがオンの場合
 		nodeStyle = CISCO;
   	}
	else{
		nodeStyle = CIRCLE;
	}

	$("#connectServerModal").modal("show");

//	wsConnection();
 //  diagram();
}

//WebSocket
function wsConnection(host,port){
  ws = new WebSocket("ws://" + host + ":" + port );

	
		//接続時
  ws.onopen = function(event){
	initok = true;
	serverHost = host;
	serverPortNum = port;
	$("#connectServerHostCaption").text(serverHost);

	status({"mode":STATUS, "msg" : {"msg" : "connected."}});
	reloadDB();

	$("#connectServerModal").modal("hide");

	setTimeout(function(){
		t=webshell.Terminal("term",80,24,handler);
   	},1000);

//	setTimeout(function(){window.scrollTo(0, 1);}, 100);
//	startMsgAnim('Connecting',0,false);
  }

  // メッセージ受信時の処理
  ws.onmessage = function(event){
	//console,status,network,machine,disk,etc
	msg = $.parseJSON(event.data);
  //  console.log("onmessage:" + msg.msgType)
	  if(msg.msgType == CONSOLE) {
		console_dump(msg.data);
	  }
	  else if (msg.msgType == STATUS) {
		status(msg.data,'info');
	  }
	  else if (msg.msgType == MACHINE) {  //machine関数はpowerSwitch周りで不具合があるので封印 todo
		if(msg.data.mode == "template"){
		  template_main(msg.data);
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
  	if(initok == false){
  		$("#connectServerModal .modal-dialog .modal-content .modal-footer .connectServerMsg").text("接続できませんでした。");
  	}
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


//通知へのメッセージ
function status(msg,type){
  if (msg.mode == STATUS){//今までのデータに追加
  //  $("#statxt").append("<p>" + msg.msg.msg + "</p>");
  //  go_bottom("statxt");
	$.growl(msg.msg.msg, {  type: type,
						position: {from: "top", align: "right"}});
  }
  else if(msg.mode == MACHINE){
	getMachineLog(msg.msg);
  }
  else if(msg.mode == NETWORK){
	diag_getNetworkLog(msg.msg);
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
  else if(msg.mode == "template"){
	template_main(msg);
  }
}

//送信処理
function send(msgType,msg){
  sendMsg.msgType = msgType;
  sendMsg.data = msg;
  var jsonSendMsg = JSON.stringify(sendMsg);

  if(msgType == MACHINE){	//machine関係の操作はセンシティブなのでdiagを触れないようにする
  	diag_nowloading();
  }
  console.log(jsonSendMsg);
	if(initok == true){
		ws.send(jsonSendMsg);
	}

}

//切断処理
function close(no,msg){
  myDisconnect = true;
  ws.close(no,msg);
}

function getMachineLog(machineLog){
  if (machineLog.msgType == "success"){   //successメッセージが届いたら、
	status({"mode":STATUS, "msg" : {"msg" : machineLog.msg}});
	reloadDB();
	if(($("#powerSwitch").bootstrapSwitch('disabled')) == true){
	  $("#powerSwitch").bootstrapSwitch('toggleDisabled');
	  $('#machineList').removeAttr('disabled');
	}

	$(".easyBtn").removeAttr("disabled");

	if($("#easyCreateLoading").css("display") == "inline"){
		$("#easyCreateLoading").css("display","none");
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
	$("#nowLoadingLog").append("<span class='br'>" + machineLog.msg + "</span>");
	go_bottom("nowLoadingLog");
	
  }
}

function reloadDB(){
  template_getList();
  jail_getList();
  setTimeout(function(){
	diag_getDiag();
  },300);
}

function reloadDiag(){
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
	$("#term").bind('keydown',function(e){t.keydown(e)});
	$("#term").bind('keypress',function(e){t.keypress(e)});
	
  //クリックイベント

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



  //ciscoSwitchボタン
  $(".ciscolabel").click(function(){
	  if(($("#ciscoSwitch").bootstrapSwitch('state')) == true){  //falseだったものがクリックされたらtrueになるため
		nodeStyle = CIRCLE;
	  }
	  else{
		nodeStyle = CISCO;
	  }
	  update();	

	  $("#ciscoSwitch").bootstrapSwitch('toggleState');
  });

  //serverConnectModalの接続ボタン
  $("#connectServerForm").submit(function(){
  	$("#connectServerModal .modal-dialog .modal-content .modal-footer .connectServerMsg").html('<i class="fa fa-spinner fa-spin"></i>接続中...');
  	var host = $("#serverHost").val();
  	var port = $("#serverPortNum").val();
  	wsConnection(host, port);
  });

  //machinePropertyのdeleteボタン
  $("#machineDelete").click(function(){
	confirm_addHead("マシンの削除");
	confirm_addBody("以下のマシンを削除します。よろしいですか？");
	confirm_addBody("・" + $("#machineProperty .name .name").val());
	confirm_addCmd('jail_delete($("#machineProperty .name .name").val());');
	confirm_show();
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
  $("#newTemplateModal .modal-dialog .modal-content .modal-body .templateCreateForm").submit(function(){
	var pkglist = "";
	$('[name="pkgCheckBox"]:checked').each(function(){
   //   console.log($(this).val())  
	  pkglist += $(this).val() + ";";
	})
	var data = { mode : "template",
				 control : "create",
				 msg : {
						name :  $("#newTemplateModal .modal-dialog .modal-content .modal-body .name").val(),
						pkglist : pkglist
						}
				}
	mkNowLoading.addHead(1,"新しいパッケージを追加中...");
	mkNowLoading.addBody("state1","・データベースへ登録");

	$("#newTemplateModal").modal("hide");
	mkNowLoading.show();
	send(MACHINE,data);

  });

  //l3submitボタン
  $("#l3Form").submit(function(){
	var data = {"epair" : $("#l3Form .link").text(), "ipaddr" : $("#l3Form .ipaddr").val(), "ipmask" : $("#l3Form .ipmask").val(), "ip6addr" : $("#l3Form .ip6addr").val(), "ip6mask" : $("#l3Form .ip6mask").val(), "as" : $("#l3Form .as").val()};
	$("#l3Modal").modal("hide");
  	send(NETWORK, {mode: "l3", control: "create", msg : data});

  });

  //deleteAllMachineボタン
  $("#deleteAllMachine").click(function(){
	confirm_addHead("全マシンの削除");
	confirm_addBody("全てのマシンを削除します。よろしいですか？");
	confirm_addCmd("jail_delete('_all');");
	confirm_show();
  });

  //deleteAllNetworkボタン
  $("#deleteAllNetwork").click(function(){
	confirm_addHead("全ネットワークの削除");
	confirm_addBody("全てのネットワークを削除します。よろしいですか？");
	confirm_addCmd("diag_deleteLink('_all');");
	confirm_show();
  });

  //ConfirmOKボタン
  $("#confirmForm").submit(function(){
	$("#confirmModal").modal("hide");
  //  console.log($("#confirmForm .cmd").val());
	eval($("#confirmForm .cmd").val());
  });

	//簡易作成ボタン
  $("#easyServerBtn").click(function(){
  	$(".easyBtn").attr("disabled","disabled");
  	$("#easyCreateLoading").css("display","inline");  
	$("#easyCreateLoading").attr("src","./img/loading.gif").addClass("minimumNowloadingIcon");
 
	jail_easyCreate(SERVER);
  });

  $("#easyRouterBtn").click(function(){
  	$(".easyBtn").attr("disabled","disabled");
  	$("#easyCreateLoading").css("display","inline");  
	$("#easyCreateLoading").attr("src","./img/loading.gif").addClass("minimumNowloadingIcon");
	jail_easyCreate(ROUTER);
  });

  $("#easySwitchBtn").click(function(){
  	$(".easyBtn").attr("disabled","disabled");
  	$("#easyCreateLoading").css("display","inline");  
	$("#easyCreateLoading").attr("src","./img/loading.gif").addClass("minimumNowloadingIcon");
	jail_easyCreate(SWITCH);
  });

  $("#l3inputData").submit(function(e){
  	console.log("aaa");
  	e.preventDefault();
	//e.preventDefault();
  });


  //コンソールの初期化ボタン	
  $("#consoleUnregisterBtn").click(function(){
  		if(consoleName != ""){
  			console_unregister(consoleName);
  			consoleName = ""
  		}
  });


  //フォーカスイベント


  //newMachineFormでtemplateを選択した時
  $("#newMachineForm .template").change(function(){
	var pkg;
	var name = ($("#newMachineForm .template option:selected").text());
	$("#newMachineForm .package").empty();
	pkg = (db_template("select",name)).pkg;
	pkg = pkg.split(";");
	pkg.forEach(function(pkg, index){
	  $("#newMachineForm .package").append($("<option disabled>").html(pkg).val(0)); 
	});
	

  });

  //モーダルが開いた時のイベント
  $('#newPackageModal, #newTemplateModal').on('shown.bs.modal', function() {
	$(".installedPkgLoading").attr("src","./img/loading.gif").addClass("minimumNowloadingIcon");
	$(".installedPkgLoading").attr("src","./img/loading.gif").addClass("minimumNowloadingIcon");
	var data = { mode : "pkg",
				 control : "list",
				}
	send(MACHINE,data);
  });

	//shellモーダルが開いたら
  $("#shellModal").on("shown.bs.modal", function(){
	$("#term").html("<span class=\"ff be\">Now loading...</span>");
	jname = $("#jName").val()
	console_register(jname);
  });


  //モーダルが消えた場合のイベント
  $('#newPackageModal, #newTemplateModal').on('hidden.bs.modal', function () {      //newTemplateとnewPackageは構造が似ているので同じ関数に
	$("#newPackageModal .modal-dialog .modal-content select option").remove();
	$("#newTemplateModal .modal-dialog .modal-content select option").remove();
	$("#pkgCheckBox").empty();
	$("#packageSearchForm .searchText").val("");
	$("#templateCreateForm .name").val("");
	reloadDB();
	
  });

  $('#nowLoadingModal').on('hidden.bs.modal', function () {
   $("#nowLoadingModal .modal-dialog .modal-content span").remove();
  });

  $('#newMachineModal').on('hidden.bs.modal', function () {
   $("#newMachineModal .modal-dialog .modal-content .modal-body .name").val("");
   $("#newMachineModal .modal-dialog .modal-content .modal-body .machineType").val("0");
   $("#newMachineModal .modal-dialog .modal-content .modal-body .template").val("0");
   $("#newMachineModal .modal-dialog .modal-content .modal-body .flavour").val("0");
   $("#newMachineModal .modal-dialog .modal-content .modal-body .comment").val("");
   $("#newMachineModal .modal-dialog .modal-content .modal-body .package option").remove();
  });

  $('#confirmModal').on('hidden.bs.modal', function () {
   $("#confirmModal .modal-dialog .modal-content span").remove();
   $("#confirmForm .cmd").empty();
  });

  //shellモーダルが消えたら
  $("#shellModal").on("hidden.bs.modal", function(){
	console_unregister(jname);
	jname = "masterRouter";
  });

	
	//machineInfoモーダルが消えたら
  $("#machineInfoModal").on("hidden.bs.modal", function(){
  		if(consoleName != ""){
  	//		console_unregister(consoleName);
  			console_suspend();
  			consoleName = ""
  		}
  	});

	//タブイベント
	//shellタブが開いたら
  $("a[href='#machineInfo_shell']").click(function(){
  	if(consoleName == ""){
		$("#term").html("<span class=\"ff be\">Now loading...</span>");
		consoleName = $("#machineInfoModalTitle").text();
		console_register(consoleName);
	}
	setTimeout(function(){$("#term").focus()},500);	//focus
  });

	//入力イベント
	//l3inputData
	//カーソル、Tab、Shift以外のkeyupを認める
	$("body").on('keyup', "#l3inputData input", function(e){
		if ($(this).val().length == 3 && e.keyCode != 9 && e.keyCode != 16 && !(37 <= e.keyCode && e.keyCode <= 40) ) { // 次入力欄にフォーカス移動 
		//	$('#l3inputData .ipaddr2').focus(); 
			if( $(this).hasClass("ipaddr4") ){
				$("#l3inputData .ipmask1").focus();
			}else{
				$(this).next().focus();
			}
		} 
	});

	//ipmask
	//ipmaskフィールドにフォーカスが当たった時、一度だけmaskを自動入力する。自動入力したらhiddenフィールドにmaskパラメータを付加する
	$("body").on('focus', "#l3inputData .ipmask1", function(e){
		if(!$("#l3inputData .param").hasClass("mask")){
			if($("#l3inputData .ipaddr1").val() == "10"){
				$("#l3inputData .ipmask1").val("255");
				$("#l3inputData .ipmask2").val("0");
				$("#l3inputData .ipmask3").val("0");
				$("#l3inputData .ipmask4").val("0");
			}else if($("#l3inputData .ipaddr1").val() == "172" && (16 <= parseInt($("#l3inputData .ipaddr2").val(),10) && parseInt($("#l3inputData .ipaddr2").val(),10) <= 31) ){
				$("#l3inputData .ipmask1").val("255");
				$("#l3inputData .ipmask2").val("255");
				$("#l3inputData .ipmask3").val("0");
				$("#l3inputData .ipmask4").val("0");
			}else if($("#l3inputData .ipaddr1").val() == "192" && $("#l3inputData .ipaddr2").val() == "168"){
				$("#l3inputData .ipmask1").val("255");
				$("#l3inputData .ipmask2").val("255");
				$("#l3inputData .ipmask3").val("255");
				$("#l3inputData .ipmask4").val("0");
			}
		$("#l3inputData .param").addClass("mask");
		}
	});


	//その他

	//contextmenuを閉じる
	$(document).click(function() {
		if(openContext){
			context_hide();
			openContext = false;
		}
	});

	//test
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


//IPアドレスモーダル
function l3Modal_show(name,epair){
	$("#l3Form .name").text(name);
	$("#l3Form .link").text(epair);
	$("#l3Modal").modal("show");
}


//contextを形成する

function context_addList(caption,func){
	$("#contextMenu .dropdown-menu").append('<li><a "tabindex="-1" href="javascript:' + func + ';context_hide();">' + caption + '</a></li>');
}

function context_show(){
	$("#contextMenu").css({
		display: "block",
		left: d3.event.pageX,
		top: d3.event.pageY
	});
}

function context_divider(){
	$("#contextMenu .dropdown-menu").append('<li class="divider"></li>');
}

function context_hide(){
	$("#contextMenu").hide();
	$("#contextMenu .dropdown-menu").empty();
}

function context_nest(caption, array){
	var str="";
	str +='<li class="dropdown-submenu">\n'
	str +='	<a tabindex="-1" href="#">' + caption + '</a>\n'
	str +='	<ul class="dropdown-menu">\n'
	array.forEach(function(value,index){
		str +='		<li><a tabindex="-1" href="javascript:' + value.func + ';context_hide();">' + value.caption + '</a></li>\n';
	});
	str +='	</ul>\n'
	str +='</li>\n'
	$("#contextMenu .dropdown-menu").append(str);
}


//########test





//廃棄


/*

//MachineListでmachineを選択した時
  $("#machineList").change(function(){    //プロパティにフォーカスした項目のname,machineType,commentを表示する
	var name = $("#machineList option:selected").text();
	machine = db_machine("select",name);

	if (machine.boot == "1"){
	  $('#powerSwitch').bootstrapSwitch('state', true, true);
	}else{
	  $('#powerSwitch').bootstrapSwitch('state', false,false);
	}    

	$(".machineProperty .name .name").val(machine.name);
	$(".machineProperty .machineType .machineType").val(machine.type);

	$(".machineProperty .template .template").empty();
	ftemplate = template_list("all");
	ftemplate.forEach(function(value,index){
	  $(".machineProperty .template .template").append($("<option>").html(value).val(index));  
	});
	$(".machineProperty .template .template").val(machine.template);  
	$(".machineProperty .machineType .template").val(ftemplate);
	$(".machineProperty .flavour .flavour").val(machine.flavour);
	$(".machineProperty .comment .comment").val(machine.comment);     
  });

 */

 /*


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

  */