<template>
	<view>
		<view>
			<button @click="extractKeywords">提取关键词</button>
		</view>
		<view>
			提取到的关键字：
		</view>
		<view>
			{{keywords}}
		</view>
	</view>
	<view>
		<view>
			<button @click="tts">文本转语音</button>
		</view>
		<view>
			语音结果地址是：
		</view>
		<view>
			{{ttsOption}}
			<button @click="playVoice">播放录音</button>
		</view>
	</view>
	<view>
		<view>
			<button @click="stt">语音转文本</button>
		</view>
		<view>
			文本是：
		</view>
		<view>
			{{stt_text}}
		</view>
	</view>
</template>

<script>
	const innerAudioContext = uni.createInnerAudioContext();
	export default {
	  data () {
	    return {
	      keywords: '',
		  ttsOption:'',
		  stt_text:''
	    }
	  },
	  methods: {
	    extractKeywords () {
	      // 调用后端接口提取关键词
			uni.request({
				url:'http://127.0.0.1:5000/extraction',
				data:{
					"question": "一般来说，我一年要吃一百碗米饭。"
					},
				method:'POST',
				success: (res) => {
					console.log(res.data);
					this.keywords = res.data.extract;
				}
			})
	    },
		tts(){
			uni.request({
				url:'http://127.0.0.1:5000/tts',
				data:{
					"text": "今天真是个不错的日子，下着大雨！！！"
				},
				method:'POST',
				success: (res) => {
					console.log(res.data);
					this.ttsOption = res.data.path;
				}
			})
		},
		stt(){
			uni.request({
				url:'http://127.0.0.1:5000/stt',
				data:{
					"path": "C:\\Users\\1\\Documents\\HBuilderProjects\\Diet Nutrition GPT\\static\\stt_voice\\test.wav"
				},
				method:'POST',
				success: (res) => {
					console.log(res.data);
					this.stt_text = res.data.text;
				}
			})
		},
		playVoice() {
				innerAudioContext.autoplay = true;
				innerAudioContext.src = '/static/tts_voice/outout.wav';
				innerAudioContext.obeyMuteSwitch = false;
				innerAudioContext.onPlay(() => {
				  console.log('开始播放');
				});
		}
	  }
	}
</script>

<style>
</style>