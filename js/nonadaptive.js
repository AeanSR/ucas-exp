function NAGameManager(bottles,is_test) {
	this.mice = 0;
	this.bottles = bottles;
	this.is_test = is_test
	this.bottle_list = []
	this.result = {};
	this.historys = []
	this.wrong = []
	this.popupClosed = true
	this.create()
}
NAGameManager.prototype.create = function() {
	var _this = this
	if(this.is_test){
		$('#game-mode').text("Test Mode")
		$('#game-times').text("Unlimited")
		}
	else{
		// TODO ajax here
		$('#game-mode').text("Submit Mode")
		$('#game-times').text("3")
	}
	// Create mice.
	_this.createMouse()
	$("#button_add").click(function(event) {
		_this.createMouse()
	});
	$("#button_submit").click(function(event) {
		_this.testMice()
		_this.submitAnswer()
		//_this.gameOver(_this.testMice())
	});
	// Initialize bottles container
	// Init data
	for (var i = 1; i <= _this.bottles; i++) _this.bottle_list.push(i)
	// Create bottles
	_this.addBottles(_this.bottle_list)
}


NAGameManager.prototype.createMouse = function() {
	_this = this
	_this.mice += 1
	mouse_dom = $("<div></div>", {
		class: "mice",
		id: _this.mice
	})
	.html('<p>0</p><img src="imgs/mouse-alive.png"><span class="ui-icon ui-icon-delete ui-btn-icon-left" style="display:none"></span> ')
	.droppable({
		drop: function(event, ui) {
			bottle_id = parseInt(ui.helper[0].id)
			selected_doms = $("#bottles-container .bottle[select=true]")
			curDragList = []
			for(var i=0;i<selected_doms.length;i++){
				curDragList.push(parseInt(selected_doms[i].id))
			}
			mouse = $(this)[0].id
			console.log("Dropping bottle " + bottle_id + " on mouse " + mouse)
			_this.addBottlesToMouse(curDragList, mouse)
		}
	})
	.appendTo($("#mice-container"))
	// Bind hover
	mouse_dom.hover(
		function(event){
			$(this).find('span').show()
		},
		function(event){
			$(this).find('span').hide()
		});
	// Bind click to popup

	mouse_dom.find('img').click(function(event) {
		console.log('mouse ' + $(this).parent()[0].id+ ' has been clicked')
		_this.popupClosed = false
		_this.showMousePopup(parseInt($(this).parent()[0].id),event)

	});
	mouse_dom.find('span').click(function(event) {
		_this.mice -=1
		new_result = {}
		mouse = parseInt($(this).parent()[0].id)
		_this.removeMouse(mouse)
		j =0
		for(var i in _this.result){
			if(i!=mouse){
				j++
				new_result[j] = _this.result[i]
				$('#mice-container #' +i)[0].id = j
			}
		}
		delete _this.result
		_this.result = new_result

	});
	// Record the content
	_this.result[_this.mice] = []
}
NAGameManager.prototype.removeMouse = function(mouse) {
	$('#mice-container #' +mouse).remove()
}

NAGameManager.prototype.addBottles = function(bottle_list) {
	var _this = this
	for (var i in bottle_list) {
		bottle_id = bottle_list[i]
		$("<div></div>", {
			class: "bottle",
			id: bottle_id,
			select: false
		})
		.html('<p>' + bottle_id + '</p><img src="imgs/bottle.png">')
		.draggable({
			revert:true,
			revertDuration:0,
			containment: "#GameBoard",
			appendTo:"#GameBoard",
			start:function(event,ui){
				bottle_dom = $(this)
				bottle_dom.attr('select','true')
				bottle_dom.css('background-color','#356799')			}
		})
		.appendTo($("#bottles-container"))
		.click(function(event){
			bottle_dom = $(this)
			if(bottle_dom.attr('select')=='true'){
				bottle_dom.attr('select','false')
				bottle_dom.css('background-color','')
			}
			else{
				bottle_dom.attr('select','true')
				bottle_dom.css('background-color','#356799')
			}
		})

	}
}

NAGameManager.prototype.addBottlesToMouse = function(draglist, mouse) {
	for(var x in draglist){
		this.addBottleToMouse(draglist[x],mouse)
	}
	this.clearAllselect()
}
NAGameManager.prototype.addBottleToMouse = function(bottle_id, mouse) {
	_this = this
	if($.inArray(bottle_id,_this.result[mouse])==-1){
		_this.result[mouse].push(bottle_id)
	}
	console.log("#mice-container #"  + mouse + " p")
	$("#mice-container #"  + mouse + " p").text(_this.result[mouse].length)
}

NAGameManager.prototype.removeBottleFromMouse = function(bottle_id, mouse) {
	_this = this
	index = $.inArray(bottle_id,_this.result[mouse])
	if(index>-1){
		_this.result[mouse].splice(index,1);
	}
	$("#mice-container #"  + mouse + " p").text(_this.result[mouse].length)
}
NAGameManager.prototype.clearAllselect = function() {
	selected_doms = $("#bottles-container .bottle[select=true]")
	for(var i=0;i<selected_doms.length;i++){
		$(selected_doms[i]).attr('select','false')
		$(selected_doms[i]).css('background-color','')
	}
}

