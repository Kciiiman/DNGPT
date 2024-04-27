"use strict";
const common_vendor = require("../../common/vendor.js");
const questionnaire = require("../../questionnaire.js");
const recorderManager = common_vendor.index.getRecorderManager();
common_vendor.wx$1.getFileSystemManager();
const _sfc_main = {
  data() {
    return {
      //api中使用的数据
      keywords: "",
      ttsOption: "",
      //tts音频位置
      stt_text: "",
      //stt文本
      questionIndex: 0,
      //问题索引
      questions: questionnaire.data.questions,
      question: "",
      isVoiceInput: false,
      //转换语音输入按钮
      isVoiceInputActive: false,
      // 语音按钮状态：初始状态为非按下状态
      VoiceTitle: "按住说话",
      voicePath: "",
      //说话录音存储
      svoicePath: "",
      recordTime: 0,
      //录音时长
      isRecordCancel: false,
      //是否取消发送
      isFirstSendQues: false,
      //是否已经从问卷中提取问题:判断第一次
      isUserInput: false,
      //判断用户输出
      isSendingquestion: false,
      //键盘高度
      keyboardHeight: 0,
      //底部消息发送高度
      bottomHeight: 0,
      //滚动距离
      scrollTop: 0,
      userId: "",
      //发送的消息
      chatMsg: "",
      msgList: [
        {
          botContent: "你好啊，很高兴见到你，请问可以开始问卷回答了吗？",
          userContent: "",
          image: "/static/image/机器人.png"
        }
        // {
        //     botContent: "",
        //     userContent: "你好呀，非常高兴认识你",
        //          image:"/static/image/用户.png"
        // },
      ]
    };
  },
  updated() {
    this.scrollToBottom();
  },
  computed: {
    windowHeight() {
      return this.rpxTopx(common_vendor.index.getSystemInfoSync().windowHeight);
    },
    // 键盘弹起来的高度+发送框高度
    inputHeight() {
      return this.bottomHeight + this.keyboardHeight;
    }
  },
  onLoad() {
    common_vendor.index.onKeyboardHeightChange((res) => {
      this.keyboardHeight = this.rpxTopx(res.height);
      if (this.keyboardHeight < 0)
        this.keyboardHeight = 0;
    });
  },
  onUnload() {
  },
  mounted() {
    let self = this;
    recorderManager.onStart((_) => {
      self.recordTime = 0;
      console.log("录音时长: ", self.recordTime);
      self.recordTimer = setInterval((_2) => {
        self.recordTime++;
      }, 1e3);
    });
    recorderManager.onStop(function(res) {
      if (self.recordTimer) {
        clearInterval(self.recordTimer);
        self.recordTimer = null;
      }
      console.log("录音时长2: ", self.recordTime);
      if (self.recordTime < 2) {
        common_vendor.index.showToast({
          title: "说话时间太短!",
          image: "/static/image/哭脸.png",
          mask: true
        });
        self.isRecordCancel = true;
      }
      if (!self.isRecordCancel) {
        self.isSendingquestion = true;
        console.log("recorder stop" + JSON.stringify(res));
        self.voicePath = res.tempFilePath;
        let tempFilePath = res.tempFilePath;
        common_vendor.wx$1.getFileSystemManager().saveFile({
          tempFilePath,
          success: function(saveRes) {
            console.log("文件保存成功", saveRes.savedFilePath);
            self.svoicePath = saveRes.savedFilePath;
            self.submitFile();
            self.stt();
          },
          fail: function(error) {
            console.error("文件保存失败", error);
          }
        });
      }
    });
  },
  methods: {
    goback() {
      common_vendor.index.switchTab({
        url: "/pages/index/index"
      });
    },
    focus() {
      this.scrollToBottom();
    },
    blur() {
      this.scrollToBottom();
    },
    // px转换成rpx
    rpxTopx(px) {
      let deviceWidth = common_vendor.index.getSystemInfoSync().windowWidth;
      let rpx = 750 / deviceWidth * Number(px);
      return Math.floor(rpx);
    },
    // 监视聊天发送栏高度
    sendHeight() {
      setTimeout(() => {
        let query = common_vendor.index.createSelectorQuery();
        query.select(".send-msg").boundingClientRect();
        query.exec((res) => {
          this.bottomHeight = this.rpxTopx(res[0].height);
        });
      }, 10);
    },
    // 滚动至聊天底部
    scrollToBottom(e) {
      setTimeout(() => {
        let query = common_vendor.index.createSelectorQuery().in(this);
        query.select("#scrollview").boundingClientRect();
        query.select("#msglistview").boundingClientRect();
        query.exec((res) => {
          if (res[1].height > res[0].height) {
            this.scrollTop = this.rpxTopx(res[1].height - res[0].height);
          }
        });
      }, 15);
    },
    // 发送消息(文字)
    async handleSend() {
      if (this.chatMsg.trim().length > 0) {
        this.isSendingquestion = true;
        let obj = {
          botContent: "",
          userContent: this.chatMsg,
          image: "/static/image/用户.png"
        };
        this.msgList.push(obj);
        if (this.isFirstSendQues) {
          this.keywords = await this.extractKeywords(this.chatMsg);
        }
        this.chatMsg = "";
        this.isUserInput = true;
        this.scrollToBottom();
        if (this.isUserInput == true) {
          this.sendQuestion();
        }
      } else {
        common_vendor.index.showToast({
          title: "请不要发送空消息...",
          image: "/static/image/空消息.png"
        });
      }
    },
    //提出问卷问题
    sendQuestion() {
      if (this.isUserInput == true) {
        this.extractJson();
        let obj = {
          botContent: this.question,
          userContent: "",
          image: "/static/image/机器人.png"
        };
        this.tts();
        setTimeout(() => {
          this.msgList.push(obj);
        }, 2e3);
        this.scrollToBottom();
        this.isFirstSendQues = true;
      }
    },
    //发送回答消息
    sendAnswer() {
      if (!this.isSendingquestion) {
        if (!this.isVoiceInput) {
          this.handleSend();
        } else {
          this.startPress();
        }
      } else {
        common_vendor.index.showToast({
          title: "正在输出问题，请等待...",
          image: "/static/image/等待.png"
        });
      }
    },
    //api函数汇总
    findQuestionById(id) {
      const question = this.questions.find((q) => q.id === id);
      return question ? question.question : null;
    },
    //抽取问题
    extractJson() {
      if (this.questionIndex >= this.questions.length) {
        this.question = "问卷结束";
      } else {
        const questionId = this.questions[this.questionIndex].id;
        const foundQuestion = this.findQuestionById(questionId);
        this.question = foundQuestion;
        this.questionIndex++;
        console.log("Found question:", foundQuestion);
      }
    },
    extractKeywords(answer) {
      return new Promise((resolve, reject) => {
        common_vendor.index.request({
          url: "http://127.0.0.1:5000/extraction",
          data: {
            "question": answer
          },
          method: "POST",
          success: (res) => {
            console.log(res.data);
            resolve(res.data.extract);
          }
        });
      });
    },
    async tts() {
      const currentQuestion = this.question;
      this.ttsOption = await this.ttsfuction(currentQuestion);
      console.log(this.ttsOption);
      this.playVoice(this.ttsOption);
    },
    ttsfuction(currentQuestion) {
      return new Promise((resolve, reject) => {
        common_vendor.index.request({
          url: "http://127.0.0.1:5000/tts",
          data: {
            "text": currentQuestion
          },
          method: "POST",
          success: (res) => {
            resolve(res.data.path);
            console.log(res.data.path);
          },
          fail: (err) => {
            console.error(err);
          }
        });
      });
    },
    playVoice(audiopath) {
      const innerAudioContext = common_vendor.index.createInnerAudioContext();
      innerAudioContext.autoplay = true;
      innerAudioContext.obeyMuteSwitch = false;
      const relativePath = audiopath.substring(audiopath.lastIndexOf("static"));
      innerAudioContext.src = relativePath;
      innerAudioContext.onPlay(() => {
        console.log("开始播放");
      });
      innerAudioContext.onError((res) => {
        console.log(res.errMsg);
        console.log(res.errCode);
        innerAudioContext.destroy();
      });
      innerAudioContext.onStop(() => {
        console.log("i am onStop");
        innerAudioContext.stop();
        innerAudioContext.destroy();
      });
      innerAudioContext.onEnded(() => {
        console.log("i am onEnded");
        innerAudioContext.destroy();
        console.log("已执行destory()");
        this.isSendingquestion = false;
      });
    },
    async stt() {
      this.stt_text = await this.sttfuction();
      let obj = {
        botContent: "",
        userContent: this.stt_text,
        image: "/static/image/用户.png"
      };
      this.msgList.push(obj);
      if (this.isFirstSendQues) {
        this.keywords = await this.extractKeywords(this.stt_text);
      }
      this.chatMsg = "";
      this.isUserInput = true;
      this.scrollToBottom();
      if (this.isUserInput == true) {
        this.sendQuestion();
      }
    },
    sttfuction() {
      return new Promise((resolve, reject) => {
        common_vendor.index.request({
          url: "http://127.0.0.1:5000/stt",
          // data:{
          // 	"path": this.svoicePath
          // },
          method: "GET",
          success: (res) => {
            resolve(res.data.text);
            console.log(res.data.text);
          },
          fail: (err) => {
            console.error(err);
          }
        });
      });
    },
    //录音上传
    submitFile() {
      let self = this;
      if (!self.svoicePath) {
        common_vendor.index.showToast({
          title: "请录制后再提交",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "提交中"
      });
      common_vendor.index.uploadFile({
        url: "http://127.0.0.1:5000/voice",
        // 自己后台接收的接口
        filePath: self.svoicePath,
        name: "file",
        formData: {},
        success: (res) => {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "上传成功",
            icon: "none"
          });
        },
        fail: (err) => {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "上传失败",
            icon: "none"
          });
        }
      });
    },
    changeTo() {
      this.isVoiceInput = !this.isVoiceInput;
    },
    startPress() {
      this.isVoiceInputActive = true;
      this.VoiceTitle = "说话中...";
      console.log("开始录音");
      recorderManager.start({
        format: "wav",
        duration: 6e4,
        // 录音最长时长，单位毫秒
        sampleRate: 44100,
        // 采样率，44.1kHz是音频CD标准
        numberOfChannels: 2,
        // 录音通道数，2为立体声，1为单声道
        encodeBitRate: 192e3
        // 编码码率，wav 格式需设置
      });
    },
    endPress() {
      this.isRecordCancel = false;
      this.isVoiceInputActive = false;
      this.VoiceTitle = "按住说话";
      console.log("录音结束");
      recorderManager.stop();
    }
    // playVoice02() {
    // 	console.log('播放录音');
    // 	if (this.voicePath) {
    // 		innerAudioContext.src = this.voicePath;
    // 		innerAudioContext.play();
    // 	}
    // },
  }
};
if (!Array) {
  const _component_u_icon = common_vendor.resolveComponent("u-icon");
  _component_u_icon();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o(($event) => $options.goback()),
    b: common_vendor.p({
      name: "arrow-left",
      size: "20px",
      color: "#000"
    }),
    c: common_vendor.f($data.msgList, (item, index, i0) => {
      return common_vendor.e({
        a: item.userContent != ""
      }, item.userContent != "" ? {
        b: common_vendor.t(item.userContent),
        c: item.image
      } : {}, {
        d: item.botContent != ""
      }, item.botContent != "" ? {
        e: item.image,
        f: common_vendor.t(item.botContent)
      } : {}, {
        g: index
      });
    }),
    d: `${$options.windowHeight - $options.inputHeight - 180}rpx`,
    e: $data.scrollTop,
    f: $data.isVoiceInput ? "/static/image/麦克风-active.png" : "/static/image/麦克风.png",
    g: common_vendor.o(($event) => $options.changeTo()),
    h: common_vendor.o((...args) => $options.sendAnswer && $options.sendAnswer(...args)),
    i: common_vendor.o((...args) => $options.sendHeight && $options.sendHeight(...args)),
    j: common_vendor.o((...args) => $options.focus && $options.focus(...args)),
    k: common_vendor.o((...args) => $options.blur && $options.blur(...args)),
    l: $data.chatMsg,
    m: common_vendor.o(($event) => $data.chatMsg = $event.detail.value),
    n: !$data.isVoiceInput,
    o: !$data.isVoiceInput,
    p: common_vendor.o((...args) => $options.sendAnswer && $options.sendAnswer(...args)),
    q: `${$data.keyboardHeight - 60}rpx`,
    r: common_vendor.t($data.VoiceTitle),
    s: $data.isVoiceInput,
    t: $data.isVoiceInputActive ? 1 : "",
    v: common_vendor.o((...args) => $options.sendAnswer && $options.sendAnswer(...args)),
    w: common_vendor.o((...args) => $options.sendAnswer && $options.sendAnswer(...args)),
    x: common_vendor.o((...args) => $options.endPress && $options.endPress(...args)),
    y: common_vendor.o((...args) => $options.endPress && $options.endPress(...args)),
    z: `${$options.inputHeight}rpx`
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-51a7cd0a"], ["__file", "C:/Users/1/Documents/HBuilderProjects/Diet_Nutrition_GPT/uni_ym/pages/test/test2.vue"]]);
wx.createPage(MiniProgramPage);
