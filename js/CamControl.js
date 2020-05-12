function CamControl(movetype, direction)
{
			var joystickcmd = "";
			if (movetype == "move")
			{
				switch(direction) {
					case 'up':
						//joystickcmd = "vx=0&vy=1";  //move continuously on mouse down and stop on mouse up
						joystickcmd = "move=up";  //move ~10 degree per click
						break;

					case 'down':
						//joystickcmd = "vx=0&vy=-1";
						joystickcmd = "move=down";
						break;

					case 'left':
						//joystickcmd = "vx=-1&vy=0";
						joystickcmd = "move=left";
						break;

					case 'right':
						//joystickcmd = "vx=1&vy=0";
						joystickcmd = "move=right";
						break;

					case 'stop':
						joystickcmd = "vx=0&vy=0";
						break;

					case 'home':
						joystickcmd = "move=home";
						break;

					default:
						break;
				}
				try {
					parent.retframe.location.href='http://' + ADDR_IP_CAM + ':' + PORT_IP_CAM_API + '/cgi-bin/camctrl/camctrl.cgi?' + joystickcmd;
				} 
				catch (err) {
					retframe.location.href='http://' + ADDR_IP_CAM + ':' + PORT_IP_CAM_API + '/cgi-bin/camctrl/camctrl.cgi?' + joystickcmd;
				}
			}
			else if (movetype == "zoom")
			{
				switch(direction) {
					case 'wide':
						//joystickcmd = "zooming=wide";  //zoom continuously on mouse down and stop on mouse up
						joystickcmd = "zoom=wide";  //zoom per click
						break;

					case 'tele':
						//joystickcmd = "zooming=tele";
						joystickcmd = "zoom=tele";
						break;

					case 'stop':
						joystickcmd = "zoom=stop&zs=0";
						break;
				}
				try {
					parent.retframe.location.href='http://' + ADDR_IP_CAM + ':' + PORT_IP_CAM_API + '/cgi-bin/camctrl/camctrl.cgi?' + joystickcmd;
				}
				catch (err) {
					retframe.location.href='http://' + ADDR_IP_CAM + ':' + PORT_IP_CAM_API + '/cgi-bin/camctrl/camctrl.cgi?' + joystickcmd;
				}
			}
			else if (movetype == "focus")
			{	
				switch(direction) {
					case 'near':
						joystickcmd = "focusing=near";
						break;

					case 'far':
						joystickcmd = "focusing=far";
						break;

					case 'auto':
						joystickcmd = "focus=auto";
						break;

					case 'stop':
						joystickcmd = "focusing=stop";
						break;
				}
				try {
					parent.retframe.location.href='/cgi-bin/camctrl/camctrl.cgi?' + joystickcmd;
				}
				catch (err) {
					retframe.location.href='/cgi-bin/camctrl/camctrl.cgi?' + joystickcmd;
				}
			}
			else
			{
				try {
					parent.retframe.location.href='/cgi-bin/camctrl/camctrl.cgi?'+ movetype +'='+ direction;
				}
				catch (err) {
					retframe.location.href='/cgi-bin/camctrl/camctrl.cgi?'+ movetype +'='+ direction;
				}
			}
}

/* 
 * PTZ Control
 */
/*preset*/
let ImgScale = 1;
let ScaleRate = 0.5;
let VerticalPosition = 0;   
let HorizontalPosition = 0;   
let ImgMoveRate = 100;
function ImgTele(){
    ImgScale += ScaleRate;
    $('#imageresource').css('transform', 'scale('+ ImgScale.toString() +')');
}

function ImgWide(){
    ImgScale += -1 * ScaleRate;
    if (ImgScale < 1) ImgScale = 1;
    $('#imageresource').css('transform', 'scale('+ ImgScale.toString() +')');
}

function ImgMoveDown(){
    VerticalPosition += -1 * ImgMoveRate;
    $('#imageresource').css('top', VerticalPosition.toString() +'px');
}

function ImgMoveUp(){
    VerticalPosition += ImgMoveRate;
    $('#imageresource').css('top', VerticalPosition.toString() +'px');
}

function ImgMoveRight(){
    HorizontalPosition += -1 * ImgMoveRate;
    $('#imageresource').css('left', HorizontalPosition.toString() +'px');
}

function ImgMoveLeft(){
    HorizontalPosition += ImgMoveRate;
    $('#imageresource').css('left', HorizontalPosition.toString() +'px');
}

function ImgResetPos(){
    ImgScale = 1;
    HorizontalPosition = 0;
    VerticalPosition = 0;
    $('#imageresource').css('top', VerticalPosition.toString() +'px');
    $('#imageresource').css('left', HorizontalPosition.toString() +'px');
    $('#imageresource').css('transform', 'scale('+ ImgScale.toString() +')');
}

