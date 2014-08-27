
var netDiag = [];

var machineDB = [
      {name:"_host_",type:1,templete:0,flavour:0,comment:""},
      {name:"masterRouter",type:1,templete:0,flavour:0,comment:""},
      {name:"switch01",type:2,templete:0,flavour:0,comment:""},
      {name:"server01",type:0,templete:0,flavour:0,comment:""},
      {name:"server02",type:0,templete:0,flavour:0,comment:""},
      {name:"switch02",type:2,templete:0,flavour:0,comment:""},
      {name:"mswitch",type:2,templete:0,flavour:0,comment:""},
      {name:"server03",type:0,templete:0,flavour:0,comment:""},
      {name:"server04",type:0,templete:0,flavour:0,comment:""},
      {name:"switch011",type:2,templete:0,flavour:0,comment:""},
      {name:"switch012",type:2,templete:0,flavour:0,comment:""},
      {name:"server05",type:0,templete:0,flavour:0,comment:""},
      {name:"server06",type:0,templete:0,flavour:0,comment:""},
      {name:"server07",type:0,templete:0,flavour:0,comment:""},
      {name:"server08",type:0,templete:0,flavour:0,comment:""},
      {name:"server09",type:0,templete:0,flavour:0,comment:""},
      {name:"server10",type:0,templete:0,flavour:0,comment:""}


];

var jailset_links_name = [
    {source : "_host_", target: "masterRouter"},
    {source : "masterRouter", target: "mswitch"},
    {source : "mswitch", target: "switch01"},
    {source : "mswitch", target: "switch02"},
    {source : "server01", target : "switch011"/*, ipaddr : "switch", ipmask : "", ip6addr : "", ip6mask : "", as : ""*/}, 
    {source : "server02", target : "switch011"/*, ipaddr : "switch", ipmask : "", ip6addr : "", ip6mask : "", as : ""*/},
    {source : "server03", target : "switch02"},
    {source : "server04", target : "switch02"},
    {source : "switch01", target : "switch011"},
    {source : "switch01", target : "switch012"},
    {source : "server05", target : "switch012"},
    {source : "server06", target : "switch012"} 
];  

var jailset_network = [
    {name: "_host_", ipaddr : "10.254.254.1", ipmask : "255.255.255.0", ip6addr : "", ip6mask : "", as : ""},
    {name:"masterRouter", ipaddr : "10.254.254.2", ipmask : "255.255.255.0", ip6addr : "", ip6mask : "", as : ""},
    {name:"masterRouter", ipaddr : "192.168.20.1", ipmask : "255.255.255.0", ip6addr : "", ip6mask : "", as : ""}, 
    {name:"server01", ipaddr : "192.168.20.11", ipmask : "255.255.255.0", ip6addr : "", ip6mask : "", as : ""}, 
    {name:"server02", ipaddr : "192.168.20.12", ipmask : "255.255.255.0", ip6addr : "", ip6mask : "", as : ""}, 

  ]; 

var jailset_links_mod = [];

//function diagram (){


var width = 960;
var height = 500;

var HOSTNAME = "_host_"
var MRTNAME = "masterRouter"
var HOSTWIDTH = width/2;
var HOSTHEIGHT = height/6;
var MRTWIDTH = width/2;
var MRTHEIGHT = ((height/6)+30);
var REPULSE = -500;

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

function mouseover() {
  d3.select(this).select("circle").transition()
      .duration(750)
      .attr("r", 16);
}

function mouseout() {
  d3.select(this).select("circle").transition()
      .duration(750)
      .attr("r", 8);
}

function clickcircle(d){
//  delNode(d.name);  /* こいつはノードを消す */
//  update();
displayInfo(d.name);
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
  jailset_links_mod = [];

  createLinkDiag();
  console.log(jailset_links_mod)
  
  svg.remove();
  svg = d3.select(".diagram").append("svg")
  .attr("width", width)
  .attr("height", height);


  link = svg.selectAll(".link").remove();
  node = svg.selectAll(".node").remove();

  force = d3.layout.force()
//  .nodes(machineDB)
//  .links(edges)
  .nodes(machineDB)
  .links(jailset_links_mod)
  .charge(-200)
  .linkDistance(50)
  .size([width, height])
  .charge(function(d) {
    return REPULSE;
  })
  .on("tick", tick);

  link = svg.selectAll(".link")
  //.data(jailset_links_mod)
  .data(jailset_links_mod, function(l) { return l.source + '-' + l.target; }) //linksデータを要素にバインド
  .enter()
  .append("line")
  .attr("class", "link");

 node = svg.selectAll(".node")
  //.data(machineDB)
  .data(machineDB, function(d) { return d.name;})  //nodesデータを要素にバインド
  .enter().append("g")
  .attr("class", function(d) { return "node "+d.name;})   //[node]と要素の名前をクラスにする
  .on("mouseover", mouseover)
  .on("mouseout", mouseout)
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


   force.start(); //forceグラグの描画を開始
}



