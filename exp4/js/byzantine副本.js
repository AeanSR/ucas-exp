var READY = 1;
var NOT_READY = 0;

//天气
var WEATHERS = 3;
var SUNNY = 0;
var RAINY = 1;
var SNOWY = 2;

var LIUBEI = "刘备";
var ZHANGFEI = "张飞";
var ZHAOYUN = "赵云";
var GUANYU = "关羽";
var ZHUGELIANG = "诸葛亮";

function Army(){
	this.globalTime = 0;
	this.transferCondition = "";   // 定义转换为Ready的条件表达式, 后经eval判断
	//  上下文
	this.ArmyID = 0,  // 军队编号
	this.generalName =  LIUBEI,      // 将领名称
	this.troops =  5000,     // 5000人
	this.weahter =  SUNNY,       // SUNNY:晴天, RAINY:雨天, SNOWY: 雪天
	this.armyStatus =  NOT_READY,	//  NOT_READY: 未就绪, READY: 就绪
	this.supply =  5000	//  粮食斤数
}
/*
*	Action: 攻击
*/
Army.prototype.actionAttack = function(){

};
/*
*	Action: 通信
*/
Army.prototype.actionCommunicate = function(){

};

/*
*	Action: 就绪
*/
Army.prototype.actionReady = function(){

};

/*
*	下一小时, 更新上下文
*/
Army.prototype.nextHour = function(){
	this.weahter = Math.floor(Math.random()*WEATHERS)
	this.supply -= Math.floor(Math.random()*200)
};



function GameManager(){
	var _this = this
	this.day = 0
	this.Ajax = new modAjax(1,this);
	this.Ajax.getinfo(this.getSuccessHandler, this.getErrorHandler);
	this.sock = new SockJS('http://127.0.0.1:8888/api/exp3');
	this.sock.onopen = function() {
	     console.log('Established the connection.');
	     _this.sock.send(_this.getLoginJson(_this.userId))
	 };
	 this.sock.onmessage = function(e) {
	     console.log('message', e.data);
	     var msg = $.parseJSON(e.data)
	     if(msg['data_type'] == 'notify'){
	     	if(msg['data']['event'] == 'start'){
	     		_this.log("",'人员就位，游戏开始。', 'sys')
	     		_this.sync()
	     		_this.report()
	     	}
	     	else if(msg['data']['event'] == 'sync'){
	     		_this.day = msg['data']['day']
	     		_this.log("",'新的一天到来，今天是第' + _this.day + '天。' , 'sys')
	     		_this.sync()
	     		_this.report()
	     	}
	     }
	     else if(msg['data_type'] == 'update'){   
	     	_this.userlist = msg['data']
	     	$('#userlist ul').text("")
	     	for(userId in _this.userlist){
	     		_this.userlist[userId]['online']?
	     		$('#userlist ul').append('<li><span style="color:green">' + _this.userlist[userId]['name'] + '</span></li>'):
	     		$('#userlist ul').append('<li><span style="color:grey">' + _this.userlist[userId]['name'] + '</span></li>')
	     	}	     
	     }
	     else if(msg['data_type'] == 'message'){
	     	_this.log(msg['from'],msg['data'],'game')
	     }


	 };
	 this.sock.onclose = function() {
	     console.log('close');
	 };
	 $('#send').click(function(){
	 	_this.sock.send(GM.getMsgJson([], $('#userinput').val(),"message"))
	 });
	 hintCommand = ["TELL", "ATTACK"];
	 nameList = {}
	 hintOtherStatus = ["IS READY", "IS NOT READY"];
	 $("#userinput")
	 .autocomplete({
	 	minLength: 0,
	 	autoFocus:true,
	 	position:{my: "left bottom", at: "left top", collision: "flip"},
	 	source: function(requeset, response){
	 		var s = _this.split(requeset.term)
	 		var len = s.length
	 		var head = s[len-1]
	 		nameList = _this.getNameList()
	 		c1 = s[0] == 'TELL';
	 		c2 = $.inArray(s[1],nameList.concat(["所有人"]))!=-1;
	 		c3 = s[2] == 'THAT'
	 		c4 = $.inArray(s[3],nameList)!=-1
	 		if(len == 1){
	 			response($.ui.autocomplete.filter(hintCommand, head))
	 		}
	 		else if(len == 2){
	 			if(c1){
	 				response($.ui.autocomplete.filter(nameList.concat(["所有人"]), head))
	 			}
	 		}
	 		else if(len == 3){
	 			if(c1 && c2){
	 				response($.ui.autocomplete.filter(["THAT"], head))
	 			}
	 		}

	 		else if(len == 4){
	 			if(c1 && c2 && c3){
	 				response($.ui.autocomplete.filter(nameList, head))
	 			}
	 		}
	 		else if(len == 5){
	 			if(c1 && c2 && c3 && c4){
	 				response($.ui.autocomplete.filter(hintOtherStatus, head))
	 			}

	 		}

	 	},
	 	focus:function(){
	 		return false;
	 	},
	 	select: function(event,ui){
	 		var terms = _this.split(this.value);
	 		terms.pop();
	 		terms.push(ui.item.value);
	 		this.value = terms.join(" ")
	 		$(this).autocomplete("instance").search()
	 		console.log(this)
	 		return false;
	 	}
	 })
}
GameManager.prototype.split = function(val){
	return val.split(" ")
}
GameManager.prototype.verify = function(val){
	matched
}
GameManager.prototype.getNameList = function(){
	u = []
	for(var user in this.userlist){
		u.push(this.userlist[user]["name"])
	}
	return u
}
GameManager.prototype.getLoginJson = function(userId){
	return JSON.stringify({
	    "data_type": "login",
	    "data": {
	    	"userId": userId
    	}})
}


GameManager.prototype.getMsgJson = function(to, data, type){
	return JSON.stringify({
	    "data_type": type,
	    "to": to ,
	    "data": data
	})
}

GameManager.prototype.getSuccessHandler = function(data) {
	GM.name = data["name"]
	GM.group = data["group"]
	GM.userId = data["userId"]
	$("#login_info").text("姓名：" + GM.name + " 组号：" + GM.group)
	console.log(data)
}
GameManager.prototype.getErrorHandler = function() {
	setTimeout(function(){$("#error-popup").popup("open")},1000)
}

GameManager.prototype.sync = function(){
	var randnum = Math.random()
	if(randnum>0.5){
		this.ready = true
		$("#ready-status").text("已经就绪")
	}
	else{
		this.ready = false
		$("#ready-status").text("整备中")
	}
	$("#current-day").text(this.day)
}
GameManager.prototype.report = function(){
	this.sock.send(this.getMsgJson(0,{"ready":this.ready},'report'))
}
GameManager.prototype.log = function(from,message, type){
	control = $("#log")
	if(type=='sys'){
		control.append('<span style="color:blue">系统通知: </span>' + message + '<br/>')
	}
	else if(type=='game'){
		if(from in this.userlist){
			control.append('<span style="color:green">' + this.userlist[from]['name'] + ':</span>' + message + '<br/>')
		}
		else{
			control.append('<span style="color:green">' + "未知用户" + ':</span>' + message + '<br/>')
		}
		
	}
	control.scrollTop(control[0].scrollHeight);
}


$(function(){
	a = new Army()
	GM = new GameManager()
});


