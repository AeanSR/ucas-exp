function NAGameManager(bottles) {
	this.mice = 0;
	this.bottles = bottles;
	this.bottle_list = []
	this.result = {};
	this.historys = []
	this.popupClosed = true
	this.create()
}
NAGameManager.prototype.create = function() {
	var _this = this
	// Create mice.
	_this.createMouse()
	$("#button_add").click(function(event) {
		_this.createMouse()
	});
	$("#button_submit").click(function(event) {
		_this.gameOver(_this.testMice())
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
				bottle_dom.css('background-color','grey')			}
		})
		.appendTo($("#bottles-container"))
		.click(function(event){
			bottle_dom = $(this)
			console.log('click')
			if(bottle_dom.attr('select')=='true'){
				bottle_dom.attr('select','false')
				bottle_dom.css('background-color','')
			}
			else{
				bottle_dom.attr('select','true')
				bottle_dom.css('background-color','grey')
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
	console.log(_this.result[mouse].length)
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
	console.log(this.tested)
	// Failed if two bottles are same.
	unique = []
	for(var bottle in this.tested){
		if($.inArray(this.tested[bottle],unique)==-1){
			unique.push(this.tested[bottle])
		}
		else{
			return false
		}
	}
	return true


}
NAGameManager.prototype.gameOver = function(isWin) {
	if(isWin){
		$("#gameover h1").text("Great!")
		$("#gameover #gameover-notice").text("You have passed the game successfully with " + this.mice + " mice!")
		$("#gameover #gameover-content").text("The result has been submitted to the server. ")
		$("#gameover .ui-btn").text("Continue")
		this.historys.push('GameOver')
		$("#gameover .ui-btn").click(function() {
			location.href = 'non-adaptive.html'
		})
		this.Popup()
	}
	else{
		$("#gameover h1").text("Sorry!")
		$("#gameover #gameover-notice").text("You can't find the poison!")
		$("#gameover #gameover-content").text("Please try again, this time won't be submitted.")
		$("#gameover .ui-btn").text("Retry")
		$("#gameover .ui-btn").click(function() {
			location.href = 'non-adaptive.html'
		})
		this.historys.push('GameOver:lose')
		this.Popup()
	}
	for(var bottle in this.tested){
		html = '<tr><th>' + bottle + '</th><td>'
		list = this.getMouse(this.tested[bottle])
		for(var i in list){
			if(list[i])
			html += i + ' '
		}
		html += '</td></tr>'
		$("#result tbody").append(html)
	}
}
NAGameManager.prototype.Popup = function() {
	_this = this
		if(_this.popupClosed)
		{
			$("#gameover").popup("open",{x:window.width/2,y:0})
		}
		else{
			setTimeout(function(){_this.Popup(_this)}, 500)
			return		
		}
}
NAGameManager.prototype.getMouse = function(b) {
	deadMouse = {}
	console.log(b)
	for(var mouse=1;mouse<=this.mice;mouse++){
		deadMouse[mouse] = b % 2
		b = Math.floor(b/2)
	}
	return deadMouse
}



$(function() {
	$("body").iealert();
	if (location.href.search('#') != -1) {
		location.href = 'non-adaptive.html'
	}
	GM = new NAGameManager(8);

});