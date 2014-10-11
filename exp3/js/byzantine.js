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
	this.Ajax = new modAjax(1,this);
	this.Ajax.getinfo(this.getSuccessHandler, this.getErrorHandler);
	this.sock = new SockJS('http://127.0.0.1:8888/api/exp3');
	this.sock.onopen = function() {
	     console.log('Established the connection.');
	     _this.sock.send(_this.getLoginJson(_this.userId))
	 };
	 this.sock.onmessage = function(e) {
	     console.log('message', e.data);
	 };
	 this.sock.onclose = function() {
	     console.log('close');
	 };
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


$(function(){
	a = new Army()
	GM = new GameManager()
});


