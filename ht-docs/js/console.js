//コンソールへのメッセージ
function console_dump(msg){
  if(msg != ""){
	  $("#term").html(msg);
  }
}


function console_write(jname,cmd){
	message = {"mode" : "write" , "msg" : {"jname" : jname, "cmd" : cmd}};
	send(CONSOLE,message);
}

function console_register(jname){
	message = {"mode" : "register", "jname" : jname};
	send(CONSOLE,message);
	console_write(jname,"%0D");
}

function console_unregister(jname){
	message = {"mode" : "unregister", "jname" : jname};
	send(CONSOLE,message);
}

  var is_scroll=false;
  var curr_overlay=0;
  var sel_overlay=1;
  var cy=0;
	window.onselectstart=function() {return false;};
  // Toggle scroll
  function ts() {
	is_scroll=!is_scroll;
	so(sel_overlay);
  }
  // Set overlay
  function so(value) {
	curr_overlay=value;
	if (value>0)
	  sel_overlay=value;
	scroll(cy);
	for(var i=0;i<10;i++)
	  document.getElementById("ol"+i).style.display=(value == i)?'block':'none';
	var term=document.getElementById("term");
	if(value<0) {
	  document.onkeypress=t.keypress;
	  document.onkeydown=t.keydown;
	  term.onclick=function(){so(sel_overlay);};
	  term.style.cursor="pointer";
	} else {
	  document.onkeypress=null;
	  document.onkeydown=null;
	  term.onclick=null;
	  term.style.cursor=null;
	}
	if (value==1)
	  document.getElementById("t").focus();
  }
  // Send text
  function st() {
	console.log("st");
	var textinput=document.getElementById("t").value;
//	var textinput=keycode;
	document.getElementById("t").value='';
	for(var i=0;i<textinput.length;i++)
	  t.sendkey(textinput.charCodeAt(i));
	if(!textinput.length)
	  t.sendkey(13);
	document.getElementById("t").focus();
  }
  // Send key
  function sk(value) {
	var textinput=document.getElementById("t").value;
	if(textinput.length)
	  st();
	t.sendkey(value);
  }
  // Send text and go home
  function sh(value) {
	sk(value);
	  so(-1);
  }
  // Set scroll
  function scroll() {
	var div=document.getElementById("term");
	var sp=0;
	if((curr_overlay>0) && (cy>4))
	  sp=((4-cy)*11)+"px";
	if (!is_scroll)
	  sp=0;
	div.style.top=sp;
  }
  // Handler
  function handler(msg,value) {
	switch(msg) {
	case 'conn':
	  startMsgAnim('Tap for keyboard',800,false);
	  break;
	case 'disc':
	  startMsgAnim('Disconnected',0,true);
	  break;
	case 'curs':
	  cy=value;
	  scroll(cy);
	  break;
	}
  }
  // Animate box
  var msgAnim={timer:null,up:false,duration:300,start:null};
  function msgAnimTimer() {
	var time=(new Date).getTime();
	var fraction;
	alpha=(time-msgAnim.start)/msgAnim.duration;
	if(alpha<0.0)
	  alpha=0.0;
	else if (alpha>1.0) {
		alpha=1.0;
	 endMsgAnim();
	}
	if(!msgAnim.up)
	  alpha=1.0-alpha;
	  var sine=Math.sin((Math.PI/2.0)*alpha);
	document.getElementById('ol0').style.opacity=sine*sine*0.66;
  }

  function startMsgAnim(msg,delay,up) {
  /*
	if(msgAnim.timer!=null) {
	  clearInterval(msgAnim.timer);
	  msgAnim.timer=null;
	}
	document.getElementById('ol0').innerHTML=msg;
	so(0);
	msgAnim.up=up;
	msgAnim.start=(new Date).getTime()+delay-60;
	msgAnimTimer();
	msgAnim.timer=setInterval('msgAnimTimer();',60);
	*/
  }
  function endMsgAnim () {
	if(msgAnim.timer!=null) {
	  clearInterval(msgAnim.timer);
	  msgAnim.timer=null;
	}
	if(!msgAnim.up)
	  so(-1);
  }