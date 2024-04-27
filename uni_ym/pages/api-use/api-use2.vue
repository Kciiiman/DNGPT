<template>
	<view>
		<button @tap="startRecord">开始录音</button>
		<button @tap="endRecord">停止录音</button>
		<button @tap="playVoice">播放录音</button>
	</view>
</template>
<script>
	const recorderManager = uni.getRecorderManager();
	const innerAudioContext = uni.createInnerAudioContext();
	innerAudioContext.autoplay = true;
	var _this;
	
	export default {
		data() {
			return {
				voicePath: '',
				text: '',
			}
		},
		onLoad() {
			let self = this;
			recorderManager.onStop(function(res) {
				console.log('recorder stop' + JSON.stringify(res));
				let tempFilePath = res.tempFilePath;	
				wx.getFileSystemManager().saveFile({
				  tempFilePath: tempFilePath,
				  success: function(saveRes) {
				    console.log('文件保存成功', saveRes.savedFilePath);
				    // 将保存后的文件路径传递给后端
				    self.voicePath = saveRes.savedFilePath;
					self.stt_api();
				  },
				});
			});
		},
		methods: {
			startRecord() {
				console.log('开始录音');
				recorderManager.start({
				  format: 'wav',
				  duration: 60000, // 录音最长时长，单位毫秒
				  sampleRate: 44100, // 采样率，44.1kHz是音频CD标准
				  numberOfChannels: 2, // 录音通道数，2为立体声，1为单声道
				  encodeBitRate: 192000, // 编码码率，wav 格式需设置
				});
			},
			endRecord() {
				console.log('录音结束');
				recorderManager.stop();
			},
			playVoice() {
				console.log('播放录音');

				if (this.voicePath) {
					innerAudioContext.src = this.voicePath;
					innerAudioContext.play();
				}
			},
			stt_api(){
				let self = this;
				uni.uploadFile({
					url: 'http://127.0.0.1:5000/stt_api', // 自己后台接收的接口
					filePath: self.voicePath,
					name: 'file',
					formData: {},
					success: (res) => {
						console.log(res);
					},
					fail: (err) => {
						uni.hideLoading();
						uni.showToast({
							title: '上传失败',
							icon: 'none'
						})
					}
				});
			}
		}
	}
</script>

<style>
</style>
