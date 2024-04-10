
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
			语音结果地址是：{{ttsOption}}
		</view>
		<view>
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
	<view>
		<button @click="extractJson">提取json文件信息:</button>
		<view>{{question}}</view>
	</view>
	<view>
		<view>
				<button @tap="startRecord">开始录音</button>
				<button @tap="endRecord">停止录音</button>
				<button @tap="playVoice">播放录音</button>
		</view>
	</view>
</template>

<script>
	import data from '../../static/questionnaire.json'
	const innerAudioContext = uni.createInnerAudioContext();
	const recorderManager = uni.getRecorderManager();
	export default {
	  data () {
	    return {
			keywords: '',
			ttsOption:'',
			stt_text:'',
			questions: data.questions,
			question:'',
			voicePath: ''
	    }
	  },
	  	onLoad() {
	  		let self = this;
	  		recorderManager.onStop(function (res) {
	  			console.log('recorder stop' + JSON.stringify(res));
	  			self.voicePath = res.tempFilePath;
	  		});
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
					"path": "C:\\Users\\1\\Documents\\HBuilderProjects\\Diet_Nutrition_GPT\\static\\stt_voice\\test.wav"
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
				 console.log('1');
				innerAudioContext.src = 'static/tts_voice/output.wav';
				 console.log('2');
				innerAudioContext.obeyMuteSwitch = false;
				innerAudioContext.onPlay(() => {
				  console.log('开始播放');
				});

		},
		findQuestionById(id) {
		  const question = this.questions.find(q => q.id === id);
		  return question ? question.question : null;
		},
		extractJson() {
			const randomIndex = Math.floor(Math.random() * this.questions.length);
			const questionId = this.questions[randomIndex].id;
			const foundQuestion = this.findQuestionById(questionId);
			this.question = foundQuestion;
			console.log('Found question:', foundQuestion);
		},
		startRecord() {
			console.log('开始录音');

			recorderManager.start();
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
		}
	  }
	}
</script>

<style>
</style>