function delNode(name) {
  console.log(machineDB.filter(function(n) { return n.name !== name; }));
  console.log(jailset_links_name.filter(function(l) { return (l.source !== name && l.target !== name); }));
    machineDB = machineDB.filter(function(n) { return n.name !== name; });
    jailset_links_name = jailset_links_name.filter(function(l) { return (l.source !== name && l.target !== name); });
}

function selectNode(name){

  machineDB.forEach(function(values,index){
 //   console.log(values.name);
    if(name == values.name){
      console.log(index);
    }
  });
}

function selectDiag(name){
  var diagInfo = []

  netDiag.forEach(function(values,index){
    if(name == values[0]){
    //  console.log(index);
      diagInfo.push(index);
    }
  });
  return diagInfo;

}

function createLinkDiag(){
  var source,target;
//  jailset_links_mod = [];
  jailset_links_name.forEach(function(lvalues,lindex){
    machineDB.forEach(function(nvalues,nindex){
      if(lvalues.source == nvalues.name){
        source = nindex;
      }
      if(lvalues.target == nvalues.name){
        target = nindex;
      }
    });
    jailset_links_mod.push({source : source, target : target});
  });
}

function pushNetDiag(){
  jailset_network.forEach(function(value,index){
    netDiag.push([value.name, value.ipaddr , value.ipmask, value.ip6addr, value.ip6mask, value.as]);
  });
}

function init(){
  pushNetDiag();
  update();
}

function displayInfo(name){
  $("#jName").text("");
  $("#jIP").empty();

  $("#jName").text(name);

  selectDiag(name).forEach(function(value,index){
    $("#jIP").append("IPAddr: " + jailset_network[value].ipaddr + ", IPMask: " + jailset_network[value].ipmask + "<br>");
  });
}

//var nodes = {};
/*
// Compute the distinct nodes from the links.
links.forEach(function(link) {
  link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
  link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
});
*/



/*
var jailset = {
    key1:
      {id:1,name:"switch",type:2,templete:0,flavour:0,comment:""},
    key2:
      {id:2,name:"server01",type:0,templete:0,flavour:0,comment:""},
    key3:
      {id:3,name:"server02",type:0,templete:0,flavour:0,comment:""}
}

var jailset_mod = {
    nodes: [
      {id:1,name:"switch",type:2,templete:0,flavour:0,comment:""},
      {id:2,name:"server01",type:0,templete:0,flavour:0,comment:""},
      {id:3,name:"server02",type:0,templete:0,flavour:0,comment:""}
    ]
}
*/


/*
var jailset_link = {
    :epair0a=>["_host_", "10.254.254.1", "255.255.255.0", "", "", ""], 
    :epair0b=>["masterRouter", "10.254.254.2", "255.255.255.0", "", "", ""], 
    :epair1a=>["masterRouter", "192.168.20.1", "255.255.255.0", "", "", ""], 
    :epair1b=>["switch", "switch", "", "", "", ""], 
    :epair2a=>["server01", "192.168.20.11", "255.255.255.0", "", "", ""], 
    :epair2b=>["switch", "switch", "", "", "", ""], 
    :epair3a=>["server02", "192.168.20.12", "255.255.255.0", "", "", ""], 
    :epair3b=>["switch", "switch", "", "", "", ""]
  };
  */


  /*
var jailset_link_mod = [
    {source : "epair0a", target : "_host_", ipaddr : "10.254.254.1", ipmask : "255.255.255.0", ip6addr : "", ip6mask : "", as : ""},
    {source : "epair0b", target : "masterRouter", ipaddr : "10.254.254.2", ipmask : "255.255.255.0", ip6addr : "", ip6mask : "", as : ""},
    {source : "epair1a", target : "masterRouter", ipaddr : "192.168.20.1", ipmask : "255.255.255.0", ip6addr : "", ip6mask : "", as : ""}, 
    {source : "epair1b", target : "switch", ipaddr : "switch", ipmask : "", ip6addr : "", ip6mask : "", as : ""}, 
    {source : "epair2a", target : "server01", ipaddr : "192.168.20.11", ipmask : "255.255.255.0", ip6addr : "", ip6mask : "", as : ""}, 
    {source : "epair2b", target : "switch", ipaddr : "switch", ipmask : "", ip6addr : "", ip6mask : "", as : ""}, 
    {source : "epair3a", target : "server02", ipaddr : "192.168.20.12", ipmask : "255.255.255.0", ip6addr : "", ip6mask : "", as : ""}, 
    {source : "epair3b", target : "switch", ipaddr : "switch", ipmask : "", ip6addr : "", ip6mask : "", as : ""}

  ];  
*/