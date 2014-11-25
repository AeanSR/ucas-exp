getRouteTableHtml = function(topo, localIndex, routeTableScale) {
	var routeHtml = '<caption>Route Table of Node'+localIndex+'</caption><tr><td>Destination</td><td>Next</td></tr>'
	for(var k = 1; k <= routeTableScale; k++) {
		// var recordHtml = '<div class="ui-field-contain" id="ui-field-contain-'+k+'">\
		// <fieldset data-role="controlgroup" data-type="horizontal">\
		// <legend></legend>\
		// <label for="dest-' +localIndex+k+'">Destination</label>\
		// <input type="text" name="dest-'+localIndex+k+'" id="dest-'+localIndex+k+'"/>'
		// var destOpt = '<option value="-1">default</option>'
		// for(var i = 0; i < topo.length; i++) {
		// 	destOpt += '<option value="'+i+'">'+i+'</option>'
		// }
		// recordHtml += destOpt
		var recordHtml = '<tr id="ui-field-contain-'+k+'">\
		<td><input type="text" name="dest-'+localIndex+k+'" id="dest-'+localIndex+k+'"/></td>'
		var nextOpt = ""
		for(var j = 0; j < topo.length; j++) {
			if (j == localIndex)continue
			if(topo.matrix.isLinked(localIndex, j)){
				nextOpt += '<option value="'+j+'">'+j+'</option>'
			}
		}
		// recordHtml += '</select>\
		recordHtml += '<td><select name="next-'+localIndex+k+'" id="next-'+localIndex+k+'">'
		recordHtml += nextOpt
		recordHtml += '</select></td>'
		routeHtml += recordHtml;
	}
	return routeHtml
}

paintEvaluation = function(p2pTopo, c2sTopo, route, clientsIndex, serverIndex, routeP2PAverageRate, routeP2PPath,  routeP2PBottleneck, routeC2SAverageRate, routeC2SPath, routeC2SBottleneck, routeTableScale) {
	var num = p2pTopo.length;
	// var p2pTopoCenter = new Point(view.element.clientWidth/5*1, view.element.clientHeight/2)
	var c2sTopoCenter = new Point(view.element.clientWidth/5 *2, view.element.clientHeight/2)
	// renderTopoFrame(p2pTopo, p2pTopoCenter, 100, 200, 300)
	// renderTopoFrame(c2sTopo, c2sTopoCenter, 100, 200, 300)

	// renderTopoFrame(p2pTopo, p2pTopoCenter, 80, 160, 240)
	renderTopoFrame(c2sTopo, c2sTopoCenter, 80, 160, 240)

	// 先画path，在对下面的图层
	// renderPath(p2pTopo)
	renderPath(c2sTopo)
	// renderTrafficPath(p2pTopo, routeP2PAverageRate, routeP2PPath)
	renderTrafficPath(c2sTopo, routeC2SAverageRate, routeC2SPath)

	for(var i = 0; i < num; i++ ) {
		// var p2pPath = renderBasicNode(p2pTopo, i)
		// renderSpecialNode(p2pTopo, "p2p", p2pPath, i, route, routeTableScale, true, routeP2PAverageRate, clientsIndex, serverIndex)
		var c2sPath = renderBasicNode(c2sTopo, i)
		renderSpecialNode(c2sTopo, "c2s" , c2sPath, i, route, routeTableScale, true, routeC2SAverageRate, routeC2SBottleneck, clientsIndex, serverIndex)
	}
	

	
	// to do 
	// 用不一样的颜色表示正在传输的path
	// 表示平均速率
	console.log("render done!")
}

// flag 值可能为-1 和 0, 其中-1表示正在选择topo图(不会处理nodes和myRoute变量)
paintTopo = function(flag, topo, info, nodes, myRoute, routeTableScale) {
	var num = topo.length;
	var topoFrameCenter = new Point(view.element.clientWidth/5*2, view.element.clientHeight/2)
	renderTopoFrame(topo, topoFrameCenter, 100, 200 ,300)
	renderPath(topo)
	for(var i = 0; i < num; i++ ) {
		var path = renderBasicNode(topo, i)
		// 只有确定了topo图才会显示分配的结点
		if(flag != -1 ){
			if($.inArray(i, nodes[info["userId"]]) != -1){

				renderSpecialNode(topo, "", path, i, myRoute, routeTableScale, false, null, null, null, null)
			}
		}
	}
	console.log("render done!")
}

