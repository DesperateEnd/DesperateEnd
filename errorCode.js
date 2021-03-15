const errCode = {
    //通用错误码
    UNEXPECTED_ERROR:"无法处理的、非预期的错误，通常这个错误会有具体的错误提示",
    UNEXPECTED_RESPONSE:"服务端返回了非预期的响应",
    INVALID_PARAMS:"非法参数",
    NOT_SUPPORTED:"浏览器不支持",
    INVALID_OPERATION:"非法操作，通常是因为在当前状态不能进行该操作",
    OPERATION_ABORTED:"操作中止，通常是因为网络质量差或连接断开导致与 Agora 服务器通信失败",
    WEB_SECURITY_RESTRICT:"浏览器安全策略限制",
    //请求相关错误码
    NETWORK_TIMEOUT:"请求超时，通常是因为网络质量差或连接断开导致与 Agora 服务器通信失败",
    NETWORK_RESPONSE_ERROR:"响应错误，一般是状态码非法",
    NETWORK_ERROR:"无法定位的网络错误",
    //设备相关 
    NOT_SUPPORTED:"使用的功能在当前浏览器上不支持",
    MEDIA_OPTION_INVALID: "指定的采集参数无法被满足，一般是因为设备不支持指定的分辨率或帧率",
    DEVICE_NOT_FOUND: "找不到指定的采集设备",
    PERMISSION_DENIED: "用户拒绝授予访问摄像头/麦克风的权限，或者屏幕共享选择共享源时，用户没有选择共享源，并关闭了选择窗口",
    CONSTRAINT_NOT_SATISFIED: "浏览器不支持指定的采集选项",
    SHARE_AUDIO_NOT_ALLOWED: "屏幕共享分享音频时用户没有勾选分享音频",
}
export function getErrType(code,type){
    if(!code){
        console.log('未知错误 = =！code='+code)
        //进行错误统计
        return
    }
    console.log(`错误：${code},提示：${errCode[code]}`)
    if(type==1){
        alert(errCode[code])
    }else{
        
    }
}