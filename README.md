#2021/3/15
添加readme.md 文件
#2021/5/26
基本完成 音视频通话调试
通话基于声网 web SDK
禁麦 禁音 切换摄像头 基于 声网
点击最小化 最大化 基于 h5+ plus 操作webview 大小位置

#DEMO
var styles = {
        plusrequire:"ahead",
        width:'100%',
        height:'100%',
        background:'transparent',
        // animationAlphaBGColor:'#000000',
        top:'0',
        left:'0',
        backButtonAutoControl:'close'
    }
    //创建webview 当前没有 token 所以不会直接进入通话 如果需要直接进入通话 则需要传递完整参数
    var webview = plus.webview.create( `${CALL_WEBURL}?appid=${APPID}&channel=${callUsers.channelName}&token=&uid=${callUsers.calledUser}&type=${callUsers.type}`, 'videoView', styles, null );
    //显示
    webview.show()
    //添加地址监听
    webview.overrideUrlLoading({mode:'reject'},webviewUrlCallback)
    // 修改显示 webview 头像 昵称
    webview.evalJS('$(".btn-box3").show();$(".user-avatar").attr("src","'+avatar+'");$(".nickname").text("'+datas.callnickname+'");')
    //获取到token 后
    if(callUsers.type===2){ //视频通话
        videoView.evalJS('$("#token").val("'+datas.token+'");$("#join-form").submit();$(".btn-box3").hide();$(".btn-box2").show();$(".audio-auto").show();$(".call-status").text("开始计时");$(".user-avatar").hide();$(".nickname").hide();$(".switch-camera").show();$(".call-status").css("margin-top","200px");')
    }else{// 语音通话
        videoView.evalJS('$("#token").val("'+datas.token+'");$("#join-form").submit();$(".btn-box3").hide();$(".btn-box1").show();$(".mc-btn").show();$(".audio-auto").show();$(".call-status").text("开始计时");')
    }

    
/* 通话web拦截方法 */
function webviewUrlCallback(e){
    //根据参数的不同,做不同的操作!url中,把双引号用别的字符串替换.就OK了.再替换回来可以转json
    let callUsers = store.getters.getCallUsers
    console.log("房间名====="+callUsers.channelName)
    let webview = plus.webview.getWebviewById('videoView');
    console.log(e)
        let type = e.url.split("?")[1].split("=")[1]*1;// 获取地址参数
        if(type === 1){ // 更新token
            sendMessageBack({req:'test',channelName:callUsers.channelName},129).then(res=>{
                if(res.resp.errcode!==0){// 请求失败 提示错误信息
                    uni.showModal({
                        title: '提示',content:res.resp.errmsg,showCancel:false,
                        success: (e) => {
                            if (e.confirm) {
                                
                            }
                        }
                    })
                    return
                }
                var token = res.token
                webview.evalJS('document.querySelector(".test-input").value="'+token+'";test();');
            }).catch(err=>{
                console.log('获取token失败')
                console.log(err)
            })
        }else if(type === 2){ // 结束通话
            let userInfo = store.getters.getUserInfo
            let uid = callUsers.callUser
            if(userInfo.id===uid){
                uid = callUsers.calledUser
            }
            sendMessageBack({req:"test",userid:uid,channelName:callUsers.channelName},126).then(res=>{
                console.log('挂断成功')
            }).catch(err=>{
                console.log("挂断失败")
                console.log(err)
            })
        }else if(type === 3){// 接听通话
            sendMessageBack({req:"test",callId:callUsers.callUser,accept:true,channelName:callUsers.channelName},120).then(res=>{
                console.log('同意通话')
            }).catch(err=>{
                console.log("接受通话报错")
                console.log(err)
            })
        }else if(type === 4){// 拒绝通话
            sendMessageBack({req:"test",callId:callUsers.callUser,accept:false,channelName:callUsers.channelName},120).then(res=>{
                console.log('拒绝通话')
            }).catch(err=>{
                console.log("拒绝通话报错")
                console.log(err)
            })
        }else if(type === 5){// 对方没有接听主动挂断
            sendMessageBack({req:"test",answerId:callUsers.calledUser,channelName:callUsers.channelName},123).then(res=>{
                console.log('取消通话成功')
                webview.evalJS('$(".call-status").test("已取消")');
                setTimeout(()=>{
                    webview.close()
                },1000)
            }).catch(err=>{
                console.log("取消通话失败")
                console.log(err)
            })
        }else{
            console.log("webView 未知参数跳转")
        }
}