
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
	console.log(linkDB);
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

function diag_createL3(epair,ipaddr,ipmask,ip6addr,ip6mask,as){
	//data = {"epair" : $("#createL3 .epair").val(), "ipaddr" : $("#createL3 .ipaddr").val(), "ipmask" : $("#createL3 .ipmask").val(), "ip6addr" : $("#createL3 .ip6addr").val(), "ip6mask" : $("#createL3 .ip6mask").val(), "as" : $("#createL3 .as").val()};
	data = {"epair" : epair, "ipaddr" : ipaddr, "ipmask" : ipmask, "ip6addr" : ip6addr, "ip6mask" : ip6mask, "as" : as};
	send(NETWORK, {mode: "l3", control: "create", msg : data});
}

function diag_showNodeContextMenu(d){
	$("#jName").val(d.name);
	
	if(d.boot == "1"){
		if(d.name != "masterRouter"){	//基本的にmasterRouterは停止させない
			context_addList("停止", "jail_stop('" + d.name + "')");
		}
		context_addList("他のマシンに接続","diag_connectMode('" + d.name + "')");	

	}else{
		context_addList("起動","jail_start('" + d.name + "')");
	}
	if(d.name != "masterRouter"){
		context_divider();
		context_addList("削除","jail_showDeleteModal('" + d.name + "')");
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

function diag_nowloading(){
	svg.append("rect")
	.style("fill","white")
	.style("opacity","0.7")
	.attr("width",width)
	.attr("height",height);

	svg.append("image")
	.attr("xlink:href", "./img/loading.gif")
    .style("opacity","0.7")
    .attr("x", width/2)
	.attr("y", height/2)
	.attr("width", width/5)
	.attr("height", height/5);
}

function diag_showMachineInfoModal(name){
	machine = db_machine("select",name);
//	console.log("machine.type: " + machine.type);
	var machineType = "";
	switch(machine.type){
		case ROUTER.toString():
			machineType = "Router";
			break;
		case SWITCH.toString():
			machineType = "Switch";
			break;
		default:
			machineType = "Server";
			break;
	}
	var machineTemplate = template_list("all")[machine.template];

	$("#machineInfoModal .modal-dialog .modal-content .modal-header .modal-title").text(machine.name);
	$("#machineData_property .name .name").text(machine.name);
	$("#machineData_property .machineType .machineType").text(machineType);
	$("#machineData_property .template .template").text(machineTemplate);
	$("#machineData_property .comment .comment").text(machine.comment);

	$("#machineNetwork_list").empty();
//	$("#machineNetwork_pane").empty();
	epairList = diag_getepairList(machine.name);
	if(epairList == ""){
		$("#machineNetwork_data").html("利用可能なネットワークはありません");
	}else{
		var str = "";
		$("#machineNetwork_data").html("左のタブから選んでください。");
		epairList.forEach(function(value,index){
			var func = "diag_showNetwork('" + value.epair + "')";
			tabs_addList("#machineNetwork_list", value.caption, func );
		});
	}

	$("#machineInfo a:first").tab('show')
	$("#machineInfo_machineData a:first").tab('show')
	$("#machineInfoModal").modal("show");
}

var l3str = '\
		<div class="l3input">\
			<div class="l3inputName">\
				IPAddr:<br>\
				IPMask:<br>\
				IP6Addr:<br>\
				IP6Plefixlen:<br>\
				ASNum:<br>\
			</div>\
				<form id="l3inputData" action="javascript:diag_l3DataConstract()">\
				<input class="ipaddr1" type="text" style="width: 36px" maxlength=3 pattern="[0-9]{1,3}">.\
				<input class="ipaddr2" type="text" style="width: 36px" maxlength=3 pattern="[0-9]{1,3}">.\
				<input class="ipaddr3" type="text" style="width: 36px" maxlength=3 pattern="[0-9]{1,3}">.\
				<input class="ipaddr4" type="text" style="width: 36px" maxlength=3 pattern="[0-9]{1,3}"><br>\
				<input class="ipmask1" type="text" style="width: 36px" maxlength=3 pattern="[0-9]{1,3}">.\
				<input class="ipmask2" type="text" style="width: 36px" maxlength=3 pattern="[0-9]{1,3}">.\
				<input class="ipmask3" type="text" style="width: 36px" maxlength=3 pattern="[0-9]{1,3}">.\
				<input class="ipmask4" type="text" style="width: 36px" maxlength=3 pattern="[0-9]{1,3}"><br>\
				<input class="ip6addr" type="text" style="width: 360px" pattern="[0-9A-Fa-f:]{1,128}"><br>\
				<input class="ip6mask" type="text" style="width: 36px" maxlength=3 pattern="[0-9]{1,3}"><br>\
				<input class="as" type="text" style="width: 48px" maxlength=5 pattern="[0-9]{1,5}"><br>\
				<input class="epair" type="hidden">\
				<input class="param" type="hidden">\
				<input class="ipaddr1_b" type="hidden" value="" >\
				<input class="ipaddr2_b" type="hidden" value="" >\
				<input class="ipaddr3_b" type="hidden" value="" >\
				<input class="ipaddr4_b" type="hidden" value="" >\
				<input class="ipmask1_b" type="hidden" value="" >\
				<input class="ipmask2_b" type="hidden" value="" >\
				<input class="ipmask3_b" type="hidden" value="" >\
				<input class="ipmask4_b" type="hidden" value="" >\
				<input class="ip6addr_b" type="hidden" value="" >\
				<input class="ip6mask_b" type="hidden" value="" >\
				<input class="as_b" type="hidden" value="" >\
				</form>\
		</div>\
		';

function diag_getepairList(name){
	var epairList = [];
	diag_selectNode(name).forEach(function(value,index){
		epairList.push({"caption": l3DB[value].epair, "epair" : l3DB[value].epair });
	});
	return epairList;
}

function tabs_addList(list,caption,func){
	$(list).append('<li><a href="#" onclick="javascript:' + func + ';" role="tab" data-toggle="tab">' + caption + '</a></li>');
}

function tabs_addPane(content,str){
	$(content).append(str);
}

function diag_showNetwork(epair){
	var index = db_selectDB("l3",epair);
	var db = l3DB[index];
	var str = '<h4>相手側:' + diag_selectTargetNode(epair) + '</h4>' + l3str;

	$("#machineNetwork_data").html(str);
	$("#l3inputData .epair").val(epair);
	if(db.ipaddr != ""){
		ipaddr = db.ipaddr.split(".");
		$("#l3inputData .ipaddr1").val(ipaddr[0]);
		$("#l3inputData .ipaddr2").val(ipaddr[1]);
		$("#l3inputData .ipaddr3").val(ipaddr[2]);
		$("#l3inputData .ipaddr4").val(ipaddr[3]);
		$("#l3inputData .ipaddr1_b").val(ipaddr[0]);
		$("#l3inputData .ipaddr2_b").val(ipaddr[1]);
		$("#l3inputData .ipaddr3_b").val(ipaddr[2]);
		$("#l3inputData .ipaddr4_b").val(ipaddr[3]);
		ipmask = db.ipmask.split(".");
		$("#l3inputData .ipmask1").val(ipmask[0]);
		$("#l3inputData .ipmask2").val(ipmask[1]);
		$("#l3inputData .ipmask3").val(ipmask[2]);
		$("#l3inputData .ipmask4").val(ipmask[3]);
		$("#l3inputData .ipmask1_b").val(ipmask[0]);
		$("#l3inputData .ipmask2_b").val(ipmask[1]);
		$("#l3inputData .ipmask3_b").val(ipmask[2]);
		$("#l3inputData .ipmask4_b").val(ipmask[3]);
	}
	if(db.ip6addr != ""){
		$("#l3inputData .ip6addr").val(db.ip6addr);
		$("#l3inputData .ip6mask").val(db.ip6mask);
		$("#l3inputData .ip6addr_b").val(db.ip6addr);
		$("#l3inputData .ip6mask_b").val(db.ip6mask);
	}
	if(db.as != ""){
		$("#l3inputData .as").val(db.as);
		$("#l3inputData .as_b").val(db.as);
	}

	$("#machineInfo_submit").attr('onclick', 'javascript:$("#l3inputData").trigger("submit")');
	$("#machineInfo_submit").removeAttr("disabled");
}

function diag_l3DataConstract(){
	console.log("l3DataConstract");
//	$("#l3inputData").trigger('submit');
	ipaddr = $("#l3inputData .ipaddr1").val() + "." + $("#l3inputData .ipaddr2").val() + "." + $("#l3inputData .ipaddr3").val() + "." + $("#l3inputData .ipaddr4").val();
	ipmask = $("#l3inputData .ipmask1").val() + "." + $("#l3inputData .ipmask2").val() + "." + $("#l3inputData .ipmask3").val() + "." + $("#l3inputData .ipmask4").val();
	ip6addr = $("#l3inputData .ip6addr").val();
	ip6mask = $("#l3inputData .ip6mask").val();
	as = $("#l3inputData .as").val();
	epair = $("#l3inputData .epair").val();
	diag_createL3(epair,ipaddr,ipmask,ip6addr,ip6mask,as);
}



//epairをGUIで繋ぐためのエフェクト
function diag_connectMode(source) {
  d3linkDB = [];

  svg.remove();

  diag_createLink();  
  svg = d3.select(".diagram").append("svg")
  .attr("width", width)
  .attr("height", height);

  	gradServer = svg.append("svg:defs")
    .append("svg:linearGradient")
      .attr("id", "gradServer")
      .attr("fx","70%")
      .attr("fy","20%");

  	gradServer.append("svg:stop")
    .attr("offset", "0%")
    .attr("stop-color", "#642EFE")
    .attr("stop-opacity", 1)

  	gradServer.append("svg:stop")
    .attr("offset", "100%")
    .attr("stop-color", "#0000ff")
    .attr("stop-opacity", 1)

	gradRouter = svg.append("svg:defs")
    .append("svg:linearGradient")
      .attr("id", "gradRouter")
      .attr("fx","70%")
      .attr("fy","20%");

  	gradRouter.append("svg:stop")
    .attr("offset", "0%")
    .attr("stop-color", "#ff8000")
    .attr("stop-opacity", 1)

  	gradRouter.append("svg:stop")
    .attr("offset", "100%")
    .attr("stop-color", "#FACC2E")
    .attr("stop-opacity", 1)

    gradSwitch = svg.append("svg:defs")
    .append("svg:linearGradient")
      .attr("id", "gradSwitch")
      .attr("fx","70%")
      .attr("fy","20%");

  	gradSwitch.append("svg:stop")
    .attr("offset", "0%")
    .attr("stop-color", "#00aa00")
    .attr("stop-opacity", 1)

  	gradSwitch.append("svg:stop")
    .attr("offset", "100%")
    .attr("stop-color", "#006600")
    .attr("stop-opacity", 1)


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

  if(nodeStyle == CIRCLE){
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
        return "url(#gradServer)";
    }else if(d.type == "1"){
        return "url(#gradRouter)";
    }else{
        return "url(#gradSwitch)";
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
  }
  else if(nodeStyle == CISCO){
  node.append("image")
		.attr("class",function(d){
  		if(d.boot == "1"){
  			return "rotate"
  		}
  		})
		.attr("xlink:href", function(d) {
			//typeによって色を変える
			if(d.type == "0"){
					return "./img/server.svg";
			}else if(d.type == "1"){
					return "./img/router.svg";
			}else{
					return "./img/switch.svg";
			}
		})
		.attr("x", "-16px")
		.attr("y", "-16px")
		.attr("width", "32px")
		.attr("height", "32px")
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


  }


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
  		if(nodeStyle == CIRCLE){
		d3.select(this).select("circle").transition()
				.duration(DUARATION)
				.attr("r", BIGCIRCLESIZE);
		}
		else if(nodeStyle == CISCO){
			d3.select(this).select("image").transition()
			.attr("x", "-24px")
			.attr("y", "-24px")
			.attr("width", "48px")
			.attr("height", "48px");
		}
	}
}

function cnode_mouseout() {
	name = $(d3.select(this).select("text")).text();
	data = machineDB[db_selectDB("machine",name)];
	if(data.boot == "1"){
  		if(nodeStyle == CIRCLE){
		d3.select(this).select("circle").transition()
				.duration(DUARATION)
				.attr("r", CIRCLESIZE);
		}
		else if(nodeStyle == CISCO){
			d3.select(this).select("image").transition()
			.attr("x", "-16px")
			.attr("y", "-16px")
			.attr("width", "32px")
			.attr("height", "32px");
		}
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
