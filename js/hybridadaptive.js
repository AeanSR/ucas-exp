function HAGameManager(bottles, allow_overlap,is_test) {
	this.mice = 0;
	this.bottles = bottles;
	this.is_test = is_test
	this.bottle_list = []
	this.result = {};
	this.historys = []
	this.popupClosed = true
	this.allow_overlap = allow_overlap
	this.weeks = 0
	this.aa = new AdaptiveAdversary(bottles,2)
	this.create()
}
HAGameManager.prototype.create = function() {
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
	_this.createMouse()

	$("#button_submit").click(function(event) {
		res = _this.judgeOverlap()
		Overlaps = res[0]
		overlaping = res[1]
		mouse1 = res[2]
		mouse2 = res[3]
		_this.nextWeek(mouse1, mouse2 ,overlaping)

		if(_this.aa.bottles==1||_this.aa.mice ==0){
			is_win=_this.aa.bottles==1
			_this.isGameOver(is_win)
		}

	});
	//preload image
	new Image().src= 'imgs/mouse-dead.png'
	// Initialize bottles container
	$(".submit").sortable()
	// Init data
	for (var i = 1; i <= _this.bottles; i++) _this.bottle_list.push(i)
	// Create bottles
	_this.addBottles(_this.bottle_list)
}


HAGameManager.prototype.createMouse = function() {
	_this = this
	_this.mice += 1
	mouse_dom = $("<div></div>", {
		class: "mice",
		id: _this.mice
	})
	.html('<p>0</p><img src="imgs/mouse-alive.png">')
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
	// Bind click to popup

	mouse_dom.find('img').click(function(event) {
		console.log('mouse ' + $(this).parent()[0].id+ ' has been clicked')
		_this.popupClosed = false
		_this.showMousePopup(parseInt($(this).parent()[0].id),event)

	});
	// Record the content
	_this.result[_this.mice] = []
}
HAGameManager.prototype.removeMouse = function(mouse) {
	$('#mice-container #' +mouse).remove()
}

