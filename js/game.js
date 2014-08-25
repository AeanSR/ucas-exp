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
	}).droppable({
		containment: "document",
		appendTo: document.body,
		accept: ".bottle",
		drop: function(event, ui) {
			if (!_this.popupOpen) {
				_this.dropOnContainer = true
			}
		}
	})
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
	var _this = this
	$("<div></div>", {
		class: "bottles",
		id: bottles_id
	})
		.html('<p>0</p><img src="imgs/bottles.png">')
		.appendTo($("#bottles-container"))
	$("#bottles-container").sortable("refresh")
	//Dynamic append
	popup = $('<div></div>', {
		"data-role": "popup",
		id: "bottles-" + bottles_id,
		class: "bottle-popup"
	})
	//.html('<input type="text" id="text-filter" data-form="ui-body-a" value=""><a href="#" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-btn-b ui-mini">Filter</a><div class="bottle-container"></div>')
	.html('<div class="bottle-container"></div>')
	popup.appendTo($.mobile.activePage).popup()
	this.sorts = $("#bottles-" + bottles_id + " .bottle-container").sortable({
		containment: "#GameBoard",
		appendTo: document.body,
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

		},
		out: function(event, ui) {
			if (ui.helper) { // This hacks before change event
				if (_this.popupOpen) {
					t = $(this).sortable('instance')
					for (i = t.items.length - 1; i >= 0; i--) {
						item = t.items[i];
						itemElement = item.item[0];
						if (itemElement == t.currentItem[0])
							t._rearrange(event, item);
					}

					//ui.helper.html('<img src="imgs/bottle.png">')
					//ui.item.html('<img src="imgs/bottles.svg">')
					_this.popupOpen = false
					// Prevent bottle covered by the popup
					$(this).parent().css('top', '-2000px')
					this.popup = $(this).parent()
				}
			}
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
				$(this).parent().on("popupafterclose",function(){_this.popupClosed = true})
				$(this).parent().popup("close")
			}

			_this.curDragBottles = undefined
			_this.curDragList = []
			_this.dropOnMice = false
			_this.dropOnBottles = false
			_this.dropOnContainer = false
			_this.NeedUpdate = false
		}
	}).selectable({
		handle: "#bottles-" + bottles_id + " .bottle-container",
		filter: ".bottle",
		selected: function(event, ui) {
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
		_this.popupClosed = false
		// In case of firefox 
		if(!_this.mouse_move){
			$("#bottles-" + this.id).css('top', 'auto')
			$("#bottles-" + this.id).popup("open", {
			x: event.pageX + 200,
			y: event.pageY + 150
		});
		}

	});
	$("#bottles-container #" + bottles_id).droppable({
		drop: function() {
			_this.dropOnBottles = $(this)[0].id
		}
	})
}

GameManager.prototype.addToBottles = function(bottle_list, bottles) {
	for (var i in bottle_list) {

		$("<div></div>", {
			class: "bottle",
			id: bottle_list[i]
		}).attr("select", false)
			.html("<p>" + bottle_list[i] + "</p>" + '<img src="imgs/bottle.png">')
			.appendTo($("#bottles-" + bottles + " .bottle-container"))
		$("#bottles-" + bottles + " .bottle-container #" + bottle_list[i]).click(function() {
			if ($(this).attr("select") == "true") {
				$(this).attr("select", false);
				$(this).css("background-color", "white");
			} else {
				$(this).attr("select", true);
				$(this).css("background-color", "grey");
			}
		})
	}
	this.UpdateBottles("bottles-" + bottles)
	$("#bottle-container").sortable("refresh")
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
							if (!_this.testMice(_this.curDragList, mouse))
								_this.UsedBottles(_this.curDragBottles)
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
	this.historys.push('Test bottles [' + bottles_list.toString() + '] to mouse ' + mouse)
	$('#SubmitBoard .step-score').html(this.steps)
	for (i in bottles_list) {
		if (md5(bottles_list[i] + "This is a salt~~!@@!") in this.poison_list) {
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
			return true
		}
	}
	$("#mice-container #" + mouse)
		.animate() //Animate here
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
		this.Popup()

	}

}
GameManager.prototype.Popup = function() {
	_this = this
		if(_this.popupClosed)
		{
			$("#gameover").popup("open")
		}
		else{
			setTimeout(function(){_this.Popup(_this)}, 500)
			return		
		}
}
$(function() {
	if (location.href.search('#') != -1) {
		location.href = 'game.html'
	}
	$(document).bind('touchmove', false);
	GM = new GameManager(2, 100, 1);

});