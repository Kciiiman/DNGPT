//原版
<template>
	<view class="chat">
    <!-- 顶部标题 -->
    <view class="topTabbar">
      <!-- 返回图标 -->
      <u-icon class="icon" name="arrow-left" size="20px" color="#000" @click="goback()"></u-icon>
      <!-- 标题 -->
    <view class="text">营养师</view>

    </view>
		<scroll-view  :style="{height: `${windowHeight-inputHeight - 180}rpx`}"
		id="scrollview"
		scroll-y="true" 
		:scroll-top="scrollTop"
		class="scroll-view"
		>
			<!-- 聊天主体 -->
			<view id="msglistview" class="chat-body">
				<!-- 聊天记录 -->
				<view v-for="(item,index) in msgList" :key="index">
					<!-- 自己发的消息 -->
					<view class="item self" v-if="item.userContent != ''" >
						<!-- 文字内容 -->
						<view class="content right">
						{{item.userContent}}
						</view>
						<!-- 头像 -->
						<image class="avatar" :src="item.image">
						</image>
					</view>
					<!-- 机器人发的消息 -->
					<view class="item Ai" v-if="item.botContent != ''">
						<!-- 头像 -->     
						<image class="avatar" :src="item.image">
						</image>
						<!-- 文字内容 -->
						<view class="content left">
							{{item.botContent}}
						</view>
					</view> 
				</view>
			</view>
		</scroll-view>
		<!-- 底部消息发送栏 -->
		<!-- 用来占位，防止聊天消息被发送框遮挡 -->
		<view class="chat-bottom" :style="{height: `${inputHeight}rpx`}">
			<view class="send-msg" :style="{bottom:`${keyboardHeight - 60}rpx`}">
			<image class="change-input-btn" :src="isVoiceInput ? '/static/image/麦克风-active.png' : '/static/image/麦克风.png'" @click="changeTo()"></image>
        <view v-show="!isVoiceInput" class="uni-textarea">
          <textarea v-model="chatMsg"
            maxlength="300"
            confirm-type="send"
            @confirm="sendAnswer"
            placeholder="输入你的回答~"
            :show-confirm-bar="false"
            :adjust-position="false" 
            @linechange="sendHeight"
            @focus="focus" @blur="blur"
           auto-height></textarea>
        </view>
				<button v-show="!isVoiceInput" @click="sendAnswer" class="send-btn">发送</button>
		</view>
		<!-- 语音输入按钮 -->
		<button v-show="isVoiceInput"
			class="voice-input-button"
			:class="{ active: isVoiceInputActive }" 
			@mousedown="sendAnswer"
			@touchstart="sendAnswer"
			@mouseup="endPress"
			@touchend="endPress">{{VoiceTitle}}</button>
		</view>
		
	</view>
