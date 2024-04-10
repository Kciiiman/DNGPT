"use strict";
const common_vendor = require("../../common/vendor.js");
const questionnaire = require("../../questionnaire.js");
const innerAudioContext = common_vendor.index.createInnerAudioContext();
const recorderManager = common_vendor.index.getRecorderManager();
const _sfc_main = {
  data() {
    return {
      keywords: "",
      ttsOption: "",
      stt_text: "",
      questions: questionnaire.data.questions,
      question: "",
      voicePath: ""
    };
  },
  onLoad() {
    let self = this;
    recorderManager.onStop(function(res) {
      console.log("recorder stop" + JSON.stringify(res));
      self.voicePath = res.tempFilePath;
    });
  },
  methods: {
    extractKeywords() {
      common_vendor.index.request({
        url: "http://127.0.0.1:5000/extraction",
        data: {
          "question": "一般来说，我一年要吃一百碗米饭。"
        },
        method: "POST",
        success: (res) => {
          console.log(res.data);
          this.keywords = res.data.extract;
        }
      });
    },
    tts() {
      common_vendor.index.request({
        url: "http://127.0.0.1:5000/tts",
        data: {
          "text": "今天真是个不错的日子，下着大雨！！！"
        },
        method: "POST",
        success: (res) => {
          console.log(res.data);
          this.ttsOption = res.data.path;
        }
      });
    },
    stt() {
      common_vendor.index.request({
        url: "http://127.0.0.1:5000/stt",
        data: {
          "path": "C:\\Users\\1\\Documents\\HBuilderProjects\\Diet_Nutrition_GPT\\static\\stt_voice\\test.wav"
        },
        method: "POST",
        success: (res) => {
          console.log(res.data);
          this.stt_text = res.data.text;
        }
      });
    },
    playVoice() {
      innerAudioContext.autoplay = true;
      console.log("1");
      innerAudioContext.src = "static/tts_voice/output.wav";
      console.log("2");
      innerAudioContext.obeyMuteSwitch = false;
      innerAudioContext.onPlay(() => {
        console.log("开始播放");
      });
    },
    findQuestionById(id) {
      const question = this.questions.find((q) => q.id === id);
      return question ? question.question : null;
    },
    extractJson() {
      const randomIndex = Math.floor(Math.random() * this.questions.length);
      const questionId = this.questions[randomIndex].id;
      const foundQuestion = this.findQuestionById(questionId);
      this.question = foundQuestion;
      console.log("Found question:", foundQuestion);
    },
    startRecord() {
      console.log("开始录音");
      recorderManager.start();
    },
    endRecord() {
      console.log("录音结束");
      recorderManager.stop();
    },
    playVoice() {
      console.log("播放录音");
      if (this.voicePath) {
        innerAudioContext.src = this.voicePath;
        innerAudioContext.play();
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.extractKeywords && $options.extractKeywords(...args)),
    b: common_vendor.t($data.keywords),
    c: common_vendor.o((...args) => $options.tts && $options.tts(...args)),
    d: common_vendor.t($data.ttsOption),
    e: common_vendor.o((...args) => $options.playVoice && $options.playVoice(...args)),
    f: common_vendor.o((...args) => $options.stt && $options.stt(...args)),
    g: common_vendor.t($data.stt_text),
    h: common_vendor.o((...args) => $options.extractJson && $options.extractJson(...args)),
    i: common_vendor.t($data.question),
    j: common_vendor.o((...args) => $options.startRecord && $options.startRecord(...args)),
    k: common_vendor.o((...args) => $options.endRecord && $options.endRecord(...args)),
    l: common_vendor.o((...args) => $options.playVoice && $options.playVoice(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "C:/Users/1/Documents/HBuilderProjects/Diet_Nutrition_GPT/uni_ym/pages/api-use/api-use.vue"]]);
wx.createPage(MiniProgramPage);
