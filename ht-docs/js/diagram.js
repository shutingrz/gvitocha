
var jailset_nodes_mod = [
      {id:1,name:"masterRouter",type:1,templete:0,flavour:0,comment:""},
      {id:1,name:"switch",type:2,templete:0,flavour:0,comment:""},
      {id:1,name:"server01",type:0,templete:0,flavour:0,comment:""},
      {id:1,name:"server02",type:0,templete:0,flavour:0,comment:""}
];

var jailset_links_mod = [
//    {source : 0, target : 1, sname : "masterRouter", tname : "switch"/*, ipaddr : "switch", ipmask : "", ip6addr : "", ip6mask : "", as : ""*/}, 
//    {source : 2, target : 1, sname : "server01", tname : "switch"/*, ipaddr : "switch", ipmask : "", ip6addr : "", ip6mask : "", as : ""*/}, 
//    {source : 3, target : 1, sname : "server02", tname : "switch"/*, ipaddr : "switch", ipmask : "", ip6addr : "", ip6mask : "", as : ""*/}
    {source : "masterRouter", target : "switch"/*, ipaddr : "switch", ipmask : "", ip6addr : "", ip6mask : "", as : ""*/}, 
    {source : "server01", target : "switch"/*, ipaddr : "switch", ipmask : "", ip6addr : "", ip6mask : "", as : ""*/}, 
    {source : "server02", target : "switch"/*, ipaddr : "switch", ipmask : "", ip6addr : "", ip6mask : "", as : ""*/}

  ];  

function diagram (){


var width = 960;
var height = 500;

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)

var node;
var link;

var force = d3.layout.force()
//  .nodes(jailset_nodes_mod)
//  .links(edges)
  .nodes(jailset_nodes_mod)
  .links(jailset_links_mod)
  .charge(-200)
  .linkDistance(50)
  .size([width, height])
  .on("tick", tick);

function tick() {
    link = svg.selectAll(".link");
    link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    node = svg.selectAll(".node");
    node
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
};

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
  delNodeB(d.name);
}



function update() {
  link = svg.selectAll(".link").remove();
  node = svg.selectAll(".node").remove();

  link = svg.selectAll(".link")
  //.data(jailset_links_mod)
  .data(jailset_links_mod, function(l) { return l.source + '-' + l.target; }) //linksデータを要素にバインド
  .enter()
  .append("line")
  .attr("class", "link");

 node = svg.selectAll(".node")
  //.data(jailset_nodes_mod)
  .data(jailset_nodes_mod, function(d) { return d.name;})  //nodesデータを要素にバインド
  .enter().append("g")
  .attr("class", "node")
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

//    node.remove(); //要らなくなった要素を削除

   force.start(); //forceグラグの描画を開始
}

function delNodeB(name) {
    jailset_nodes_mod = jailset_nodes_mod.filter(function(n) { return n.name !== name; });
    jailset_links_mod = jailset_links_mod.filter(function(l) { return (l.sname !== name && l.tname !== name); });
    update();
}

function addNodeE(){
    var nodeE = {id: "e"};
    nodes.push(nodeE);
    var nA = nodes.filter(function(n) { return n.id === 'a'; })[0];
    var linkAE = {source: nA , target: nodeE};
    links.push(linkAE);
    update();
}

update();
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