</template>
<script>
	import data from '../../static/questionnaire.json'
	const recorderManager = uni.getRecorderManager();
	const fs = wx.getFileSystemManager();
	export default{
		data() {
			return {
				//api中使用的数据
				keywords: '',
				ttsOption:'',	//tts音频位置
				stt_text:'',	//stt文本
				questionIndex: 0,	//问题索引
				questions: data.questions,
				question:'',
				isVoiceInput: false,	//转换语音输入按钮
				isVoiceInputActive: false, // 语音按钮状态：初始状态为非按下状态
				VoiceTitle: "按住说话",
				voicePath: '', //说话录音存储
				svoicePath: '',
				isFirstSendQues: false,	//是否已经从问卷中提取问题:判断第一次
				isUserInput:false, 	//判断用户输出
				isSendingquestion:false,
				//键盘高度
				keyboardHeight:0,
				//底部消息发送高度
				bottomHeight: 0,
				//滚动距离
				scrollTop: 0,
				userId:'',
				//发送的消息
				chatMsg:"",
				msgList:[
					{
					    botContent: "你好啊，很高兴见到你，请问可以开始问卷回答了吗？",
					    userContent: "",
              image:"/static/image/机器人.png"
					},
					// {
					//     botContent: "",
					//     userContent: "你好呀，非常高兴认识你",
     //          image:"/static/image/用户.png"
					// },
				]	
			}
		},
		updated(){
			//页面更新时调用聊天消息定位到最底部
			this.scrollToBottom();
		},
		computed: {
			windowHeight() {
			    return this.rpxTopx(uni.getSystemInfoSync().windowHeight)
			},
			// 键盘弹起来的高度+发送框高度
			inputHeight(){
				return this.bottomHeight+this.keyboardHeight
			}
		},
		onLoad(){
        uni.onKeyboardHeightChange(res => {
				//这里正常来讲代码直接写
				//this.keyboardHeight=this.rpxTopx(res.height)就行了
				this.keyboardHeight = this.rpxTopx(res.height)
				if(this.keyboardHeight<0)this.keyboardHeight = 0;
			});
			//设置录音回调函数
			let self = this;
			recorderManager.onStop(function (res) {
				console.log('recorder stop' + JSON.stringify(res));
				self.voicePath = res.tempFilePath; 	
				let tempFilePath = res.tempFilePath;
				  wx.getFileSystemManager().saveFile({
				    tempFilePath: tempFilePath,
				    success: function(saveRes) {
				      console.log('文件保存成功', saveRes.savedFilePath);
				      // 将保存后的文件路径传递给后端
				      self.svoicePath = saveRes.savedFilePath;
					  self.submitFile();
					  self.stt();
				    },
				    fail: function(error) {
				      console.error('文件保存失败', error);
				    }
				  });
			});
		},
		onUnload(){
			// uni.offKeyboardHeightChange()
		},
		methods: {
			goback() {
				uni.switchTab({
				url: "/pages/index/index"
				})
			},
			focus(){
				this.scrollToBottom()
			},
			blur(){
				this.scrollToBottom()
			},
			// px转换成rpx
			rpxTopx(px){
				let deviceWidth = uni.getSystemInfoSync().windowWidth
				let rpx = ( 750 / deviceWidth ) * Number(px)
				return Math.floor(rpx)
			},
			// 监视聊天发送栏高度
			sendHeight(){
				setTimeout(()=>{
					let query = uni.createSelectorQuery();
					query.select('.send-msg').boundingClientRect()
					query.exec(res =>{
						this.bottomHeight = this.rpxTopx(res[0].height)
					})
				},10)
			},
			// 滚动至聊天底部
			scrollToBottom(e){
				setTimeout(()=>{
					let query = uni.createSelectorQuery().in(this);
					query.select('#scrollview').boundingClientRect();
					query.select('#msglistview').boundingClientRect();
					query.exec((res) =>{
						if(res[1].height > res[0].height){
							this.scrollTop = this.rpxTopx(res[1].height - res[0].height)
						}
					})
				},15)
			},
			
			// 发送消息(文字)
			async handleSend() {
				//如果消息不为空;文字发送
				if(this.chatMsg.trim().length > 0){
					this.isSendingquestion = true;
					let obj = {
						botContent: "",
						userContent: this.chatMsg,
						image:"/static/image/用户.png",
					}
					this.msgList.push(obj);
					if(this.isFirstSendQues)
					{
						this.keywords = await this.extractKeywords(this.chatMsg);
					}
					this.chatMsg = '';
					this.isUserInput = true;
					this.scrollToBottom();
					if(this.isUserInput == true){
						this.sendQuestion();
					}
				}
				else {
					uni.showToast({
						title: '请不要发送空消息...',
						image: '/static/image/空消息.png'
					});
				}
			},
			//提出问卷问题
			sendQuestion(){
				if(this.isUserInput == true)
				{
					this.extractJson();
					let obj = {
								botContent: this.question,
								userContent: "",
								image:"/static/image/机器人.png"
					}
					this.tts();
					setTimeout(() => {
						this.msgList.push(obj);
						},2000);
					this.scrollToBottom();
					this.isFirstSendQues = true;
				}
			},
			
			//发送回答消息
			sendAnswer(){
				if(!this.isSendingquestion){
					if(!this.isVoiceInput){
						this.handleSend();
					}
					else{
						this.startPress();
					}
				}
				else{
					uni.showToast({
						title: '正在输出问题，请等待...',
						image: '/static/image/等待.png'
					});
				}
				
			},
			
			//api函数汇总
			findQuestionById(id) {
			  const question = this.questions.find(q => q.id === id);
			  return question ? question.question : null;
			},
			//抽取问题
			extractJson() {
				if(this.questionIndex >= this.questions.length)
				{
					this.question = "问卷结束";
				}
				else
				{
				const questionId = this.questions[this.questionIndex].id;
				const foundQuestion = this.findQuestionById(questionId);
				this.question = foundQuestion;
				this.questionIndex++;
				console.log('Found question:', foundQuestion);
				}
			},
			extractKeywords (answer) {
			  // 调用后端接口提取关键词
				return new Promise((resolve, reject) =>{ 
					uni.request({
						url:'http://127.0.0.1:5000/extraction',
						data:{
							"question": answer
							},
						method:'POST',
						success: (res) => {
							console.log(res.data);
							resolve(res.data.extract)
						}
					})
				})
			},
			async tts() {
			    const currentQuestion = this.question;
	
				this.ttsOption = await this.ttsfuction(currentQuestion)
				console.log(this.ttsOption);
				this.playVoice(this.ttsOption);
			},
			
			ttsfuction(currentQuestion){
				return new Promise((resolve, reject) =>{ 
					uni.request({
						url: 'http://127.0.0.1:5000/tts',
						data: {
							"text": currentQuestion
						},
						method: 'POST',
						success: (res) => {
							resolve(res.data.path);
							console.log(res.data.path);
						},
						fail: (err) => {
							console.error(err);
							// 处理请求失败的情况
						}
					})
				})
			},
			
			playVoice(audiopath) {
				const innerAudioContext = uni.createInnerAudioContext();
				innerAudioContext.autoplay = true;
				innerAudioContext.obeyMuteSwitch = false;
				// 截取相对路径部分
				const relativePath = audiopath.substring(audiopath.lastIndexOf('static'));
				innerAudioContext.src = relativePath;
				
				innerAudioContext.onPlay(() => {
					console.log("开始播放");
				});
				innerAudioContext.onError((res) => {
					console.log(res.errMsg);
					console.log(res.errCode);
					innerAudioContext.destroy()
				});
				
				innerAudioContext.onStop(() => {
					console.log('i am onStop')
					innerAudioContext.stop()
					//播放停止，销毁该实例
					innerAudioContext.destroy()
				})
				innerAudioContext.onEnded(() => {
					console.log('i am onEnded')
					//播放结束，销毁该实例
					innerAudioContext.destroy()
					console.log('已执行destory()')
					this.isSendingquestion = false;
				})

			},
			async stt(){
				this.stt_text = await this.sttfuction()
				let obj = {
					botContent: "",
					userContent: this.stt_text,
					image:"/static/image/用户.png",
				}
				this.msgList.push(obj);
				if(this.isFirstSendQues)
				{
					this.keywords = await this.extractKeywords(this.stt_text);
				}
				this.chatMsg = '';
				this.isUserInput = true;
				this.scrollToBottom();
				if(this.isUserInput == true){
					this.sendQuestion();
				}
			},
			sttfuction(){
				 return new Promise((resolve, reject) => {	
					uni.request({
						url:'http://127.0.0.1:5000/stt',
						// data:{
						// 	"path": this.svoicePath
						// },
						method:'GET',
						success: (res) => {
							resolve(res.data.text);
							console.log(res.data.text);
						},
						fail: (err) => {
								console.error(err);
								// 处理请求失败的情况
						}
					})
				});
			},
			//录音上传
			submitFile() {
				let self = this;
				if (!self.svoicePath) {
					uni.showToast({
						title: '请录制后再提交',
						icon: 'none'
					})
					return;
				}
				uni.showLoading({
					title: '提交中'
				});
				uni.uploadFile({
					url: 'http://127.0.0.1:5000/voice', // 自己后台接收的接口
					filePath: self.svoicePath,
					name: 'file',
					formData: {},
					success: (res) => {
						uni.hideLoading();
						uni.showToast({
							title: '上传成功',
							icon: 'none'
						});
					},
					fail: (err) => {
						uni.hideLoading();
						uni.showToast({
							title: '上传失败',
							icon: 'none'
						})
					}
				});
			},
			changeTo(){
				this.isVoiceInput = !this.isVoiceInput;
			},
			startPress() {
				this.isSendingquestion = true;
				this.isVoiceInputActive = true;
				this.VoiceTitle = "说话中...";
				console.log('开始录音');
				recorderManager.start({
				  format: 'wav',
				  duration: 60000, // 录音最长时长，单位毫秒
				  sampleRate: 44100, // 采样率，44.1kHz是音频CD标准
				  numberOfChannels: 2, // 录音通道数，2为立体声，1为单声道
				  encodeBitRate: 192000, // 编码码率，wav 格式需设置
				});
			},
			endPress() {
				this.isVoiceInputActive = false;
				this.VoiceTitle = "按住说话";
				console.log('录音结束');
				recorderManager.stop();
			},
			//保存数据
			dataSave(){

			},
			//取用数据
			dataGet(){
				
			}
			// playVoice02() {
			// 	console.log('播放录音');

			// 	if (this.voicePath) {
			// 		innerAudioContext.src = this.voicePath;
			// 		innerAudioContext.play();
			// 	}
			// },
		}
	}
