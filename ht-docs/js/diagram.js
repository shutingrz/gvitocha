
var netDiag = [];


var d3linkDB = [];


var width = 950;
var height = 500;

var CIRCLE = 0;
var CISCO = 1;

var HOSTNAME = "_host_"
var MRTNAME = "masterRouter"
//var HOSTWIDTH = width/2;
//var HOSTHEIGHT = height/6;
var MRTWIDTH = width/2;
var MRTHEIGHT = height/6;
var REPULSE = -500;       //反発力
var DUARATION = 750;      //
var CIRCLESIZE = 12;       //標準状態の円の大きさ
var BIGCIRCLESIZE = 25;   //大きい時(たとえばカーソルフォーカス時)の円の大きさ
var LINKSIZE = 8;
var BIGLINKSIZE = 16;
var IMAGESIZE = 32;
var BIGIMAGESIZE = 48;

var nodeStyle ;   

var svg = d3.select(".diagram").append("svg")
	.attr("width", width)
	.attr("height", height);

var link = svg.selectAll(".link");
var node = svg.selectAll(".node");

var force;


/*
tick:linkの座標を特定
masterRouter(MRTNAME)は固定
*/
function tick() {
		link = svg.selectAll(".link");
		link
			.attr("x1", function(d) { 
										if(d.source.name == MRTNAME){
											return MRTWIDTH;
										}else{
											return d.source.x; 
										}
									})
			.attr("y1", function(d) { 
										if(d.source.name == MRTNAME){
											return MRTHEIGHT;
										}else{
											return d.source.y; 
										}
									})
			.attr("x2", function(d) { 
										if(d.target.name == MRTNAME){
											return MRTWIDTH;
										}else{
											return d.target.x; 
										}
									})
			.attr("y2", function(d) { 
										if(d.target.name == MRTNAME){
											return MRTHEIGHT;
										}else{
											return d.target.y; 
										}
									});

		node = svg.selectAll(".node");
		node
			.attr("transform", function(d) {
													if(d.name == MRTNAME){
														return "translate(" + MRTWIDTH + "," + MRTHEIGHT + ")";
													}else{
														return "translate(" + d.x + "," + d.y + ")";
													}
												});
}

function node_mouseover() {
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

function node_mouseout() {
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

function link_mouseover() {
	d3.select(this)
		.style("stroke","#666")
		.style("stroke-width","16.5px")
		.transition()
		.duration(DUARATION)
		.attr("r", BIGLINKSIZE);
}

function link_mouseout() {
	d3.select(this)
		.style("stroke","#ccc")
		.style("stroke-width","5.5px")
		.transition()
		.duration(DUARATION)
		.attr("r", LINKSIZE);
}

function clickcircle(d){
	if($('.noclick').length){	//noclick属性がついていたらドラッグしているのでモーダルを表示させない
		d3.select(".noclick").classed("noclick", false);
	}else if(d.boot == "1"){
		diag_showMachineInfoModal(d.name);
	}
}

function clicklink(d){
	diag_displayLink(d.epair);
}


function addNode(){
		var nodeE = {id: "e"};
		nodes.push(nodeE);
		var nA = nodes.filter(function(n) { return n.id === 'a'; })[0];
		var linkAE = {source: nA , target: nodeE};
		links.push(linkAE);
		update();
}

function update() {
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
	.on('contextmenu',function(d,i){
		diag_showLinkContextMenu(d);
	})
	.attr("class", function(d) { return "link "+d.epair;});


	node = svg.selectAll(".node")
	.data(machineDB, function(d) { return d.name;})  //nodesデータを要素にバインド
	.enter().append("g")
	.attr("class", function(d) { return "node "+d.name;})   //[node]と要素の名前をクラスにする
	.on("mouseover", node_mouseover)
	.on("mouseout", node_mouseout)
	.style("opacity", function(d){    //透明度
		if(d.boot == "1"){
			return 1;
		}else{
			return 0.4;
		}
	})
	.call(force.drag);

	var drag = force.drag();
	drag.origin(function(d) { return d; })
	.on("drag", function(d){	//ドラッグしたら
		d3.select(this).classed("noclick", true);	//noclick属性をつける
	});

	if(nodeStyle == CIRCLE){
		node.append("circle")
		.attr("r", CIRCLESIZE)
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
				 return clickcircle(d);   
			//	return diag_showMachineInfoModal(d);    
		})
		.on('contextmenu',function(d,i){
			diag_showNodeContextMenu(d);
		});
	}
	else if(nodeStyle == CISCO){
		node.append("image")
		.attr("class", "circle")
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
		.on("click", clickcircle)
		.on('contextmenu',function(d,i){
			diag_showNodeContextMenu(d);
		});
	}


	node.append("text")
		.attr("x", 12)
		.attr("dy", ".35em")
		.text(function(d) { return d.name; });


	 force.start(); //forceグラフの描画を開始

}
