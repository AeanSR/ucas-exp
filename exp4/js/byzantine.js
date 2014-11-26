var READY = 1;
var NOT_READY = 0;

//天气
var WEATHERS = 3;
var SUNNY = 0;
var RAINY = 1;
var CLOUDY = 2;

var LIUBEI = "刘备";
var ZHANGFEI = "张飞";
var ZHAOYUN = "赵云";
var GUANYU = "关羽";
var ZHUGELIANG = "诸葛亮";

function Army(){
	this.globalTime = 0;
	this.transferCondition = "";   // 定义转换为Ready的条件表达式, 后经eval判断
	//  上下文
	this.generalName =  LIUBEI,      // 将领名称
	this.troops =  5000,     // 5000人
	this.weahter =  SUNNY,       // SUNNY:晴天, RAINY:雨天, CLOUDY: 雪天
	this.supply =  5000	//  粮食斤数
}

/*
*	下一小时, 更新上下文
*/

Army.prototype.nextDay = function(){
	this.weahter = Math.floor(Math.random()*WEATHERS)
	this.supply -= Math.floor(Math.random()*200)
};
Army.prototype.chkReady = function(){
	console.log(eval(this.transferCondition))
}
Army.prototype.chkCorrect = function(){
	var n = 0;
	if(this.transferCondition!="") n++    // 1
	var newDAG = jQuery.extend(true, {}, DAG)
	console.log(newDAG)
	if('army-mainBody' in newDAG){
		delete newDAG['army-mainBody']
		n++
	}
	if('mainBody-weather' in newDAG){
		delete newDAG['mainBody-weather']
		n++
	}
	if('food-mainBody' in DAG){
		delete newDAG['food-mainBody']
		n++
	}
	if($.map(newDAG, function(n, i) { return i; }).length!=0){
		alert()
		n =-1  //dummy
	}
	if(numInBody == 6){
		n++;
	}
	console.log('correct:',n)
	if(n==5)return true
	else return false
}


