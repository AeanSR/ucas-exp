function GameManager(mice, bottles, poisons) {
	this.mice = mice;
	this.bottles = bottles;
	this.poisons = poisons;
	this.bottle_list = []
	this.poison_list = {}
	this.mouse_list = {}
	this.curBottles = 1
	this.steps = 0
	this.historys = []
	this.submit_bottles = []
	this.curDragList = []
	this.popupClosed = true
	this.create();

};
GameManager.prototype.create = function() {
	var _this = this
	//preload image
	new Image().src= 'imgs/mouse-dead.png'
	$(".submit").sortable()
	$("#bottles-container").sortable({
		start: function(event, ui) {
			_this.dragging = 'bottles'
			_this.curDragBottles = "bottles-" + ui.helper[0].id
			selectedDOMs = $("#" + _this.curDragBottles + ' .bottle')
			_this.curDragList = []
			for (var x = 0; x < selectedDOMs.length; x++) {
				_this.curDragList.push(parseInt(selectedDOMs[x].id))
			}
		}
	})
	// .droppable({
	// 	containment: "document",
	// 	appendTo: document.body,
	// 	accept: ".bottle",
	// 	drop: function(event, ui) {
	// 		console.log("Container dropped!")
	// 		if (!_this.popupOpen) {
	// 			_this.dropOnContainer = true
	// 		}
	// 	}
	// })
	$("#bottles-container").disableSelection();


	this.createEmptyBottles(this.curBottles);
	// Init data
	for (var i = 1; i <= this.bottles; i++) this.bottle_list.push(i)
	this.addToBottles(this.bottle_list, this.curBottles)
	this.curBottles += 1
	this.createRandomPoison()
	for (var i = 1; i <= this.mice; i++) this.mouse_list[i] = true
	this.createMice(this.mouse_list)
}

GameManager.prototype.createRandomPoison = function() {
	for (var i = 0; i < this.poisons; i++) {
		poison = md5(Math.ceil(Math.random() * 100) + "This is a salt~~!@@!")
		//poison = md5(1 + "This is a salt~~!@@!")
		if (!(poison in this.poison_list)) {
			this.poison_list[poison] = 0;
		} else {
			i -= 1
		}
		poison = 0
	}

}

GameManager.prototype.createEmptyBottles = function(bottles_id) {
	console.log('bottles ' + bottles_id + ' has been created')
	var _this = this
	$("<div></div>", {
		class: "bottles",
		id: bottles_id
	})
		.html('<p>0</p><img src="imgs/bottles.png">')
		.attr('tested',false)
		.appendTo($("#bottles-container"))
	$("#bottles-container").sortable("refresh")
	//Dynamic append
	popup = $('<div></div>', {
		"data-role": "popup",
		id: "bottles-" + bottles_id,
		class: "bottle-popup"
	})
	.html('<div class="bottle-container"></div>')
	popup.appendTo($.mobile.activePage).popup({"afterclose":function(){_this.popupClosed = true}})
	this.sorts = $("#bottles-" + bottles_id + " .bottle-container").selectable({
		handle: "#bottles-" + bottles_id + " .bottle-container",
		filter: ".bottle",
		distance:10,
		selected: function(event, ui) {
			console.log('selected')
			$(ui.selected).draggable("enable")
			$(ui.selected).attr("select", true);
			$(ui.selected).css("background-color", "grey");
		}
	});
	// TODO mobile axis
	$("#bottles-container #" + bottles_id).mousedown(function(event) {
		_this.mouse_move = false
	});
	$("#bottles-container #" + bottles_id).mousemove(function(event) {
		_this.mouse_move = true
	});
	$("#bottles-container #" + bottles_id).click(function(event) {
		console.log('bottles ' + this.id + ' has been clicked')
		_this.popupClosed = false
		// In case of firefox 
		if(!_this.mouse_move){

			$("#bottles-" + this.id).css('visibility', 'visible')
			$("#bottles-" + this.id).popup("open", {
			x: event.pageX + 200,
			y: event.pageY + 150
		});
		}

	});
	$("#bottles-container #" + bottles_id).droppable({
		drop: function() {
			if($(this).attr("tested")=="false")
			_this.dropOnBottles = $(this)[0].id
		}
	})
}

