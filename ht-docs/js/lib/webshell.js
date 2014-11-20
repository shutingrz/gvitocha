/*
""" WebShell Server """
""" Released under the GPL 2.0 by Marc S. Ressl """
*/

webshell={};
webshell.TerminalClass=function(id,width,height,handler) {
	var ie=0;
	if(window.ActiveXObject)
		ie=1;
	var sid=""+Math.round(Math.random()*1000000000);
	var kb=[];
	var isactive=false;
	var islocked=false;
	var qtimer;
	var qtime=100;
	var retry=0;
	var cy=0;
	var div=document.getElementById(id);

	function shupdate() {
		if(initok) {
			var ssend="";
			while(kb.length>0)
				ssend+=kb.pop();
			console_write(jname,ssend);
			
		}
	}
	function queue(s) {
		kb.unshift(s);
		qtime=100;
		islocked = false;
		if(!islocked) {
			window.clearTimeout(qtimer);
			qtimer=window.setTimeout(shupdate,1);
		}
	}
	function private_sendkey(kc) {
		var k="";
		// Build character
		switch(kc) {
		case 126:k="~~";break;
		case 63232:k="~A";break;// Up
		case 63233:k="~B";break;// Down
		case 63234:k="~D";break;// Left
		case 63235:k="~C";break;// Right
		case 63276:k="~1";break;// PgUp
		case 63277:k="~2";break;// PgDn
		case 63273:k="~H";break;// Home
		case 63275:k="~F";break;// End
		case 63302:k="~3";break;// Ins
		case 63272:k="~4";break;// Del
		case 63236:k="~a";break;// F1
		case 63237:k="~b";break;// F2
		case 63238:k="~c";break;// F3
		case 63239:k="~d";break;// F4
		case 63240:k="~e";break;// F5
		case 63241:k="~f";break;// F6
		case 63242:k="~g";break;// F7
		case 63243:k="~h";break;// F8
		case 63244:k="~i";break;// F9
		case 63245:k="~j";break;// F10
		case 63246:k="~k";break;// F11
		case 63247:k="~l";break;// F12
		default:k=String.fromCharCode(kc);
		}
		queue(encodeURIComponent(k));
	};
	this.update = function(jname2){
		jname = jname2
		shupdate();
	}
	this.sendkey = function(kc) {
		private_sendkey(kc);
	}
	this.keypress = function(ev) {
		// Translate to standard keycodes
		if (!ev) var ev=window.event;
		var kc;
//alert('kc:'+ev.keyCode+' which:'+ev.which+' ctrlKey:'+ev.ctrlKey);
		if (ev.keyCode) kc=ev.keyCode;
		if (ev.which) kc=ev.which;
		if (ev.ctrlKey) {
			if (kc>=0 && kc<=32) kc=kc;
			else if (kc>=65 && kc<=90) kc-=64;
			else if (kc>=97 && kc<=122) kc-=96;
			else {
				switch (kc) {
				case 54:kc=30;break;	// Ctrl-^
				case 109:kc=31;break;	// Ctrl-_
				case 219:kc=27;break;	// Ctrl-[
				case 220:kc=28;break;	// Ctrl-\
				case 221:kc=29;break;	// Ctrl-]
				default: return true;
				}
			}
		} else if (ev.which==0) {
			switch(kc) {
			case 8: break;			// Backspace
			case 9: break;			//TAB
			case 27: break;			// ESC
			case 33:kc=63276;break;	// PgUp
			case 34:kc=63277;break;	// PgDn
			case 35:kc=63275;break;	// End
			case 36:kc=63273;break;	// Home
			case 37:kc=63234;break;	// Left
			case 38:kc=63232;break;	// Up
			case 39:kc=63235;break;	// Right
			case 40:kc=63233;break;	// Down
			case 45:kc=63302;break;	// Ins
			case 46:kc=63272;break;	// Del
			case 112:kc=63236;break;// F1
			case 113:kc=63237;break;// F2
			case 114:kc=63238;break;// F3
			case 115:kc=63239;break;// F4
			case 116:kc=63240;break;// F5
			case 117:kc=63241;break;// F6
			case 118:kc=63242;break;// F7
			case 119:kc=63243;break;// F8
			case 120:kc=63244;break;// F9
			case 121:kc=63245;break;// F10
			case 122:kc=63246;break;// F11
			case 123:kc=63247;break;// F12
			default: return true;
			}
		}
		if(kc==8) kc=127;
		private_sendkey(kc);
		
		ev.cancelBubble=true;
		if (ev.stopPropagation) ev.stopPropagation();
		if (ev.preventDefault) ev.preventDefault();

		return true;
	}
	this.keydown = function(ev) {
		if (!ev) var ev=window.event;
		if (ie) {
			o={9:1,8:1,27:1,33:1,34:1,35:1,36:1,37:1,38:1,39:1,40:1,45:1,46:1,112:1,
				113:1,114:1,115:1,116:1,117:1,118:1,119:1,120:1,121:1,122:1,123:1};
			if (o[ev.keyCode] || ev.ctrlKey || ev.altKey) {
				ev.which=0;
				return keypress(ev);
			}
		}
	}
	qtimer=window.setTimeout(shupdate,1);
}
webshell.Terminal=function(id,width,height,handler) {
	return new this.TerminalClass(id,width,height,handler);
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
	
  }
  function endMsgAnim () {
	if(msgAnim.timer!=null) {
	  clearInterval(msgAnim.timer);
	  msgAnim.timer=null;
	}
	if(!msgAnim.up)
	  so(-1);
  }