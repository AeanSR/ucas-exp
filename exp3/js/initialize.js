$(document).on("pagecreate", function(){
	$("body").iealert();
	if(location.href.search('/?formal') != -1){
		gm = new GameManager("formal")
		$("#gameMode").text("正式模式")
	}
	else{
		gm = new GameManager("test")
		$("#gameMode").text("测试模式")
	}
	gm.getinfo()
})