
var netDiag = [];


var d3linkDB = [];


var width = 950;
var height = 500;

var HOSTNAME = "_host_"
var MRTNAME = "masterRouter"
var HOSTWIDTH = width/2;
var HOSTHEIGHT = height/6;
var MRTWIDTH = width/2;
var MRTHEIGHT = ((height/6)+30);
var REPULSE = -500;       //反発力
var DUARATION = 750;      //
var CIRCLESIZE = 8;       //標準状態の円の大きさ
var BIGCIRCLESIZE = 16;   //大きい時(たとえばカーソルフォーカス時)の円の大きさ

var svg = d3.select(".diagram").append("svg")
  .attr("width", width)
  .attr("height", height);

var link = svg.selectAll(".link");
var node = svg.selectAll(".node");

var force;


/*
tick:linkの座標を特定
host(HOSTNAME)とmasterRouter(MRTNAME)は固定

*/
function tick() {
    link = svg.selectAll(".link");
    link
      .attr("x1", function(d) { 
                    if(d.source.name == HOSTNAME){
                      return HOSTWIDTH;
                    }else if(d.source.name == MRTNAME){
                      return MRTWIDTH;
                    }else{
                      return d.source.x; 
                    }
                  })
      .attr("y1", function(d) { 
                    if(d.source.name == HOSTNAME){
                      return HOSTHEIGHT;
                    }else if(d.source.name == MRTNAME){
                      return MRTHEIGHT;
                    }else{
                      return d.source.y; 
                    }
                  })
      .attr("x2", function(d) { 
                    if(d.target.name == HOSTNAME){
                      return HOSTWIDTH;
                    }else if(d.target.name == MRTNAME){
                      return MRTWIDTH;
                    }else{
                      return d.target.x; 
                    }
                  })
      .attr("y2", function(d) { 
                    if(d.target.name == HOSTNAME){
                      return HOSTHEIGHT;
                    }else if(d.target.name == MRTNAME){
                      return MRTHEIGHT;
                    }else{
                      return d.target.y; 
                    }
                  });

    node = svg.selectAll(".node");
    node
      .attr("transform", function(d) {
                          if(d.name == HOSTNAME){
                            return "translate(" + HOSTWIDTH + "," + HOSTHEIGHT + ")";
                          }else if(d.name == MRTNAME){
                            return "translate(" + MRTWIDTH + "," + MRTHEIGHT + ")";
                          }else{
                            return "translate(" + d.x + "," + d.y + ")";
                          }
                        });
}

function node_mouseover() {
  d3.select(this).select("circle").transition()
      .duration(DUARATION)
      .attr("r", 16);

}

function node_mouseout() {
  d3.select(this).select("circle").transition()
      .duration(DUARATION)
      .attr("r", 8);
}

function link_mouseover() {
  d3.select(this)
    .style("stroke","#666")
    .style("stroke-width","16.5px")
    .transition()
    .duration(DUARATION)
    .attr("r", 8);
}

function link_mouseout() {
  d3.select(this)
    .style("stroke","#ccc")
    .style("stroke-width","5.5px")
    .transition()
    .duration(DUARATION)
    .attr("r", 8);
}

function clickcircle(d){
//  delNode(d.name);  /* こいつはノードを消す */
//  update();
diag_displayInfo(d.name);
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
  .on("mouseover", node_mouseover)
  .on("mouseout", node_mouseout)
  .call(force.drag);


  node.append("circle")
  .attr("r", 10)
  .style("fill", function(d) {
    if(d.type == "0"){
      return "blue";
    }else if(d.type == "1"){
      return "orange";
    }else{
      return "yellow";
    }
  })
  .on("click", function(d) {
       return clickcircle(d);       
  });

  node.append("text")
    .attr("x", 12)
    .attr("dy", ".35em")
    .text(function(d) { return d.name; });


   force.start(); //forceグラフの描画を開始

}



function delNode(name) {
  console.log(machineDB.filter(function(n) { return n.name !== name; }));
  console.log(linkDB.filter(function(l) { return (l.source !== name && l.target !== name); }));
    machineDB = machineDB.filter(function(n) { return n.name !== name; });
    linkDB = linkDB.filter(function(l) { return (l.source !== name && l.target !== name); });
}

/*function init(){
  pushNetDiag();
  update();
}*/