GameManager.prototype.addToBottles = function(bottle_list, bottles) {
	for (var i in bottle_list) {

		$("<div></div>", {
			class: "bottle",
			id: bottle_list[i]
			})
		.attr("select", false)
		.html("<p>" + bottle_list[i] + "</p>" + '<img src="imgs/bottle.png">')
		.appendTo($("#bottles-" + bottles + " .bottle-container"))

		$("#bottles-" + bottles + " .bottle-container #" + bottle_list[i]).click(function() {
			if ($(this).attr("select") == "true") {
				$(this).attr("select", false);
				$(this).draggable("disable")
				$(this).css("background-color", "white");
			} else {
				$(this).attr("select", true);
				$(this).draggable("enable")
				$(this).css("background-color", "grey");
			}
		})
		.draggable({
		containment: "#GameBoard",
		appendTo: "#GameBoard",
		distance: 20,
		start: function(event, ui) {
			_this.dragging = 'bottle'
			_this.dropOnContainer = false
			_this.dropOnBottles = 0
			_this.popupOpen = true
			ui.helper.attr("select", true);
			_this.curDragBottles = ui.helper.parent().parent()[0].id
			selectedDOMs = $("#" + _this.curDragBottles + ' .bottle[select=true]')
			_this.curDragList = []
			for (var x = 0; x < selectedDOMs.length; x++) {
				_this.curDragList.push(parseInt(selectedDOMs[x].id))
			}
			_this.popupOpen = false
			// Prevent bottle covered by the popup
			$("#"+ _this.curDragBottles).css('visibility', 'hidden')
			//$("#"+ _this.curDragBottles).popup("close")
			ui.helper.css('visibility',"visible")
			//this.popup = $("#"+ _this.curDragBottles)

		},
		stop: function(event, ui) {
			if (_this.dropOnMice || (_this.dropOnContainer && _this.dropOnBottles == 0)) {
				_this.removeFromBottles(_this.curDragList, _this.curDragBottles)
				if (_this.isBottlesEmpty(_this.curDragBottles) == true) _this.RemoveBottles(_this.curDragBottles)
				_this.createEmptyBottles(_this.curBottles)
				if (_this.NeedUpdate) _this.UsedBottles("bottles-" + _this.curBottles)
				_this.addToBottles(_this.curDragList, _this.curBottles)
				_this.curBottles += 1
			} else if (_this.dropOnBottles) {
				_this.removeFromBottles(_this.curDragList, _this.curDragBottles)
				if (_this.isBottlesEmpty(_this.curDragBottles) == true) _this.RemoveBottles(_this.curDragBottles)
				_this.addToBottles(_this.curDragList, _this.dropOnBottles)
			} else {
				_this.removeFromBottles(_this.curDragList, _this.curDragBottles)
				_this.addToBottles(_this.curDragList, _this.curDragBottles.split('-')[1])
			}
			if (!_this.popupOpen) {
				console.log(_this.curDragBottles)
				$("#"+ _this.curDragBottles)
				$("#"+ _this.curDragBottles).popup('close')
				$("#"+ _this.curDragBottles).popup('close')
				$("#"+ _this.curDragBottles).popup('close')
				$("#"+ _this.curDragBottles).popup('close')
				$("#"+ _this.curDragBottles).popup('close')
				$("#"+ _this.curDragBottles).popup('close')
				$("#"+ _this.curDragBottles).popup('close')
				$("#"+ _this.curDragBottles).popup('close')
				$("#"+ _this.curDragBottles).popup('close')
				$("#"+ _this.curDragBottles).popup('close')
				$("#"+ _this.curDragBottles).popup('close')
				
			}

			_this.curDragBottles = undefined
			_this.curDragList = []
			_this.dropOnMice = false
			_this.dropOnBottles = false
			_this.dropOnContainer = false
			_this.NeedUpdate = false
		}
	}).draggable("disable")
	}
	this.UpdateBottles("bottles-" + bottles)
	//$("#bottle-container").sortable("refresh")
}

GameManager.prototype.removeFromBottles = function(bottle_list, bottles) {
	for (var x in bottle_list) {
		$('#' + bottles + " #" + bottle_list[x]).remove()
	}
	this.UpdateBottles(bottles)
}

GameManager.prototype.isBottlesEmpty = function(bottles) {
	if ($('#' + bottles + ' .bottle').length == 0) {
		return true
	} else {
		return false
	}
}

GameManager.prototype.RemoveBottles = function(bottles) {
	$('#bottles-container #' + bottles.split('-')[1]).remove()
}

GameManager.prototype.UpdateBottles = function(bottles) {
	target = $('#bottles-container #' + bottles.split('-')[1] + ' p')
	target.text($('#' + bottles + ' .bottle').length)
}

GameManager.prototype.UsedBottles = function(bottles) {
	target = $('#bottles-container #' + bottles.split('-')[1])
	target.css("background-color", "grey")
	target.unbind()
	target.attr("tested",true)
	//this.bottles = this.bottles - 
}