// 绘流量图（流量粗细）和平均transmission rate
var renderTrafficPath = function(topo, averageRate, routePaths) {

	// 流量粗细
	// console.log(routePaths)
	// console.log(averageRate)
	pathWeight = {}
	for(var key in routePaths) {
		var pathArray = routePaths[key]
		var tmpPath = key + "-"+pathArray[0]
		if(tmpPath in pathWeight){
			pathWeight[tmpPath] ++
		} else {
			pathWeight[tmpPath] = 1
		}
		for(var i=0; i<pathArray.length-1; i++){
			var tmpPath = pathArray[i] + "-"+pathArray[i+1]
			if(tmpPath in pathWeight){
				pathWeight[tmpPath] ++
			} else {
				pathWeight[tmpPath] = 1
			}
		}
	}

	console.log(pathWeight)
	for(var path in pathWeight){
		var weight = pathWeight[path]
		var iNode = topo.nodeList.get(path.split("-")[0])
		var jNode = topo.nodeList.get(path.split("-")[1])
		var path = new Path.Line(new Point(iNode.x, iNode.y), new Point(jNode.x, jNode.y))
		path.strokeColor = 'red'
		path.strokeWidth = 5 * weight
	}

	// 平均transmission rate
	for(var index=0; index<topo.length; index++){
		if(averageRate[index] == -1)
			continue
		var p = topo.nodeList.get(index);
		var text = new PointText({
			point: [p.x+15, p.y+20],
			content: averageRate[index],
			fillColor: 'black',
			fontFamily: 'Courier New',
			fontWeight: 'bold',
			fontSize: 10
		});
		text.bringToFront()
	}
}

var renderTopoFrame = function(topo, center, innerRadius, midRadius, outerRadius) {
	// topo的nodeList中点的位置根据画布进行固定
	var num = topo.avaliableLength;
	var clientNum = 0;
	if(num != topo.length){
		clientNum = topo.length - num
	}
	var center = new Point(center.x, center.y)
	var edgeNum = parseInt(num / 3)
	var outerNum = parseInt(num - edgeNum * 2)
	var inner = new Path.RegularPolygon(center, edgeNum, innerRadius);
	var mid = new Path.RegularPolygon(center, edgeNum, midRadius);
	var outer = new Path.RegularPolygon(center, outerNum, outerRadius);
	//var outerClient = new Path.RegularPolygon(center, outerNum, outerRadius + 30);
	for(var i = 0; i < num; i ++) {
		if( i < edgeNum){
			var tmp = inner.segments[i].point
			topo.nodeList.set(i, tmp.x, tmp.y)
		}else if(i < edgeNum * 2) {
			var tmp = mid.segments[i - edgeNum].point
			topo.nodeList.set(i, tmp.x, tmp.y)
		}else {
			var tmp = outer.segments[i - edgeNum * 2].point
			topo.nodeList.set(i, tmp.x, tmp.y)
		}
	}

	if(clientNum!=0){
		for(var i = num; i < num+outerNum; i ++) {
			var clientOuter = new Path.RegularPolygon(center, outerNum, outerRadius+50);
			var tmp = clientOuter.segments[i - num].point
			topo.nodeList.set(i, tmp.x, tmp.y)
		}
	}
}

// 给一个结点绘图
var renderBasicNode = function(topo, index){
	var num = topo.avaliableLength;
	var p = topo.nodeList.get(index);
	var path = new Path.Circle(new Point(p.x, p.y), getCircleSize(num, index));
	path.strokeColor = 'black';
	//说明是客户端层的
	if(index > num-1){
		return path
	}
	var text = new PointText({
		point: [p.x-7, p.y+5],
		content: index,
		fillColor: 'black',
		fontFamily: 'Courier New',
		fontWeight: 'bold',
		fontSize: 15
	});
	path.fillColor = 'white'
	return path
}

