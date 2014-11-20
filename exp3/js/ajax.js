document.domain = "ucas-2014.tk" 
function modAjax(gameId,GameManager){
	this.gameId = gameId
	this.gameLoop = -1
	this.GameManager = gameId
	this.url = "http://ucas-2014.tk:8888/"
	//this.url = "http://ucas-2014.tk/"
}

modAjax.prototype.getinfo = function(on_Success,on_Error) {
	_this = this
	$.ajax({
		type:"POST",
		url:this.url+"api/getinfo",
		data:{"gameId":this.gameId},
		dataType:"json",
		xhrFields: {
		    withCredentials: true
		},
		crossDomain: true,
		success:on_Success,
		error:on_Error
	})
};

modAjax.prototype.putinfo = function(score, history,on_Success,on_Error) {
	console.log(score, history)
	_this = this
	$.ajax({
		type:"POST",
		url:this.url+"api/putinfo",
		data:{"gameId":this.gameId,
		"gameLoop":this.gameLoop,
		"gameScore":score,
		"gameHist":JSON.stringify(history)
		},
		dataType:"json",
		xhrFields: {
		    withCredentials: true
		},
		crossDomain: true,
		success:on_Success,
		error:on_Error
	})
};
