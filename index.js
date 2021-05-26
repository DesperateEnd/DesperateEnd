import {getErrType} from './errorCode.js'
// create Agora client 创建实例
var client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
var callType = 1;// 1语音 2视频
var localTracks = {
  videoTrack: null,
  audioTrack: null
};
var isOpen = false
//加入房间的用户
var remoteUsers = {};
// Agora client options 登录参数
var options = {
  appid: null,//appID 
  channel: null,//房间名
  uid: null,//用户id
  token: null//token
};



// the demo can auto join channel with params in url 如果地址带有参数 直接登录
$(() => {
  var urlParams = new URL(location.href).searchParams;
  options.appid = urlParams.get("appid");
  options.channel = urlParams.get("channel");
  options.token = decodeURIComponent(urlParams.get("token"));
  options.uid = urlParams.get("uid")*1;
  callType = urlParams.get("type")*1;
  if(callType === 2){
    
    $(".open-call").addClass("videocall")
  }
  console.log(options)
  // console.log("用户id",options.uid)
  //如果参数齐全直接加入房间
  if(options.appid){
    $("#appid").val(options.appid);
  }
  if(options.channel){
    $("#channel").val(options.channel);
  }
  if(options.uid){
    $("#userid").val(options.uid)
  }
  if(options.token){
    $("#token").val(options.token);
  }
  if (options.appid && options.channel && options.uid && options.token) {
    $("#join-form").submit();
  }
})
if(callType === 1 ){
  var localTracks = {
    audioTrack: null
  };
}
    
//加入房间按钮 点击事件
$("#join-form").submit(async function (e) {
  e.preventDefault();
  options.appid = $("#appid").val();
  options.channel = $("#channel").val();
  options.token = $("#token").val();
  options.uid = $("#userid").val()*1;
  $("#join").attr("disabled", true);
  console.log(options)
  try {
    if(!options.appid){
      alert('请输入appID')
      return
    }
    if(!options.token){
      alert('请输入token')
      return
    }
    if(!options.channel){
      alert('请输入房间名')
      return
    }
    await join();
    
  } catch (error) {
    getErrType(error.code,1)
    console.error(error);
  } finally {
    $("#leave").attr("disabled", false);
  }
})
//退出按钮点击事件
$("#leave").click(function (e) {
  leave();
})
//挂断按钮点击事件
$('.leave-btn').click(function(){
  if(isOpen){
    leave();
  }else{
    if(plus){
      let videoView = plus.webview.getWebviewById('videoView');
      videoView.loadURL("http://test.com?type=5")
    }
  }
  $(".call-box").hide();
})
//加入通话事件
async function join() {
  if(callType===2){
    $(".my-video").show();
  }
  $(".call-box").show()
  isOpen = true
  // add event listener to play remote tracks when remote user publishs.
  //监听人员加入事件
  client.on("user-published", handleUserPublished);
  //监听人员退出事件
  client.on("user-unpublished", handleUserUnpublished);
  //token 即将过期的回调
  client.on("token-privilege-will-expire",upDateToken)
  //token 已经过期的回调
  client.on("token-privilege-did-expire",tokenExpired)
  if(callType === 1 ){
    //join a channel and create local tracks, we can use Promise.all to run them concurrently
  [ options.uid, localTracks.audioTrack ] = await Promise.all([
    // join the channel
    //加入房间 返回uid
    client.join(options.appid, options.channel, options.token ,options.uid),
    // create local tracks, using microphone and camera
    //创建音频轨道对象 返回音频实例
    AgoraRTC.createMicrophoneAudioTrack(),
    
  ]);
  
  }else{
    //join a channel and create local tracks, we can use Promise.all to run them concurrently
  [ options.uid, localTracks.audioTrack, localTracks.videoTrack ] = await Promise.all([
    // join the channel
    //加入房间 返回uid
    client.join(options.appid, options.channel, options.token ,options.uid),
    // create local tracks, using microphone and camera
    //创建音频轨道对象 返回音频实例
    AgoraRTC.createMicrophoneAudioTrack(),
    //创建视频轨道对象 返回视频实例
    AgoraRTC.createCameraVideoTrack()
  ]);
  // play local video track 播放视频
  localTracks.videoTrack.play("local-player",{
    Properties:'contain'
  });
  //显示 视频id
  $("#local-player-name").text(`localVideo(${options.uid})`);
  }
  

  // publish local tracks to channel 发布本地音视频轨道
  await client.publish(Object.values(localTracks));
  callDate()
  console.log("publish success");
}
// 计时方法
function callDate(){
  let showDate = 0;
  setInterval(()=>{
       showDate+=1;
       let m = parseInt(showDate/60)
       let s = showDate%60
       if(m<10){
         m = "0"+m
       }
       if(s<10){
         s = "0"+s
       }
       let showStr = m + ':' + s;
       console.log(showStr)
       $(".call-status").text(showStr)
  },1000)
}
//更新token 方法
window.test =  async function upDateToken2(){
  let string = document.querySelector(".test-input").value;
  console.log("获取到新token======"+string)
 let res = await client.renewToken(string);
 console.log(res)
}
async function tokenExpired(){
  console.log("token已过期")
}
async  function upDateToken(){
  console.log("token即将过期")
  
  if(plus){
    let videoView = plus.webview.getWebviewById('videoView');
    videoView.loadURL("http://test.com?type=1")
  }
}
//退出房间方法
async function leave() {
  
  for (let trackName in localTracks) {
    var track = localTracks[trackName];
    if(track) {
      track.stop();//停止播放
      track.close();//关闭
      localTracks[trackName] = undefined;//清除实例
    }
  }
  // remove remote users and player views
  remoteUsers = {};
  //移除video 标签
  $("#remote-playerlist").html("");

  // leave the channel 实例退出
  await client.leave();

  $("#local-player-name").text("");
  $("#join").attr("disabled", false);
  $("#leave").attr("disabled", true);
  console.log("client leaves channel success");
  if(plus){
    let videoView = plus.webview.getWebviewById('videoView');
    videoView.loadURL("http://test.com?type=2")
  }
}
// 创建dom
async function subscribe(user, mediaType) {
  const uid = user.uid;
  // subscribe to a remote user
  await client.subscribe(user, mediaType);
  console.log("subscribe success",mediaType);
  $(".other-box").text('')
  $(".other-box").attr('data-uid',uid)
  if (mediaType === 'video') {//视频
    // const player = $(`
    //   <div id="player-wrapper-${uid}">
    //     <p class="player-name">remoteUser(${uid})</p>
    //     <div id="player-${uid}" class="player"></div>
    //   </div>
    // `);
    const player = $(`<div id="player-${uid}" class="player"></div>`)
    
    $(".other-box").append(player);
    const ptherUser = $(`<p class="other-${uid}" data-uid="${uid}">otherVideo(${uid})</p>`)
    $("#remote-playerlist").append(ptherUser)
    user.videoTrack.play(`player-${uid}`,{
      Properties:'contain'
    });
  }
  if (mediaType === 'audio') {//音频
    user.audioTrack.play();
  }
}

