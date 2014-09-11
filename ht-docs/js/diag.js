
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
//  if(data != "none"){ //noneだった場合は代入しない
	linkDB = data;
//  }
}

//サーバから取得したL3(ipアドレスなど)を代入し、diagをリロード
//サーバはlink=>l3の順でデータを送るため、あとのl3でリロードを行う
function diag_l3(data){
//  if(data != "none"){ //noneだった場合は代入しない
	l3DB = data;
//  }
	update();
}

//人間に見やすいsource/targetから、d3.js形式のsource/targetに変換
//linkDB内のsource/targetのnameが、machineDBの要素の何番目に位置するか計算して、その要素の番号を代入、epairも入れ込む
function diag_createLink(){
	var source,target;
	if(linkDB != "none") { //noneだった場合は生成しない
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
}

//選択したノードの詳細を表示
function diag_displayInfo(name){
	$("#jName").text("");
	$("#jName").val("");
	$("#jIP").empty();
	$("#netInfo .shellBtn").val(name);
	$("#jName").text(name);
	$("#jName").val(name);

	diag_selectNode(name).forEach(function(value,index){
	$("#jIP").append("link: " + l3DB[value].epair + "(<=> " + diag_selectTargetNode(l3DB[value].epair) + "), IPAddr: " + l3DB[value].ipaddr + ", IPMask: " + l3DB[value].ipmask + "<br>");
	});

}

function diag_displayLink(epair){
	$("#sendNet .dLink").val(epair);

	epaira = epair + "a";
	epairb = epair + "b";
	epairaName = "_host_";
	epairbName = "_host_";


	l3DB.forEach(function(values,index){
	if(epaira == values.epair){
		epairaName = values.name;
	}
	if(epairb == values.epair){
		epairbName = values.name;
	}
	});

	$("#dLinkA").text(epairaName);
	$("#dLinkB").text(epairbName);

}

function diag_selectNode(name){
	var diagInfo = []
	if(l3DB != "none"){
		l3DB.forEach(function(values,index){
		if(name == values.name){
			diagInfo.push(index);
		}
		});
	}
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

function diag_sendLink(source,target){
	send(NETWORK,{mode: "link", control: "add", msg: {source: source, target: target}});
}

function diag_deleteLink(epair){
	link = epair;
	send(NETWORK,{mode: "link",  control: "delete", msg : link});
}

function diag_getNetworkLog(networkLog){
	if (networkLog.msgType == "success"){   //successメッセージが届いたら、
	status({"mode":STATUS, "msg" : {"msg" : networkLog.msg}});
	diag_getDiag();
	//  reloadDB();
	}
}

function diag_createL3(){
	data = {"epair" : $("#createL3 .epair").val(), "ipaddr" : $("#createL3 .ipaddr").val(), "ipmask" : $("#createL3 .ipmask").val(), "ip6addr" : $("#createL3 .ip6addr").val(), "ip6mask" : $("#createL3 .ip6mask").val(), "as" : $("#createL3 .as").val()};
	
	send(NETWORK, {mode: "l3", control: "create", msg : data});
}

function diag_showNodeContextMenu(d){
	$("#jName").val(d.name);
	
	if(d.boot == "1"){
		if(d.name != "masterRouter"){	//基本的にmasterRouterは停止させない
			context_addList("停止", "jail_stop('" + d.name + "')");
		}
		context_addConsole(d.name);
		context_addList("他のマシンに接続","diag_connectMode('" + d.name + "')");	

	/*	nest =[ {"caption" : "server01(epair3a)", "func" : "diag_setL3()"},{"caption" : "server02(epair3b)", "func" : "diag_setL3()"} ]
		context_nest("IPアドレス設定", nest);*/
	}else{
		context_addList("起動","jail_start('" + d.name + "')");
	}
	context_show();
	setTimeout(function(){		//タイミングの関係でcontextmenuが開いてすぐに閉じるのを防ぐ
		openContext = true;
	},200);
	return false;
}

function diag_showLinkContextMenu(d){
	context_addList("切断","diag_deleteLink('" + d.epair + "')");
	context_show();
	setTimeout(function(){		//タイミングの関係でcontextmenuが開いてすぐに閉じるのを防ぐ
		openContext = true;
	},200);
	return false;
}

function diag_setL3(){
	console.log("diag_setL3");
}


function diag_connectMode(source) {
  d3linkDB = [];

  svg.remove();

  diag_createLink();  
  svg = d3.select(".diagram").append("svg")
  .attr("width", width)
  .attr("height", height);


  force = d3.layout.force()
  .nodes(machineDB)
  .links(d3linkDB)
  .charge(-200)
  .linkDistance(50)
  .size([width, height])
  .charge(function(d) {
    return REPULSE;
  })
  .on("tick", tick);

  link = svg.selectAll(".link")
  .data(d3linkDB, function(l) { return l.source + '-' + l.target; }) //linksデータを要素にバインド
  .enter()
  .append("line")
  .on("mouseover",link_mouseover)
  .on("mouseout",link_mouseout)
  .on("click", function(d){ return clicklink(d);})
  .attr("class", function(d) { return "link "+d.epair;});


 node = svg.selectAll(".node")
  .data(machineDB, function(d) { return d.name;})  //nodesデータを要素にバインド
  .enter().append("g")
  .attr("class", function(d) { return "node "+d.name;})   //[node]と要素の名前をクラスにする
  .on("mouseover", cnode_mouseover)
  .on("mouseout", cnode_mouseout)
  .style("opacity", function(d){
    if(d.boot == "1"){
      return 1;
    }else{
      return 0.05;
    }
  })
  .call(force.drag);


  node.append("circle")
  .attr("r", CIRCLESIZE)
  .attr("class",function(d){
  	if(d.boot == "1"){
  		return "rotate"
  	}
  })
  .style("fill", function(d) {
    //typeによって色を変える
    if(d.type == "0"){
        return "#0000FF";
    }else if(d.type == "1"){
        return "#FF8000";
    }else{
        return "#FFFF00";
    }
  })
  .on("click", function(d) {
       return cclickcircle(d,source);       
  })
  //接続元と起動していないマシンは除外
  .style("stroke", function(d){if(d.boot == "1"&&d.name != source){return "black";}})
  .style("stroke-width", function(d){if(d.boot == "1"&&d.name != source){return "3";}})
  .style("stroke-dasharray",function(d){if(d.boot == "1"&&d.name != source){return ("5,5");}})
  .style("stroke-opacity", function(d){
    if(d.boot == "1"&&d.name != source){
      return 0.5;
    }
  });


  node.append("text")
    .attr("x", 12)
    .attr("dy", ".35em")
    .text(function(d) { return d.name; });

	//回転
  circle = svg.selectAll(".rotate")
  circle.append("animateTransform")
  .attr("attributeType","xml") 
  .attr("attributeName","transform")
  .attr("type","rotate")
  .attr("from","0")
  .attr("to","360")
  .attr("begin","0")
  .attr("dur","5s")
  .attr("repeatCount","indefinite");


   force.start(); //forceグラフの描画を開始

}

function cnode_mouseover() {
	name = $(d3.select(this).select("text")).text();	//textからname抜き出し
	data = machineDB[db_selectDB("machine",name)];		//indexからdata抜き出し
	if(data.boot == "1"){
  		d3.select(this).select("circle").transition()
      	.duration(DUARATION)
      	.attr("r", BIGCIRCLESIZE);
	}
}

function cnode_mouseout() {
	name = $(d3.select(this).select("text")).text();
	data = machineDB[db_selectDB("machine",name)];
	if(data.boot == "1"){
  		d3.select(this).select("circle").transition()
      	.duration(DUARATION)
      	.attr("r", CIRCLESIZE);
	}
}

function cclickcircle(d,source){
	if(d.name == source){
		update();
	}
	else if(d.boot == "1"){
		var target = d.name;
		diag_sendLink(source,target);
	}
}
