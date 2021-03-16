import {getErrType} from './errorCode.js'
// create Agora client 创建实例
var client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

var localTracks = {
  videoTrack: null,
  audioTrack: null
};
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
  options.token = urlParams.get("token");
  if (options.appid && options.channel) {
    $("#appid").val(options.appid);
    $("#token").val(options.token);
    $("#channel").val(options.channel);
    $("#join-form").submit();
  }
})
$("#appid").val('62241f80635f4ff2993adf7974fb2937');
$("#token").val('00662241f80635f4ff2993adf7974fb2937IACi59bDbcE0NGPhvAMPtCePx94mNQa9XhU0WML3IZdlXAx+f9gAAAAAEAAdwi3RQGVRYAEAAQA/ZVFg');
$("#channel").val('test');
//加入房间按钮 点击事件
$("#join-form").submit(async function (e) {
  e.preventDefault();
  $("#join").attr("disabled", true);
  try {
    options.appid = $("#appid").val();
    options.token = $("#token").val();
    options.channel = $("#channel").val();
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
    if(options.token) {
      $("#success-alert-with-token").css("display", "block");
    } else {
      $("#success-alert a").attr("href", `index.html?appid=${options.appid}&channel=${options.channel}&token=${options.token}`);
      $("#success-alert").css("display", "block");
    }
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
//加入通话事件
async function join() {
  
  // add event listener to play remote tracks when remote user publishs.
  //监听人员加入事件
  client.on("user-published", handleUserPublished);
  //监听人员退出事件
  client.on("user-unpublished", handleUserUnpublished);

  // join a channel and create local tracks, we can use Promise.all to run them concurrently
  [ options.uid, localTracks.audioTrack, localTracks.videoTrack ] = await Promise.all([
    // join the channel
    //加入房间 返回uid
    client.join(options.appid, options.channel, options.token || null),
    // create local tracks, using microphone and camera
    //创建音频轨道对象 返回音频实例
    AgoraRTC.createMicrophoneAudioTrack(),
    //创建视频轨道对象 返回视频实例
    AgoraRTC.createCameraVideoTrack()
  ]);
  
  // play local video track 播放视频
  localTracks.videoTrack.play("local-player");
  //显示 视频id
  $("#local-player-name").text(`localVideo(${options.uid})`);

  // publish local tracks to channel 发布本地音视频轨道
  await client.publish(Object.values(localTracks));
  console.log("publish success");
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
 console.log('test')
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
}
// 创建dom
async function subscribe(user, mediaType) {
  const uid = user.uid;
  // subscribe to a remote user
  await client.subscribe(user, mediaType);
  console.log("subscribe success");
  if (mediaType === 'video') {//视频
    const player = $(`
      <div id="player-wrapper-${uid}">
        <p class="player-name">remoteUser(${uid})</p>
        <div id="player-${uid}" class="player"></div>
      </div>
    `);
    $("#remote-playerlist").append(player);
    user.videoTrack.play(`player-${uid}`);
  }
  if (mediaType === 'audio') {//音频
    user.audioTrack.play();
  }
}
//人员加入房间回调
function handleUserPublished(user, mediaType) {
  const id = user.uid;
  remoteUsers[id] = user;
  subscribe(user, mediaType);
}
//人员退出回调
function handleUserUnpublished(user) {
  const id = user.uid;
  delete remoteUsers[id];
  $(`#player-wrapper-${id}`).remove();
}
async function switchVideo(id){
   // 切换摄像头。
localTracks.videoTrack.setDevice(id).then(() => {
  console.log("set device success");
  alert('切换成功')
}).catch(e => {
  alert(`切换失败：${e.code}`)
  console.log("set device error", e);
});
}
//点击切换摄像头
$("#switch").click(function(){
  console.log(AgoraRTC)
  //获取设备id
  AgoraRTC.getDevices().then(devices=>{
    
    console.log(devices,localTracks.videoTrack)
    switchVideo(devices[2].deviceId)
    
    
  }).catch(e => {
    console.log("get devices error!", e);
  });
  
})
				
document.addEventListener("plusready", function(){
	//扩展API加载完成事
  alert('plusapi加载完毕')
  plus.device.getInfo({
    success:(res)=>{
      alert('获取成功'+JSON.stringify(res))
    },
    fail:(err)=>{
      alert('获取失败')
    }
  })
}, false);
alert(plus)