//人员加入房间回调
function handleUserPublished(user, mediaType) {
  console.log(user, mediaType)
  const id = user.uid;
  remoteUsers[id] = user;
  subscribe(user, mediaType);
}
//人员退出回调
function handleUserUnpublished(user) {
  const id = user.uid;
  delete remoteUsers[id];
  $(`.other-${id}`).remove();
  $(`#player-wrapper-${id}`).remove();
}
async function switchVideo(id){
   // 切换摄像头。
localTracks.videoTrack.setDevice(id).then(() => {
  console.log("set device success");
  // alert('切换成功')
}).catch(e => {
  // alert(`切换失败：${e.code}`)
  console.log("set device error", e);
});
}
//点击切换摄像头
$(".switch-camera").click(function(){
  //获取设备id
  AgoraRTC.getCameras().then(res=>{
    switchVideo(res[1].deviceId)
    $(".switch-camera").hide();
    $(".switch-camera-active").show();
  }).catch(err=>{
    console.log(err)
  })
})
$(".switch-camera-active").click(function(){
  //获取设备id
  AgoraRTC.getCameras().then(res=>{
    switchVideo(res[0].deviceId)
    $(".switch-camera-active").hide();
    $(".switch-camera").show();
   
  }).catch(err=>{
    console.log(err)
  })
})			
document.addEventListener("plusready", function(){
	//扩展API加载完成事
  console.log('plusapi加载完毕')
  plus.device.getInfo({
    success:(res)=>{
      console.log('获取成功'+JSON.stringify(res))
    },
    fail:(err)=>{
      alert('获取失败')
    }
  })

}, false);
//最小化
$(".show-min").click(function(){
  $(".call-box").hide()
  if(plus){
    var videoView = plus.webview.getWebviewById('videoView');
    videoView.setStyle({
      height:"60px",
      width:"60px",
      top:"60px",
      left:"80%",
  });
  $(".min-float").show()
  }
 
})
$(".min-float").click(function(){
  $(".call-box").show()
  if(plus){
    var videoView = plus.webview.getWebviewById('videoView');
    videoView.setStyle({
      height:"100%",
      width:"100%",
      top:"0",
      left:"0"
  });
  $(".min-float").hide()
  }
})
//最大化
$(".show-max").click(function(){
  $(".show-min").show();
  $(".show-max").hide();
  $(".call-box").removeClass('call-box-min');
  $('.btn-box').show();
  $(".my-video").show();
})

//静音
$(".audio-auto").click(function(){
  let uid = $(".other-box").attr('data-uid')
  remoteUsers[uid].audioTrack.setVolume(0);
  $(".audio-auto").hide();
  $(".audio-none").show();
})
//取消静音
$(".audio-none").click(function(){
  let uid =  $(".other-box").attr('data-uid')
  remoteUsers[uid].audioTrack.setVolume(100);
  $(".audio-auto").show();
  $(".audio-none").hide();
})
//静麦
$(".mc-btn").click(function(){
  let uid = options.uid
  console.log(localTracks.audioTrack,localTracks.localAudioTrack)
  localTracks.audioTrack.setVolume(0);
  $(".mc-btn").hide();
  $(".mc-btn-active").show();
})
//取消静麦
$(".mc-btn-active").click(function(){
  let uid =  options.uid
  // localAudioTrack
  localTracks.audioTrack.setVolume(100);
  $(".mc-btn").show();
  $(".mc-btn-active").hide();
})
//切换视频对象
$("#remote-playerlist").on('click',function(e){
  let uid = $(e.target).attr('data-uid')
  if(uid){
    const player2 = $(`<div id="player-${uid}" class="player"></div>`)
    $(".other-box").text('')
    $(".other-box").attr('data-uid',uid)
    $(".other-box").append(player2);
    remoteUsers[uid].videoTrack.play(`player-${uid}`,{
      Properties:'contain'
    });
  }
})
//接听通话
$(".open-call").on('click',function(e){
  if(plus){
    let videoView = plus.webview.getWebviewById('videoView');
    videoView.loadURL("http://test.com?type=3")
  }
})
//拒绝通话
$(".close-call").on('click',function(e){
  if(plus){
    let videoView = plus.webview.getWebviewById('videoView');
    videoView.loadURL("http://test.com?type=4")
  }
})