HAGameManager.prototype.addBottles = function(bottle_list) {
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

HAGameManager.prototype.addBottlesToMouse = function(draglist, mouse) {
	for(var x in draglist){
		this.addBottleToMouse(draglist[x],mouse)
	}
	this.clearAllselect()
}
HAGameManager.prototype.addBottleToMouse = function(bottle_id, mouse) {
	_this = this
	if($.inArray(bottle_id,_this.result[mouse])==-1){
		_this.result[mouse].push(bottle_id)
	}
	$("#mice-container #"  + mouse + " p").text(_this.result[mouse].length)
}

HAGameManager.prototype.removeBottleFromMouse = function(bottle_id, mouse) {
	_this = this
	index = $.inArray(bottle_id,_this.result[mouse])
	if(index>-1){
		_this.result[mouse].splice(index,1);
	}
	$("#mice-container #"  + mouse + " p").text(_this.result[mouse].length)
}
HAGameManager.prototype.clearAllselect = function() {
	selected_doms = $("#bottles-container .bottle[select=true]")
	for(var i=0;i<selected_doms.length;i++){
		$(selected_doms[i]).attr('select','false')
		$(selected_doms[i]).css('background-color','')
	}
}
HAGameManager.prototype.killMouse = function(mouse) {
		$("#mice-container #" + r).html('<img src="imgs/mouse-dead.png">')
		.unbind('click')
		.droppable("disable")}

HAGameManager.prototype.showMousePopup = function(mouse,event) {
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

HAGameManager.prototype.updateTestedBottle = function(updated_list) {
	for(var i in updated_list){
		$("#bottles-container #" + i )
		.css("background-color",'white')
		.unbind("click")
		.draggable("disable")
	}
}

HAGameManager.prototype.nextWeek = function(mouse1,mouse2,overlaps) {
	this.weeks ++
	$("#step-score").text(this.weeks)
	r = this.aa.decide(mouse1,mouse2, overlaps)
	if(r==1||r==2){
		this.killMouse(r)
	}
	else if(r==3){
		this.killMouse(1)
		this.killMouse(2)
	}
	this.updateTestedBottle(this.aa.tested_bottle)
	for(var i=1;i<=this.mice;i++){
		n = this.result[i].length
		for(var j=0;j<n;j++){
			bottle = this.result[i][0]
			this.removeBottleFromMouse(bottle, i)
		}
	}

	//delete this.result
	//this.result ={}
}
HAGameManager.prototype.judgeOverlap = function() {
	overlaped ={}
	overlaps = 0
	overlapping =[]
	mouse1 = []
	mouse2 = []

	for(var j=1;j<=this.bottles;j++){
		overlaped[j] = 0
	}
	for(var i=1;i<=this.mice;i++){
		for(var j in this.result[i]){
			bottle = this.result[i][j]
			overlaped[bottle] ++
		}
	}
	for(var j=1;j<=this.bottles;j++){
		if(overlaped[j]>1){
			overlapping.push(j)
			overlaps++
		}
		else if(overlaped[j]==1){
			if($.inArray(j,_this.result[1])!=-1){
				mouse1.push(j)
			}
			else{
				mouse2.push(j)
			}
		}
	}
	return [overlaps,overlapping,mouse1, mouse2]
}

HAGameManager.prototype.isGameOver = function(isWin) {
	this.is_test?
	newhref = 'hybrid-adaptive.html':
	newhref = 'hybrid-adaptive.html?submit'
	if(isWin){
		$("#gameover h1").text("Great!")
		$("#gameover #gameover-notice").text("You have passed the game successfully with " + this.weeks + " weeks!")
		this.is_test?
		$("#gameover #gameover-content").text("Test mode won't upload the results."):
		$("#gameover #gameover-content").text("The result has been submitted to the server. ")
		this.is_test?
		$("#gameover .ui-btn").text("Retry"):
		$("#gameover .ui-btn").text("Continue")
		this.historys.push('GameOver:win')
		$("#gameover .ui-btn").click(function() {
			location.href = newhref
		})
		this.Popup()
	}
	else{
		$("#gameover h1").text("Sorry!")
		$("#gameover #gameover-notice").text("You didn't find the poison!")
		this.is_test?
		$("#gameover #gameover-content").text("Test mode won't upload the results."):
		$("#gameover #gameover-content").text("Please try again, this time won't be submitted.")
		$("#gameover .ui-btn").text("Retry")
		$("#gameover .ui-btn").click(function() {
			location.href = newhref
		})
		this.historys.push('GameOver:lose')
		this.Popup()
	}
}
HAGameManager.prototype.Popup = function() {
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
HAGameManager.prototype.getMouse = function(b) {
	deadMouse = {}
	for(var mouse=1;mouse<=this.mice;mouse++){
		deadMouse[mouse] = b % 2
		b = Math.floor(b/2)
	}
	return deadMouse
}

function AdaptiveAdversary(bottles,mice) {
	this.mat=[]
	this.tested_bottle ={}
	this.bottles = bottles
	this.origbottles = bottles
	this.mice = mice
    	for(var i=0;i<101;++i)this.mat[i]=[0,0,0]
}
AdaptiveAdversary.prototype.filter=function(list){
	newlist = []
	for(var i in list){
		if(this.tested_bottle[list[i]]==undefined){
			newlist.push(list[i])
		}
	}
	return newlist
}
AdaptiveAdversary.prototype.setTested=function(list){
	for(var i in list){
		this.tested_bottle[list[i]] = 0   // without poison
		this.bottles -=1
	}
}
AdaptiveAdversary.prototype.rest=function(mouse1,mouse2,overlaped){
	all_list = []
	all_list = all_list.concat(mouse1).concat(mouse2).concat(overlaped)
	newlist = []
	for(var i=1;i<=this.origbottles;i++){
		if($.inArray(i,all_list)==-1){
			newlist.push(i)
		}
	}
	return newlist
}
AdaptiveAdversary.prototype.decide=function(mouse1,mouse2,overlaped){
	var f_mouse1 = this.filter(mouse1)
	var f_mouse2 = this.filter(mouse2)
	var f_overlaped = this.filter(overlaped)
	var rest = this.rest(mouse1,mouse2,overlaped)
	var f_rest = this.filter(rest)
	console.log(this.bottles,f_mouse1.length,f_mouse2.length,f_overlaped.length,this.mice)
	r =this.computerDecide(this.bottles,f_mouse1.length,f_mouse2.length,f_overlaped.length,this.mice)
	if(r[0]==0){
		console.log('nothing')
		this.setTested(f_mouse1)
		this.setTested(f_mouse2)
		this.setTested(f_overlaped)
	}
	else if(r[0]==1){
		console.log('mouse 1 die')
		this.setTested(f_mouse2)
		this.setTested(f_overlaped)
		this.setTested(f_rest)
		this.mice -=1
	}
	else if(r[0]==2){
		console.log('mouse 2 die')
		this.setTested(f_mouse1)
		this.setTested(f_overlaped)
		this.setTested(f_rest)
		this.mice -=1
	}
	else if(r[0]==3){
		console.log('mouse 1 2 die')
		this.setTested(f_mouse1)
		this.setTested(f_mouse2)
		this.setTested(f_rest)
		this.mice -=2
	}
	return r[0]
}

AdaptiveAdversary.prototype.computerDecide = function(bottles, mouse1,mouse2 ,overlaped, mice) {
	var selectedbottles = mouse1+mouse2+overlaped
	var mouse = (mouse1>mouse2)?mouse1:mouse2
	var larger =  (mouse1>mouse2)?1:2
	if(overlaped>1){
		return [3,65535]
	}
	if(bottles==(selectedbottles)){
		if((mouse1+mouse2)!=0)
			return  [larger,this.humanDecide(selectedbottles,mice-1)]
		else
			return [3,this.humanDecide(selectedbottles,mice-2)]
	}
	var a=this.humanDecide(bottles-selectedbottles,mice);    //dead 0
	var b=this.humanDecide(mouse,mice-1);    //dead 1
	var c=this.humanDecide(overlaped,mice-2);    //dead 2 ,overlapped won't be considered by human.
	if(b>=a&&b>=c){
		return [larger,b]
	}
	else{
		if(a>=c)return [0,a];
		return [3,c];
	}

}
AdaptiveAdversary.prototype.humanDecide = function(bottles,mice){
			if(mice<0){
				return 0
			}     
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
    			for(var j=0;j<i;j++){
    				var t1=this.computerDecide(bottles,i-j,j, 0,mice)    //0 overlap
				var t2=this.computerDecide(bottles, i-j-1, j,1,mice)    //1 overlap
	    			var t=t1[1]
	    			if(t<min){
	    				min=t
	    				ind=i
	    			}
	    			var t=t2[1]
	    			if(t<min){
	    				min=t
	    				ind=i
	    			}

    			}

    		}
    		this.mat[bottles][mice]=min+1
    		return min+1;
    }

$(function() {
	$("body").iealert();
	if (location.href.search('#') != -1) {
		location.href = 'hybrid-adaptive.html'
	}
	if (location.href.search('/?submit') != -1) {
		GM = new HAGameManager(32,1,false);
	}
	else{
		GM = new HAGameManager(16,1,true);
	}
});