var tidSubmitPresetPre = null;
var waitSlideLatency = 500;
function SubmitPreset(selObj) 
{
	if ( isSpeedDome(capability_ptzenabled) == 1)
	{
        if (tidSubmitPresetPre != null) {
			clearTimeout(tidSubmitPresetPre);
		}
		tidSubmitPresetPre = setTimeout(function() {
				var CGICmd='/cgi-bin/camctrl/recall.cgi?recall=' + encodeURIComponent($(selObj).selectedOptions().text());
		$.ajaxSetup({ cache: false, async: true});
			$.get(CGICmd)
			Log("Send: %s",CGICmd);
		}, waitSlideLatency);
	}
	else if(capability_fisheye != 0)
	{
		for (var i=0; i < selObj.options.length-1; i++)
		{
			if (selObj.options[i].selected)
				break;
		}
	
		if (selObj.options[i].value == -1)
		{
			return;
		}
		
		var PresetPos = eval("eptz_c0_s" + streamsource + "_preset_i" + $(selObj).selectedOptions().val() + "_pos");
		//console.log("goto preset %s", PresetPos);
		document.getElementById(PLUGIN_ID).FishEyeGoPreset(
			parseInt(PresetPos.split(",")[0]), 
			parseInt(PresetPos.split(",")[1]), 
			parseInt(PresetPos.split(",")[2]), 
			parseInt(PresetPos.split(",")[3]), 
			parseInt(PresetPos.split(",")[4])
		);	
	}
	else if (isIZ(capability_ptzenabled) == 1)
	{
		var ChannelNo = 0;
		if (tidSubmitPresetPre != null) {
			clearTimeout(tidSubmitPresetPre);
		}
		tidSubmitPresetPre = setTimeout(function() {
			var CGICmd='/cgi-bin/camctrl/recall.cgi?channel=' + ChannelNo + '&recall=' + encodeURIComponent($(selObj).selectedOptions().text());
		$.ajaxSetup({ cache: false, async: true});
			$.get(CGICmd)
			Log("Send: %s",CGICmd);
		}, waitSlideLatency);
	}
	else
	{	
		var ChannelNo = 0;
		if (getCookie("activatedmode") == "mechanical")
		{
			var CGICmd='/cgi-bin/camctrl/recall.cgi?channel=' + ChannelNo + '&index=' + $(selObj).selectedOptions().val();
		}
		else
		{
			var CGICmd='/cgi-bin/camctrl/eRecall.cgi?stream=' + streamsource + '&recall=' + encodeURIComponent($(selObj).selectedOptions().text());
		}
		parent.retframe.location.href=CGICmd;
		// Show ZoomRatio after goto some presetlocation!
		var preset_num = $(selObj).selectedOptions().val();
		setTimeout("ShowPresetZoomRatio("+preset_num+")",1500);
		Log("Send: %s",CGICmd);
	}
}

function fGetPresetOptions()
{
	$("#fSelectPreset").prop("method", "get");
	$("#fSelectPreset").prop("action", "http://" + ADDR_IP_CAM + ":" + PORT_IP_CAM_API + "/cgi-bin/viewer/getparam.cgi");
	
	var CGICmdParameter;

	$('#fSelectPreset').append('<input id="tmpInputParameter" type="hidden" name="capability_npreset" value="" />'); 
	$('#fSelectPreset').submit();
	$("#tmpInputParameter").remove();  //remove the temp input element for passing the parameter.
}

/*sumit the recall command to Moves device to the preset position based on name.*/
function fSelectPreset()
{
	var presetName = $("#sel-preset option:selected").text();  //the text of the selected option

	$("#fSelectPreset").prop("method", "get");
	$("#fSelectPreset").prop("action", "http://" + ADDR_IP_CAM + ":" + PORT_IP_CAM_API + "/cgi-bin/viewer/recall.cgi");
	$('#fSelectPreset').append('<input id="tmpInputParameter" type="hidden" name="recall" value="' + presetName + '" />'); 
	$('#fSelectPreset').submit();
	$("#tmpInputParameter").remove();  //remove the temp input element for passing the parameter.
}


function flogin() 
{
	var form = document.getElementById('login');
	form.submit();
}

function reloadImage(pThis)
{
	setTimeout( function ()
	{
		//pThis.onerror = null;
		pThis.src = pThis.src;
	}, 1000);	
}

function toggleFullScreen(htmlId) {
  var doc = window.document;
  var elem = document.getElementById(htmlId); //the element you want to make fullscreen

  var requestFullScreen = elem.requestFullscreen || elem.webkitRequestFullScreen || elem.mozRequestFullScreen || elem.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen|| doc.msExitFullscreen;

  if(!(doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement)) {
      requestFullScreen.call(elem);
	  elem.style.backgroundColor = "black";
  }
  else {
    cancelFullScreen.call(doc);
	elem.style.backgroundColor = "";
  }
}

window.addEventListener('load', function(){
  document.getElementById("imageresource").addEventListener('click', function(){
	  toggleFullScreen("imageresource");
	  });  //toggleFullScreen when click the video 
})
