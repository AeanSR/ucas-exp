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
	this.namemap = [LIUBEI,ZHANGFEI,ZHAOYUN,GUANYU,ZHUGELIANG]
	this.restTime = 0
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
	     		_this.day = msg['data']['day']
	     		_this.log("",'人员就位，游戏开始，今天是第' + _this.day + '天。' , 'sys')
	     		_this.interval = parseInt(msg['data']['interval'])
	     		_this.startTimer()
	     		_this.sync()
	     		_this.report()
	     	}
	     	else if(msg['data']['event'] == 'sync'){
	     		_this.day = msg['data']['day']
	     		_this.log("",'新的一天到来，今天是第' + _this.day + '天。' , 'sys')
	     		_this.sync()
	     		_this.report()
	     		_this.startTimer()
	     	}
	     }
	     else if(msg['data_type'] == 'update'){   
	     	_this.userlist = msg['data']
	     	$('#userlist ul').text("")
	     	for(var userId in _this.userlist){
	     		_this.userlist[userId]['online']?
	     		$('#userlist ul').append('<li><span style="color:green">' + _this.userlist[userId]['name'] + '</span></li>'):
	     		$('#userlist ul').append('<li><span style="color:grey">' + _this.userlist[userId]['name']  + '</span></li>')
	     	}
	      }
	     else if(msg['data_type'] == 'message'){
	     	_this.log(msg['from'],msg['data'],'game')
	     }
	     else if(msg['data_type'] == 'attack'){
	     	_this.log(msg['from'],msg['data']==true?"发起攻击":"拒绝攻击",'attack')
	     }
	     else if(msg['data_type'] == 'auth'){
	     	if(msg['data']['notify']=='success'){
	     		_this.id = parseInt(msg['data']['id'])
	     		_this.messages = msg['data']['messages']
	     		$('#current-messages').text(_this.messages)
		     	$('#receivers').text("")
		     	$('#send-content').text("")
		     	var x=0;
		     	for(var x=0;x<5;x++){
		     		if(x!=_this.id){
		     			var html ='<input type="checkbox" name="'+ x +'" id="c1-' + x + '" data-mini="true"><label for="c1-'+ x + '">'+ _this.namemap[x] + '</label>'
		     			$('#receivers').append(html)
		     		}
		     		$('#receivers').trigger('create')
		     		var html = ''
						+ '<fieldset class="ui-grid-a" name="' + x + '">'
						+ '<div class="ui-block-a">'
					    + '<input type="checkbox" name="'+ x +'" id="checkbox-' +x + '" data-mini="true">'
					    + '<label for="checkbox-' + x +'">'+ _this.namemap[x] + '</label>'
						+ '</div>'
					    + '<div class="ui-block-b">'
					    + '<select id="flipswitch-'+ x + '" style="position:relative" data-role="flipswitch"><option value="NOT_READY">等待</option><option value="READY">就绪</option></select>'
						+ '</div>'
						+ '</fieldset>'
		      		$('#send-content').append(html)
		     	}
		     	$('#receivers').trigger('create')
		     	$('#send-content').trigger('create')
	     		initStep2(_this.id)
	     		_this.name = _this.namemap[_this.id]
	     		//_this.sock.send(_this.getMsgJson(0,{"generalname":_this.name},'register'))
	     	}
	     }
	 };
	 this.sock.onclose = function() {
	     console.log('close');
	 };
	$('#confirm-send').click(function(){
		var receivers = []
		var sendContent = {}
		$('#receivers input').each(function(x,y){
			if($(y).prop('checked')){
				receivers.push($(y).prop('name'))
			}
		})
		$('#send-content input').each(function(x,y){
			if($(y).prop('checked')){
				sendContent[$(y).prop('name')] = $($('#send-content select')[x]).val()
			}
		})
		if(receivers.length>0)
		_this.sock.send(_this.getMsgJson(receivers, sendContent, 'message'))
		_this.log(_this.id,sendContent,'game')
		_this.messages += receivers.length
		$('#current-messages').text(_this.messages)
	});
	$('#attack').click(function(){
		_this.sock.send(_this.getMsgJson(0, true, 'attack'))
	})
	$('#not-attack').click(function(){
		_this.sock.send(_this.getMsgJson(0, false, 'attack'))
	})
}

GameManager.prototype.getNameList = function(){
	u = []
	for(var user in this.userlist){
		u.push(this.userlist[user]["name"])
	}
	return u
}
GameManager.prototype.startTimer = function(){
	_self = this
	this.restTime = this.interval;
	if(this.resttimer){
		clearInterval(this.resttimer)
		this.resttimer = undefined
	}
	this.resttimer = setInterval(function(){
		if(_self.restTime>=0){
			_self.restTime -=1;
			$('#rest-time').text(_self.restTime + '秒')
			}
		},1000)
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
	resetStep2()
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
		var from = parseInt(from)
		var target
		if(from<5 ){
			var text = []
			for(var i in message){
				target = parseInt(i)
				text.push(this.namemap[target] + "->" + ((message[i]=='READY')?"就绪":"整备中"))
				setStep2(from,target,message[i]=='READY')			
			}
			control.append('<span style="color:green">' + this.namemap[from] + ':</span>' + text.join(",") + '<br/>')
			// edges[]

		}
		else{
			console.log('Unknwon User')
		}
	}
	else if (type=='attack'){
		control.append('<span style="color:green">' + this.namemap[from] + ':</span>' + message + '<br/>')
	}
	control.scrollTop(control[0].scrollHeight);
}
GameManager.prototype.id2name = function(id){
	return this.userlist[id]['name']
}
GameManager.prototype.name2id = function(id){
	return null
}

$(function(){
	a = new Army()
	GM = new GameManager()
});


