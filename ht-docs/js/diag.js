
function diag(data){
  if(data.mode == "link"){
    diag_link(data.msg);
  }else if(data.mode == "l3"){
    diag_l3(data.msg);
  }
}

//サーバからグラフ情報を取得
function diag_getDiag(){
  send(NETWORK,{"mode":"list"})

}

//サーバから取得したepairの接続状態(L2)を代入
function diag_link(data){
  linkDB = data;
/*  linkDB.forEach(function(values,index){
    console.log(values);
  });*/
}

//サーバから取得したL3(ipアドレスなど)を代入し、diagをリロード
//サーバはlink=>l3の順でデータを送るため、あとのl3でリロードを行う
function diag_l3(data){
  l3DB = data;
/*  l3DB.forEach(function(values,index){
    console.log(values);
  });*/
  reloadDiag();

}

//人間に見やすいsource/targetから、d3.js形式のsource/targetに変換
//linkDB内のsource/targetのnameが、machineDBの要素の何番目に位置するか計算して、その要素の番号を代入
function diag_createLink(){
  var source,target;
  linkDB.forEach(function(lvalues,lindex){
    machineDB.forEach(function(nvalues,nindex){
      if(lvalues.source == nvalues.name){
        source = nindex;
      }
      if(lvalues.target == nvalues.name){
        target = nindex;
      }
    });
    d3linkDB.push({source : source, target : target, epair : lvalues.epair});
  });
}

//選択したノードの詳細を表示
function diag_displayInfo(name){
  $("#jName").text("");
  $("#jIP").empty();

  $("#jName").text(name);

  diag_selectNode(name).forEach(function(value,index){
    $("#jIP").append("link: " + l3DB[value].epair + "(to " + diag_selectTargetNode(l3DB[value].epair) + "), IPAddr: " + l3DB[value].ipaddr + ", IPMask: " + l3DB[value].ipmask + "<br>");
  });
}

function diag_selectNode(name){
  var diagInfo = []

  l3DB.forEach(function(values,index){
    if(name == values.name){
      diagInfo.push(index);
    }
  });
  return diagInfo;

}

function diag_selectTargetNode(epair){
  var target;
  var targetName = "epair0a";   //念のためepair0aで初期化しておく
  var epairNum = epair.slice(0,-1); //末尾削除
  
  if(epair.slice(-1) == "a"){   //末尾確認
    target = epairNum + "b";
  }else{
    target = epairNum + "a";
  }

  l3DB.forEach(function(values,index){
    if(target == values.epair){
      targetName = values.name;
    }
  });
  return targetName;

}

function diag_sendLink(){
  source = $("#linksource").val();
  target = $("#linktarget").val();
//  console.log(source + "," + target);
  send(NETWORK,{mode: "link", control: "add", msg: {source: source, target: target}});
}

function diag_deleteLink(){
  source = $("#dlinksource").val();
  target = $("#dlinktarget").val();
//  console.log(source + "," + target);
  send(NETWORK,{mode: "link",  control: "delete", msg: {source: source, target: target}});
}

function diag_getNetworkLog(networkLog){
  if (networkLog.msgType == "success"){   //successメッセージが届いたら、
    status({"mode":STATUS, "msg" : {"msg" : networkLog.msg}});
    diag_getDiag();
  }
}