GameManager.prototype.createMice = function(mouse_list) {
	_this = this
	for (var i in mouse_list) {
		$("<div></div>", {
			class: "mice",
			id: i
		})
			.html('<img src="imgs/mouse-alive.png">')
			.droppable({
				drop: function(event, ui) {
					_this.dropOnMice = $(this)[0].id
					mouse = $(this)[0].id
					// Is alive?
					if (_this.mouse_list[mouse]) {
						if (_this.dragging == 'bottles') {
							a = $('#bottles-container #' + _this.curDragBottles.split('-')[1])
							if(a.attr('tested')=="false"){
								if (!_this.testMice(_this.curDragList, mouse))
								_this.UsedBottles(_this.curDragBottles)
							}
						} else {
							if (_this.testMice(_this.curDragList, mouse)) {
								_this.UsedBottles(_this.curDragBottles)
							} else {
								_this.NeedUpdate = true
							}

						}
					}

				}
			})
			.appendTo($("#mice-container"))

	}
}
GameManager.prototype.testMice = function(bottles_list, mouse) {
	this.steps += 1
	gameModel = new AdaptiveAdversary()

	this.historys.push('Test bottles [' + bottles_list.toString() + '] to mouse ' + mouse)
	$('#SubmitBoard .step-score').html(this.steps)
	if(gameModel.computerDecide(this.bottles, bottles_list.length, this.mice)[0]){
			if (bottles_list.length == 1) {
				flag = true
				for (var x in this.submit_bottles) {
					if (bottles_list[0] == this.submit_bottles[x]) flag = false
				}
				if (flag) {
					$(".submit").append('<div class="bottle"><img src="imgs/bottle.png"><p>' + bottles_list[0] + '</p></div>')
					$("#gameover .result").append("<p>" + bottles_list[0] + "</p>")
					this.submit_bottles.push(bottles_list[0])
				}

			}
			this.mouse_list[mouse] = false
			$("#mice-container #" + mouse)
				.animate() //Animate here
			.html('<img src="imgs/mouse-dead.png">')
			this.historys.push('Mouse ' + mouse + ' die.')
			this.isGameOver()
			delete GameModel
			this.bottles = bottles_list.length
			return true
	}
	$("#mice-container #" + mouse)
		.animate() //Animate here
	delete GameModel
	// Kick off the healthy bottles
	this.bottles = this.bottles - bottles_list.length
	return false
}


GameManager.prototype.isGameOver = function() {
	flag = true
	for (x in this.mouse_list) {
		if (this.mouse_list[x]) flag = false
	}
	if (this.submit_bottles.length == this.poisons) {
		$("#gameover h1").text("Great!")
		$("#gameover #gameover-notice").text("You have passed the game successfully!")
		$("#gameover #gameover-content").text("The result has been submitted to the server. ")
		$("#gameover .ui-btn").text("Continue")
		this.historys.push('GameOver')
		$("#gameover .ui-btn").click(function() {
			location.href = 'game.html'
		})
		this.Popup()
		return
	}
	if (flag) {
		$("#gameover h1").text("Sorry!")
		$("#gameover #gameover-notice").text("All mice have died!")
		$("#gameover #gameover-content").text("Please try again, this time won't be submitted.")
		$("#gameover .ui-btn").text("Retry")
		$("#gameover .ui-btn").click(function() {
			location.href = 'game.html'
		})
		this.historys.push('GameOver')
		console.log('sorry')
		this.Popup()

	}

}
GameManager.prototype.Popup = function() {
	_this = this
		if(_this.popupClosed)
		{
			console.log('popup')
			$("#gameover").popup("open")
		}
		else{
			setTimeout(function(){_this.Popup(_this)}, 500)
			return		
		}
}

function AdaptiveAdversary() {
	this.mat=[]
    	for(var i=0;i<101;++i)this.mat[i]=[0,0,0]
}
AdaptiveAdversary.prototype.computerDecide = function(bottles, selectedbottles, mice) {
	if(bottles==selectedbottles)return [1,this.humanDecide(selectedbottles,mice-1)];
	var a=this.humanDecide(bottles-selectedbottles,mice);
	var b=this.humanDecide(selectedbottles,mice-1);
	if(a>b)return [0,a];
	return [1,b];
}
AdaptiveAdversary.prototype.humanDecide = function(bottles,mice){     
    		if(bottles==1)return 0;
    		if(mice==0){
    			if(bottles>1)return 65535
    			return 0
    		}
    		if(mice==1){
    			return bottles-1
    		}
    		if(this.mat[bottles][mice]!=0){
    			return this.mat[bottles][mice]
    		}
    		var min=65535
    		var ind=0
    		for (var i=1;i<=bottles;++i){
    			
    			var t1=this.computerDecide(bottles,i,mice)
    			var t=t1[1]
    			if(t<min){
    				min=t
    				ind=i
    			}
    		}
    		this.mat[bottles][mice]=min+1
    		return min+1;
    }

$(function() {
	if (location.href.search('#') != -1) {
		location.href = 'game.html'
	}
	
	GM = new GameManager(2, 32, 1);

});