</script>

<style lang="scss" scoped>
	
	$chatContentbgc: #C2DCFF;
	$sendBtnbgc: #e6ffe7;
	
	view,button,text,input,textarea {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}
 
	/* 聊天消息 */
	.chat {
     .topTabbar {
          width: 100%;
          height: 90rpx;
          line-height: 90rpx;
          display: flex;
          margin-top: 80rpx;
          justify-content: space-between;
      
          .icon {
            margin-left: 20rpx;
          }
      
          .text {
            margin: auto;
            font-size: 16px;
            font-weight: 700;
          }
      
          .button {
            width: 10%;
            margin: auto 20rpx auto 0rpx;
          }
        }
		.scroll-view {
			::-webkit-scrollbar {
					    display: none;
					    width: 0 !important;
					    height: 0 !important;
					    -webkit-appearance: none;
					    background: transparent;
					    color: transparent;
					  }
			
			// background-color: orange;
			background-color: #F6F6F6;
			
			.chat-body {
				display: flex;
				flex-direction: column;
				padding-top: 23rpx;
				// background-color:skyblue;
				
				.self {
					justify-content: flex-end;
				}
				.item {
					display: flex;
					padding: 23rpx 30rpx;
					// background-color: greenyellow;
 
					.right {
						background-color: $chatContentbgc;
					}
					.left {
						background-color: #FFFFFF;
					}
                    // 聊天消息的三角形
					.right::after {
						position: absolute;
						display: inline-block;
						content: '';
						width: 0;
						height: 0;
						left: 100%;
						top: 10px;
						border: 12rpx solid transparent;
						border-left: 12rpx solid $chatContentbgc;
					}
 
					.left::after {
						position: absolute;
						display: inline-block;
						content: '';
						width: 0;
						height: 0;
						top: 10px;
						right: 100%;
						border: 12rpx solid transparent;
						border-right: 12rpx solid #FFFFFF;
					}
 
					.content {
						position: relative;
						max-width: 486rpx;
						border-radius: 8rpx;
						word-wrap: break-word;
						padding: 24rpx 24rpx;
						margin: 0 24rpx;
						border-radius: 5px;
						font-size: 32rpx;
						font-family: PingFang SC;
						font-weight: 500;
						color: #333333;
						line-height: 42rpx;
					}
 
					.avatar {
						display: flex;
						justify-content: center;
						width: 78rpx;
						height: 78rpx;
						background: $sendBtnbgc;
						border-radius: 50rpx;
						overflow: hidden;
						
						image {
							align-self: center;
						}
 
					}
				}
			}
		}
 
		/* 底部聊天发送栏 */
		.chat-bottom {
			width: 100%;
			height: 100rpx;
			background: #F4F5F7;
			transition: all 0.1s ease;
			
			.send-msg {
				display: flex;
				align-items: flex-end;
				padding: 16rpx 30rpx;
				width: 100%;
				min-height: 177rpx;
				position: fixed;
				bottom: 0;
				background: #fff;
				transition: all 0.1s ease;
			}
 
			.uni-textarea {
				padding-bottom: 70rpx;  
				textarea {
					width: 475rpx;
					min-height: 75rpx;
					max-height: 500rpx;
					background: #f1f1f1;
					border-radius: 40rpx;
					font-family: PingFang SC;
					color: #333333;
					line-height: 74rpx;
					padding: 5rpx 8rpx;
          text-indent: 30rpx;
				}
			}
            
			.send-btn {
				display: flex;
				align-items: center;
				justify-content: center;
				margin-bottom: 76rpx;
				margin-left: 25rpx;
				width: 120rpx;
				height: 75rpx;
				background: #ed5a65;
				border-radius: 50rpx;
				font-size: 28rpx;
				font-family: PingFang SC;
				font-weight: 500;
				color: #FFFFFF;
				line-height: 28rpx;
			}
		
			//转换输入
			.change-input-btn {
				align-items: center;
				justify-content: center;
				margin-bottom: 76rpx;
				width: 75rpx;
				height: 75rpx;
				background: #d3d3d3;
				border-radius: 50rpx;
			}
			
			.voice-input-button {
				display: flex;
				position: absolute;
				margin-left: 150rpx;
				magin-bottom: 76rpx;
				left: 10px;
				bottom: 15px;
				z-index: 1; /* 确保在其他元素上面显示 */
				width: 500rpx; /* 与输入框宽度保持一致 */
				height: 75rpx; /* 与输入框高度保持一致 */
				line-height: 75rpx; /* 使文字垂直居中 */
				text-indent: 100rpx;	//文字水平居中
				background-color: #c3c3c3;
				color: #fff;
				text-align: center;
				border-radius: 40rpx; /* 与输入框一致的圆角 */
				cursor: pointer;
			}
			
			.voice-input-button.active {
				display: flex;
				position: absolute;
				margin-left: 150rpx;
				magin-bottom: 76rpx;
				left: 10px;
				bottom: 15px;
				z-index: 1; /* 确保在其他元素上面显示 */
				width: 500rpx; /* 与输入框宽度保持一致 */
				height: 75rpx; /* 与输入框高度保持一致 */
				line-height: 75rpx; /* 使文字垂直居中 */
				text-indent: 100rpx;	//文字水平居中
				background-color: #00ff00;
				color: #fff;
				text-align: center;
				border-radius: 40rpx; /* 与输入框一致的圆角 */
				cursor: pointer;
			}
		}
	}
</style>