function GameManager(){
	var _this = this
	this.day = 0
	this.army = new Army()
	this.namemap = [LIUBEI,ZHANGFEI,ZHAOYUN,GUANYU,ZHUGELIANG]
	this.restTime = 0
	this.Ajax = new modAjax(5,this);
	this.Ajax.getinfo(this.getSuccessHandler, this.getErrorHandler);
	//this.sock = new SockJS('http://127.0.0.1:8888/api/exp4');
	this.sock = new SockJS('http://ucas-2014.tk/api/exp4');

	this.sock.onopen = function() {
	     console.log('Established the connection.');
	     _this.sock.send(_this.getLoginJson(_this.userId))
	 };
	 this.sock.onmessage = function(e) {
	     console.log('message', e.data);
	     var msg = $.parseJSON(e.data)
	     if(msg['data_type'] == 'notify'){
	     	if(msg['data']['event'] == 'start'){
	     		setTimeout(function(){$("#pause-popup").popup("close")},500)
	     		_this.day = msg['data']['day']
	     		_this.log("",'人员就位，游戏开始，今天是第' + _this.day + '天。' , 'sys')
	     		_this.interval = parseInt(msg['data']['interval'])
	     		_this.startTimer()
	     		_this.sync()
	     		_this.report()
	     	}
	     	else if(msg['data']['event'] == 'sync'){
	     		_this.day = msg['data']['day']
	     		_this.isTraitor = msg['data']['isTraitor']
	     		_this.log("",'新的一天到来，今天是第' + _this.day + '天。' , 'sys')
	     		_this.sync()
	     		_this.report()
	     		_this.startTimer()
	     	}
	     	else if(msg['data']['event'] == 'gameresult'){
	     		if(msg['data']['win'] ){
	     			_this.log("",'今天平安渡过，所有将军做出了正确的决策。' , 'sys')
	     		}
	     		else{
	     			_this.log("",'败仗！看来我们之中出了一个叛徒。' , 'sys')
	     		}
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
	     	_this.log("",msg['event']==true?"有人加入了游戏":"有人离开了游戏，游戏暂停。" , 'sys')
	     	if(msg['event']==false && _this.stage == 1){
	     		$("#pause-popup").popup("open")
	     	}
	      }
	     else if(msg['data_type'] == 'message'){
	     	_this.log(msg['from'],msg['data'],'game')
	     }
	     else if(msg['data_type'] == 'attack'){
	     	_this.log(msg['from'],msg['data']==true?"发起攻击":"拒绝攻击",'attack')
	     	setAttack(parseInt(msg['from']),msg['data'])
	     }
	     else if(msg['data_type'] == 'auth'){
	     	if(msg['data']['notify']=='success'){
	     		_this.id = parseInt(msg['data']['id'])
	     		_this.isTraitor = msg['data']['isTraitor']
	     		_this.messages = msg['data']['messages']
	     		_this.name = _this.namemap[_this.id]
	     		_this.stage = msg['data']['stage']
	     		_this.initStage2()
	     		if(_this.stage==0){
	     			_this.initStage1()
	     		}
	     		else{
	     			_this.moveStage2()
	     		}
	     		
	     		//_this.sock.send(_this.getMsgJson(0,{"generalname":_this.name},'register'))
	     	}
	     }
	 };
	 this.sock.onclose = function() {
	     console.log('close');
	 };
}

GameManager.prototype.getNameList = function(){
	u = []
	for(var user in this.userlist){
		u.push(this.userlist[user]["name"])
	}
	return u
}
GameManager.prototype.initStage2 = function(){
	_this = this
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
	$('#notattack').click(function(){
		_this.sock.send(_this.getMsgJson(0, false, 'attack'))
	})
}

GameManager.prototype.moveStage2 = function(){

	$('#console-stage1').css('display','none')
	$('#console-stage2').css('display','block')
	$('#control-stage2').css('display','block')
	setTimeout(function(){$("#pause-popup").popup("open")},500)
	_this.waitPaperjs("initStep2")
}

GameManager.prototype.initStage1 = function(){
	_this = this
	$('#console-stage1').css('display','block')
	$("#confirm-condition").click(function(){
		if(parseInt($("#food-val").val())!=NaN && parseInt($("#troops-val").val())!=NaN){
			_this.army.transferCondition = "this.ready = " +
			"this.supply" + ($("#food-op").val()=="smaller"?"<=":">") + parseInt($("#food-val").val()) + '&&' +
			"this.troops" + ($("#troops-op").val()=="smaller"?"<=":">") + parseInt($("#troops-val").val()) + '&&' +
			"this.weahter" + "==" + $("#weather-val").val();
		}
	})
	$('#make').click(function(){
		if(_this.army.chkCorrect()){
			_this.log('','部队构建完毕，等待战斗！','sys')
			_this.sock.send(_this.getMsgJson(0, true, 'nextstage'))
			_this.moveStage2()
			_this.stage = 1
		}
		else{
			_this.log('','部队一盘散沙，不能成军，请重下军令！','sys')

		}
	})
	_this.waitPaperjs("initStep1")
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
	$('#traitor-status').text(this.isTraitor==false?"忠臣":"奸臣")
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
GameManager.prototype.waitPaperjs = function(fun) {
	_this = this
	ok = false
	try{
		if(initStep1){
			ok = true
		}
	}catch(e){
		
	}
		if(ok)
		{	
			if(fun=="initStep1")
			{
				initStep1(_this.id)
			}
			else if (fun=="initStep2"){
				initStep2(_this.id)
			}
		}
		else{
			setTimeout(function(){_this.waitPaperjs(fun)}, 500)
			return		
		}
}
$(function(){
	if ((index = location.href.search('#')) != -1) {
		location.href = location.href.substr(0,index)
		return
	}
	a = new Army()
	GM = new GameManager()
});


