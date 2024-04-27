"use strict";
const common_vendor = require("../../common/vendor.js");
const recorderManager = common_vendor.index.getRecorderManager();
const innerAudioContext = common_vendor.index.createInnerAudioContext();
innerAudioContext.autoplay = true;
const _sfc_main = {
  data() {
    return {
      voicePath: "",
      text: ""
    };
  },
  onLoad() {
    let self = this;
    recorderManager.onStop(function(res) {
      console.log("recorder stop" + JSON.stringify(res));
      let tempFilePath = res.tempFilePath;
      common_vendor.wx$1.getFileSystemManager().saveFile({
        tempFilePath,
        success: function(saveRes) {
          console.log("文件保存成功", saveRes.savedFilePath);
          self.voicePath = saveRes.savedFilePath;
          self.stt_api();
        }
      });
    });
  },
  methods: {
    startRecord() {
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
    },
    stt_api() {
      let self = this;
      common_vendor.index.uploadFile({
        url: "http://127.0.0.1:5000/stt_api",
        // 自己后台接收的接口
        filePath: self.voicePath,
        name: "file",
        formData: {},
        success: (res) => {
          console.log(res);
        },
        fail: (err) => {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "上传失败",
            icon: "none"
          });
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.startRecord && $options.startRecord(...args)),
    b: common_vendor.o((...args) => $options.endRecord && $options.endRecord(...args)),
    c: common_vendor.o((...args) => $options.playVoice && $options.playVoice(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "C:/Users/1/Documents/HBuilderProjects/Diet_Nutrition_GPT/uni_ym/pages/api-use/api-use2.vue"]]);
wx.createPage(MiniProgramPage);