NAGameManager.prototype.showMousePopup = function(mouse,event) {
	_this = this
	_this.popupMouse = mouse
	// Create popup
	popup = $('<div></div>', {
		"data-role": "popup",
		class: "mouse-popup"
	})
	.html('<div class="bottle-container"></div>')
	popup.appendTo($.mobile.activePage).popup({
		"afterclose":function(){
			$(this).remove()
			_this.popupClosed = true
		}
	})
	// Show Bottles
	_this.result[mouse].forEach(function(bottle_id){
		$("<div></div>", {
			class: "bottle",
			id: String(bottle_id)
			})
		.attr("select", false)
		.html("<p>" + bottle_id + "</p>" + '<img src="imgs/bottle.png">')
		.appendTo($('.mouse-popup .bottle-container'))
		.click(function(event){
			// why can't i use #
			$(".mouse-popup .bottle-container [id=" + this.id + "]").remove()
			_this.removeBottleFromMouse(parseInt(this.id), _this.popupMouse)
		})

	});
	popup.popup("open", {
		x: event.pageX + 200,
		y: event.pageY + 150
		});
}

NAGameManager.prototype.testMice = function() {
	this.tested = {}
	this.historys.push(this.result)
	for(var poison=1;poison<=this.bottles;poison++){
		b = 0
		for(var mouse=1;mouse<=this.mice;mouse++)
		{
			if($.inArray(poison,this.result[mouse])>-1){
				b += Math.pow(2,mouse-1)
			}
		}
		this.tested[poison] = b
	}
	// Failed if two bottles are same.
	this.invert_list ={}
	for(var bottle in this.tested){
		var m = this.tested[bottle]
		if(this.invert_list[m]==undefined) this.invert_list[m] = []
		this.invert_list[m].push(bottle)
	}

}
NAGameManager.prototype.submitAnswer = function() {
	var same = -1
	for(var i in this.invert_list)
	{
		// Find two same
		if(this.invert_list[i].length>1){
			same = i
			break
		}
	}

	if(same!=-1){
		// Should let the player fail
		var dead_list = this.getMouse(same)
		this.submitPopup(dead_list, this.invert_list[same], false)
	}
	else{
		do{
			var i = Math.ceil(Math.random()*this.bottles)
			var m = this.tested[i]
			var dead_list = this.getMouse(m)
		}while(dead_list.length==0||dead_list.length==this.mice)
		this.submitPopup(dead_list, [i], true)
	}
}
NAGameManager.prototype.gameOver = function(isWin,u_bottle,c_bottle) {
	this.is_test?
	newhref = 'non-adaptive.html':
	newhref = 'non-adaptive.html?submit'
	$("#gameover-result").text("The poisoned bottle is " + u_bottle + ", your answer is bottle " + c_bottle)
	if(isWin){
		$("#gameover h1").text("Great!")
		$("#gameover #gameover-notice").text("You have passed the game successfully with " + this.mice + " mice!")
		this.is_test?
		$("#gameover #gameover-content").text("Test mode won't upload the results."):
		$("#gameover #gameover-content").text("The result will be submitted to the server. ")
		this.is_test?
		$("#gameover .ui-btn").text("Retry"):
		$("#gameover .ui-btn").text("Continue")
		this.historys.push('GameOver')
		$("#gameover .ui-btn").click(function() {
			location.href = newhref
		})
		this.Popup("#gameover")
	}
	else{
		$("#gameover h1").text("Sorry!")
		$("#gameover #gameover-notice").text("You can't find the poison!")
		this.is_test?
		$("#gameover #gameover-content").text("Test mode won't upload the results."):
		$("#gameover #gameover-content").text("Please try again, this time won't be submitted.")
		$("#gameover .ui-btn").text("Retry")
		$("#gameover .ui-btn").click(function() {
			location.href = newhref
		})
		this.historys.push('GameOver:lose')
		this.Popup("#gameover")
	}
}
NAGameManager.prototype.submitPopup = function(dead_list, bottles,isWin) {
	_this = this
	if(dead_list.length>0){
		$("#dead-mouse").text(dead_list.toString())
	}
	else{
		$("#dead-mouse").text("None")
	}
	$("#submit-popup .ui-btn").click(function(event) {
		var u_bottle = $("#input-bottle").val()
		if(u_bottle!=""){
			$("#submit-popup").popup("close")
			if(isWin){
				isCorrect =  u_bottle==bottles[0]
				_this.gameOver(isCorrect,u_bottle, bottles[0])
			}
			else{
				u_bottle ==bottles[0]?_this.gameOver(false,u_bottle,bottles[1]):_this.gameOver(false,u_bottle,bottles[0])
			}

		}

	});
	this.Popup("#submit-popup")
}
NAGameManager.prototype.Popup = function(selector) {
	console.log(selector)
	_this = this
		if(_this.popupClosed)
		{	
			_this.popupClosed =false
			$(selector).popup({
				afterclose:function(){
					_this.popupClosed = true
				}
			})
			.popup("open")
		}
		else{
			setTimeout(function(){_this.Popup(selector)}, 500)
			return		
		}
}
NAGameManager.prototype.getMouse = function(b) {
	deadMouse = []
	for(var mouse=1;mouse<=this.mice;mouse++){
		if(b % 2 ==1){
			deadMouse.push(mouse)
		}
		b = Math.floor(b/2)
	}
	return deadMouse
}



$(function() {
	$("body").iealert();
	if (location.href.search('#') != -1) {
		location.href = 'non-adaptive.html'
	}
	if (location.href.search('/?submit') != -1) {
		GM = new NAGameManager(16, false);
	}
	else{
		GM = new NAGameManager(8, true);
	}

});