// 涂上特定颜色，并且导入该节点路由表；如果是isEvaluation，还需要标识出client和server，颜色要用深浅表示
var renderSpecialNode = function(topo, topoName, basicPath, index, myRoute, routeTableScale, isEvaluation, averageRate, routeC2SBottleneck, clientsIndex, serverIndex){
	var num = topo.avaliableLength;
	var outerNum = num - parseInt(num/3) * 2
	
	basicPath.fillColor = 'yellow'
	if(isEvaluation == true){
		var clientUrl = 'imgs/client.png';
		var serverUrl = 'imgs/server.png';
		var node = topo.nodeList.get(index)

		//说明是客户端层的
		if(index > num-1){
			basicPath.remove()
			if($.inArray(index - outerNum, clientsIndex) !=- 1){
				var raster = new Raster(clientUrl, new Point(node.x, node.y));
				raster.scale(0.3)
				var text = new PointText({
				point: [node.x+10, node.y+25],
				content: "吞吐率"+routeC2SBottleneck[index - outerNum],
				fillColor: 'black',
				fontFamily: 'Courier New',
				fontWeight: 'bold',
				fontSize: 10
				});
				text.bringToFront()
			}
			return;
		}
		basicPath.fillColor = new Color(1, 0.9, 1)
		if($.inArray(index - outerNum, clientsIndex) !=- 1){
			var raster = new Raster(clientUrl, new Point(node.x, node.y));
			raster.scale(0.3)
		} else if( index ==  serverIndex){
			var raster = new Raster(serverUrl, new Point(node.x, node.y));
			raster.scale(0.35)
		} else {
			if(averageRate[index] != -1){
				basicPath.fillColor = new Color(0.2,0.1,0.1)
				var ratio = 0
				var addFactor = new Color(0.15, 0.1, 0.15)
				if(averageRate[index] < 5)
					ratio = 0
				else if(averageRate[index] < 10)
					ratio = 1
				else if(averageRate[index] < 20)
					ratio =  2
				else if(averageRate[index] < 40)
					ratio =  3
				else if(averageRate[index] < 70)
					ratio =  4
				else if(averageRate[index] < 100)
					ratio =  5
				else if(averageRate[index] < 200)
					ratio =  6
				else if(averageRate[index] < 300)
					ratio =  7
				else
					ratio = 8
				for(var j=0; j<ratio; j++){
					basicPath.fillColor += addFactor
				}
			}
				

		}
	}
	var coverPath = basicPath.clone()
	coverPath.opacity = 0
	coverPath.bringToFront()
	coverPath.data.index = index;
	var popupDom = $('<table></table>', {
		"data-role": "popup",
		id: "route-table-" + topoName + index,
		class: "ui-popup"
	}).html(getRouteTableHtml(topo, index, routeTableScale))
	var page = $(':mobile-pagecontainer').pagecontainer('getActivePage');
	// popupDom.appendTo(page).trigger('create').popup({"afterclose":function(){_this.popupClosed = true}})
	popupDom.appendTo(page).popup({"afterclose":function(){_this.popupClosed = true}})
	coverPath.onMouseDown = function(event) {
		$("#route-table-" + topoName + this.data.index).popup("open",{
			x: event.event.x + 40,
			y: event.event.y + 40
		});
	}

	// 导入玩家的路由表
	for(var k = 1; k <= routeTableScale; k++) {
		if(index in myRoute){
			var tmp = myRoute[index][k-1]
			for(var key in tmp) {
				if(isEvaluation == true){
					$("input#dest-"+index+k).attr("disabled", true)
					$("select#next-"+index+k).attr("disabled", true)
				}
				if(key == "null")continue
				$("input#dest-"+index+k).val(key)
				$("select#next-"+index+k+" option[value=" + tmp[key]+ "]").attr("selected", true)
			}
		}
	}

}

var renderPath = function(topo) {
	var num = topo.length;
	for(var i = 0; i < num; i++) {
		for(var j = 0; j < i; j++) {
			if(topo.matrix.isLinked(i, j)) {
				var iNode = topo.nodeList.get(i)
				var jNode = topo.nodeList.get(j)
				var path = new Path.Line(new Point(iNode.x, iNode.y), new Point(jNode.x, jNode.y))
				path.strokeColor = 'black'
			}
		}
	}
}

var getCircleSize= function(topoAvailableScale, index) {
	var innerNum = parseInt(topoAvailableScale / 3)
	var outerNum = parseInt(topoAvailableScale - innerNum * 2)
	if(index < innerNum)
		return 22
	else if(index < 2*innerNum)
		return 17
	else
		return 13
}
// topo = new Topology(30, view.element.clientHeight, view.element.clientWidth)
// topo.random()
// initCanvas(topo);

onResize = function() {
	view.viewSize.width = view.element.clientWidth;
	view.viewSize.height = view.element.clientHeight;
}

