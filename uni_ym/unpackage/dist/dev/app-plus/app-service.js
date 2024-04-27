if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  function resolveEasycom(component, easycom) {
    return typeof component === "string" ? easycom : component;
  }
  const title = "调查问卷";
  const questions = [
    {
      id: 1,
      question: "通常情况下，您一天要吃几次米饭呢？"
    },
    {
      id: 2,
      question: "假如一碗米饭是200g的话，那您平均每次会吃多少呢"
    },
    {
      id: 3,
      question: "您一周会吃几次土豆/芋头/红薯呢？"
    },
    {
      id: 4,
      question: "一般来说，您每周吃几次面条呢？"
    },
    {
      id: 5,
      question: "您每个月都吃茄子、西红柿吗？一个月里有几次呢？"
    },
    {
      id: 6,
      question: "您每周会喝几次牛奶呢？每次喝多少呢？"
    },
    {
      id: 7,
      question: "您每个月都吃牛肉吗？一个月会吃多少牛肉呢？"
    }
  ];
  const data = {
    title,
    questions
  };
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const recorderManager$2 = uni.getRecorderManager();
  wx.getFileSystemManager();
  const _sfc_main$a = {
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
        questions: data.questions,
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
        return this.rpxTopx(uni.getSystemInfoSync().windowHeight);
      },
      // 键盘弹起来的高度+发送框高度
      inputHeight() {
        return this.bottomHeight + this.keyboardHeight;
      }
    },
    onLoad() {
      uni.onKeyboardHeightChange((res) => {
        this.keyboardHeight = this.rpxTopx(res.height);
        if (this.keyboardHeight < 0)
          this.keyboardHeight = 0;
      });
    },
    onUnload() {
    },
    mounted() {
      let self = this;
      recorderManager$2.onStart((_) => {
        self.recordTime = 0;
        formatAppLog("log", "at pages/test/test2.vue:151", "录音时长: ", self.recordTime);
        self.recordTimer = setInterval((_2) => {
          self.recordTime++;
        }, 1e3);
      });
      recorderManager$2.onStop(function(res) {
        if (self.recordTimer) {
          clearInterval(self.recordTimer);
          self.recordTimer = null;
        }
        formatAppLog("log", "at pages/test/test2.vue:161", "录音时长2: ", self.recordTime);
        if (self.recordTime < 2) {
          uni.showToast({
            title: "说话时间太短!",
            image: "/static/image/哭脸.png",
            mask: true
          });
          self.isRecordCancel = true;
        }
        if (!self.isRecordCancel) {
          self.isSendingquestion = true;
          formatAppLog("log", "at pages/test/test2.vue:172", "recorder stop" + JSON.stringify(res));
          self.voicePath = res.tempFilePath;
          let tempFilePath = res.tempFilePath;
          wx.getFileSystemManager().saveFile({
            tempFilePath,
            success: function(saveRes) {
              formatAppLog("log", "at pages/test/test2.vue:178", "文件保存成功", saveRes.savedFilePath);
              self.svoicePath = saveRes.savedFilePath;
              self.submitFile();
              self.stt();
            },
            fail: function(error) {
              formatAppLog("error", "at pages/test/test2.vue:185", "文件保存失败", error);
            }
          });
        }
      });
    },
    methods: {
      goback() {
        uni.switchTab({
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
        let deviceWidth = uni.getSystemInfoSync().windowWidth;
        let rpx = 750 / deviceWidth * Number(px);
        return Math.floor(rpx);
      },
      // 监视聊天发送栏高度
      sendHeight() {
        setTimeout(() => {
          let query = uni.createSelectorQuery();
          query.select(".send-msg").boundingClientRect();
          query.exec((res) => {
            this.bottomHeight = this.rpxTopx(res[0].height);
          });
        }, 10);
      },
      // 滚动至聊天底部
      scrollToBottom(e) {
        setTimeout(() => {
          let query = uni.createSelectorQuery().in(this);
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
          uni.showToast({
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
          uni.showToast({
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
          formatAppLog("log", "at pages/test/test2.vue:317", "Found question:", foundQuestion);
        }
      },
      extractKeywords(answer) {
        return new Promise((resolve, reject) => {
          uni.request({
            url: "http://127.0.0.1:5000/extraction",
            data: {
              "question": answer
            },
            method: "POST",
            success: (res) => {
              formatAppLog("log", "at pages/test/test2.vue:330", res.data);
              resolve(res.data.extract);
            }
          });
        });
      },
      async tts() {
        const currentQuestion = this.question;
        this.ttsOption = await this.ttsfuction(currentQuestion);
        formatAppLog("log", "at pages/test/test2.vue:340", this.ttsOption);
        this.playVoice(this.ttsOption);
      },
      ttsfuction(currentQuestion) {
        return new Promise((resolve, reject) => {
          uni.request({
            url: "http://127.0.0.1:5000/tts",
            data: {
              "text": currentQuestion
            },
            method: "POST",
            success: (res) => {
              resolve(res.data.path);
              formatAppLog("log", "at pages/test/test2.vue:354", res.data.path);
            },
            fail: (err) => {
              formatAppLog("error", "at pages/test/test2.vue:357", err);
            }
          });
        });
      },
      playVoice(audiopath) {
        const innerAudioContext2 = uni.createInnerAudioContext();
        innerAudioContext2.autoplay = true;
        innerAudioContext2.obeyMuteSwitch = false;
        const relativePath = audiopath.substring(audiopath.lastIndexOf("static"));
        innerAudioContext2.src = relativePath;
        innerAudioContext2.onPlay(() => {
          formatAppLog("log", "at pages/test/test2.vue:373", "开始播放");
        });
        innerAudioContext2.onError((res) => {
          formatAppLog("log", "at pages/test/test2.vue:376", res.errMsg);
          formatAppLog("log", "at pages/test/test2.vue:377", res.errCode);
          innerAudioContext2.destroy();
        });
        innerAudioContext2.onStop(() => {
          formatAppLog("log", "at pages/test/test2.vue:382", "i am onStop");
          innerAudioContext2.stop();
          innerAudioContext2.destroy();
        });
        innerAudioContext2.onEnded(() => {
          formatAppLog("log", "at pages/test/test2.vue:388", "i am onEnded");
          innerAudioContext2.destroy();
          formatAppLog("log", "at pages/test/test2.vue:391", "已执行destory()");
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
          uni.request({
            url: "http://127.0.0.1:5000/stt",
            // data:{
            // 	"path": this.svoicePath
            // },
            method: "GET",
            success: (res) => {
              resolve(res.data.text);
              formatAppLog("log", "at pages/test/test2.vue:425", res.data.text);
            },
            fail: (err) => {
              formatAppLog("error", "at pages/test/test2.vue:428", err);
            }
          });
        });
      },
      //录音上传
      submitFile() {
        let self = this;
        if (!self.svoicePath) {
          uni.showToast({
            title: "请录制后再提交",
            icon: "none"
          });
          return;
        }
        uni.showLoading({
          title: "提交中"
        });
        uni.uploadFile({
          url: "http://127.0.0.1:5000/voice",
          // 自己后台接收的接口
          filePath: self.svoicePath,
          name: "file",
          formData: {},
          success: (res) => {
            uni.hideLoading();
            uni.showToast({
              title: "上传成功",
              icon: "none"
            });
          },
          fail: (err) => {
            uni.hideLoading();
            uni.showToast({
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
        formatAppLog("log", "at pages/test/test2.vue:474", "开始录音");
        recorderManager$2.start({
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
        formatAppLog("log", "at pages/test/test2.vue:487", "录音结束");
        recorderManager$2.stop();
      }
      // playVoice02() {
      // 	__f__('log','at pages/test/test2.vue:492','播放录音');
      // 	if (this.voicePath) {
      // 		innerAudioContext.src = this.voicePath;
      // 		innerAudioContext.play();
      // 	}
      // },
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_icon = vue.resolveComponent("u-icon");
    return vue.openBlock(), vue.createElementBlock("view", { class: "chat" }, [
      vue.createCommentVNode(" 顶部标题 "),
      vue.createElementVNode("view", { class: "topTabbar" }, [
        vue.createCommentVNode(" 返回图标 "),
        vue.createVNode(_component_u_icon, {
          class: "icon",
          name: "arrow-left",
          size: "20px",
          color: "#000",
          onClick: _cache[0] || (_cache[0] = ($event) => $options.goback())
        }),
        vue.createCommentVNode(" 标题 "),
        vue.createElementVNode("view", { class: "text" }, "营养师")
      ]),
      vue.createElementVNode("scroll-view", {
        style: vue.normalizeStyle({ height: `${$options.windowHeight - $options.inputHeight - 180}rpx` }),
        id: "scrollview",
        "scroll-y": "true",
        "scroll-top": $data.scrollTop,
        class: "scroll-view"
      }, [
        vue.createCommentVNode(" 聊天主体 "),
        vue.createElementVNode("view", {
          id: "msglistview",
          class: "chat-body"
        }, [
          vue.createCommentVNode(" 聊天记录 "),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.msgList, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", { key: index }, [
                vue.createCommentVNode(" 自己发的消息 "),
                item.userContent != "" ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "item self"
                }, [
                  vue.createCommentVNode(" 文字内容 "),
                  vue.createElementVNode(
                    "view",
                    { class: "content right" },
                    vue.toDisplayString(item.userContent),
                    1
                    /* TEXT */
                  ),
                  vue.createCommentVNode(" 头像 "),
                  vue.createElementVNode("image", {
                    class: "avatar",
                    src: item.image
                  }, null, 8, ["src"])
                ])) : vue.createCommentVNode("v-if", true),
                vue.createCommentVNode(" 机器人发的消息 "),
                item.botContent != "" ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "item Ai"
                }, [
                  vue.createCommentVNode(" 头像 "),
                  vue.createElementVNode("image", {
                    class: "avatar",
                    src: item.image
                  }, null, 8, ["src"]),
                  vue.createCommentVNode(" 文字内容 "),
                  vue.createElementVNode(
                    "view",
                    { class: "content left" },
                    vue.toDisplayString(item.botContent),
                    1
                    /* TEXT */
                  )
                ])) : vue.createCommentVNode("v-if", true)
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ], 12, ["scroll-top"]),
      vue.createCommentVNode(" 底部消息发送栏 "),
      vue.createCommentVNode(" 用来占位，防止聊天消息被发送框遮挡 "),
      vue.createElementVNode(
        "view",
        {
          class: "chat-bottom",
          style: vue.normalizeStyle({ height: `${$options.inputHeight}rpx` })
        },
        [
          vue.createElementVNode(
            "view",
            {
              class: "send-msg",
              style: vue.normalizeStyle({ bottom: `${$data.keyboardHeight - 60}rpx` })
            },
            [
              vue.createElementVNode("image", {
                class: "change-input-btn",
                src: $data.isVoiceInput ? "/static/image/麦克风-active.png" : "/static/image/麦克风.png",
                onClick: _cache[1] || (_cache[1] = ($event) => $options.changeTo())
              }, null, 8, ["src"]),
              vue.withDirectives(vue.createElementVNode(
                "view",
                { class: "uni-textarea" },
                [
                  vue.withDirectives(vue.createElementVNode(
                    "textarea",
                    {
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.chatMsg = $event),
                      maxlength: "300",
                      "confirm-type": "send",
                      onConfirm: _cache[3] || (_cache[3] = (...args) => $options.sendAnswer && $options.sendAnswer(...args)),
                      placeholder: "输入你的回答~",
                      "show-confirm-bar": false,
                      "adjust-position": false,
                      onLinechange: _cache[4] || (_cache[4] = (...args) => $options.sendHeight && $options.sendHeight(...args)),
                      onFocus: _cache[5] || (_cache[5] = (...args) => $options.focus && $options.focus(...args)),
                      onBlur: _cache[6] || (_cache[6] = (...args) => $options.blur && $options.blur(...args)),
                      "auto-height": ""
                    },
                    null,
                    544
                    /* NEED_HYDRATION, NEED_PATCH */
                  ), [
                    [vue.vModelText, $data.chatMsg]
                  ])
                ],
                512
                /* NEED_PATCH */
              ), [
                [vue.vShow, !$data.isVoiceInput]
              ]),
              vue.withDirectives(vue.createElementVNode(
                "button",
                {
                  onClick: _cache[7] || (_cache[7] = (...args) => $options.sendAnswer && $options.sendAnswer(...args)),
                  class: "send-btn"
                },
                "发送",
                512
                /* NEED_PATCH */
              ), [
                [vue.vShow, !$data.isVoiceInput]
              ])
            ],
            4
            /* STYLE */
          ),
          vue.createCommentVNode(" 语音输入按钮 "),
          vue.withDirectives(vue.createElementVNode(
            "button",
            {
              class: vue.normalizeClass(["voice-input-button", { active: $data.isVoiceInputActive }]),
              onMousedown: _cache[8] || (_cache[8] = (...args) => $options.sendAnswer && $options.sendAnswer(...args)),
              onTouchstart: _cache[9] || (_cache[9] = (...args) => $options.sendAnswer && $options.sendAnswer(...args)),
              onMouseup: _cache[10] || (_cache[10] = (...args) => $options.endPress && $options.endPress(...args)),
              onTouchend: _cache[11] || (_cache[11] = (...args) => $options.endPress && $options.endPress(...args))
            },
            vue.toDisplayString($data.VoiceTitle),
            35
            /* TEXT, CLASS, NEED_HYDRATION */
          ), [
            [vue.vShow, $data.isVoiceInput]
          ])
        ],
        4
        /* STYLE */
      )
    ]);
  }
  const PagesTestTest2 = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-51a7cd0a"], ["__file", "C:/Users/1/Documents/HBuilderProjects/Diet_Nutrition_GPT/uni_ym/pages/test/test2.vue"]]);
  const recorderManager$1 = uni.getRecorderManager();
  const innerAudioContext = uni.createInnerAudioContext();
  innerAudioContext.autoplay = true;
  const _sfc_main$9 = {
    data() {
      return {
        voicePath: "",
        text: ""
      };
    },
    onLoad() {
      let self = this;
      recorderManager$1.onStop(function(res) {
        formatAppLog("log", "at pages/api-use/api-use2.vue:24", "recorder stop" + JSON.stringify(res));
        let tempFilePath = res.tempFilePath;
        wx.getFileSystemManager().saveFile({
          tempFilePath,
          success: function(saveRes) {
            formatAppLog("log", "at pages/api-use/api-use2.vue:29", "文件保存成功", saveRes.savedFilePath);
            self.voicePath = saveRes.savedFilePath;
            self.stt_api();
          }
        });
      });
    },
    methods: {
      startRecord() {
        formatAppLog("log", "at pages/api-use/api-use2.vue:39", "开始录音");
        recorderManager$1.start({
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
        formatAppLog("log", "at pages/api-use/api-use2.vue:49", "录音结束");
        recorderManager$1.stop();
      },
      playVoice() {
        formatAppLog("log", "at pages/api-use/api-use2.vue:53", "播放录音");
        if (this.voicePath) {
          innerAudioContext.src = this.voicePath;
          innerAudioContext.play();
        }
      },
      stt_api() {
        let self = this;
        uni.uploadFile({
          url: "http://127.0.0.1:5000/stt_api",
          // 自己后台接收的接口
          filePath: self.voicePath,
          name: "file",
          formData: {},
          success: (res) => {
            formatAppLog("log", "at pages/api-use/api-use2.vue:68", res);
          },
          fail: (err) => {
            uni.hideLoading();
            uni.showToast({
              title: "上传失败",
              icon: "none"
            });
          }
        });
      }
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createElementVNode("button", {
        onClick: _cache[0] || (_cache[0] = (...args) => $options.startRecord && $options.startRecord(...args))
      }, "开始录音"),
      vue.createElementVNode("button", {
        onClick: _cache[1] || (_cache[1] = (...args) => $options.endRecord && $options.endRecord(...args))
      }, "停止录音"),
      vue.createElementVNode("button", {
        onClick: _cache[2] || (_cache[2] = (...args) => $options.playVoice && $options.playVoice(...args))
      }, "播放录音")
    ]);
  }
  const PagesApiUseApiUse2 = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__file", "C:/Users/1/Documents/HBuilderProjects/Diet_Nutrition_GPT/uni_ym/pages/api-use/api-use2.vue"]]);
  const recorderManager = uni.getRecorderManager();
  wx.getFileSystemManager();
  const _sfc_main$8 = {
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
        questions: data.questions,
        question: "",
        isVoiceInput: false,
        //转换语音输入按钮
        isVoiceInputActive: false,
        // 语音按钮状态：初始状态为非按下状态
        VoiceTitle: "按住说话",
        voicePath: "",
        //说话录音存储
        svoicePath: "",
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
        return this.rpxTopx(uni.getSystemInfoSync().windowHeight);
      },
      // 键盘弹起来的高度+发送框高度
      inputHeight() {
        return this.bottomHeight + this.keyboardHeight;
      }
    },
    onLoad() {
      uni.onKeyboardHeightChange((res) => {
        this.keyboardHeight = this.rpxTopx(res.height);
        if (this.keyboardHeight < 0)
          this.keyboardHeight = 0;
      });
      let self = this;
      recorderManager.onStop(function(res) {
        formatAppLog("log", "at pages/test/test.vue:143", "recorder stop" + JSON.stringify(res));
        self.voicePath = res.tempFilePath;
        let tempFilePath = res.tempFilePath;
        wx.getFileSystemManager().saveFile({
          tempFilePath,
          success: function(saveRes) {
            formatAppLog("log", "at pages/test/test.vue:149", "文件保存成功", saveRes.savedFilePath);
            self.svoicePath = saveRes.savedFilePath;
            self.submitFile();
            self.stt();
          },
          fail: function(error) {
            formatAppLog("error", "at pages/test/test.vue:156", "文件保存失败", error);
          }
        });
      });
    },
    onUnload() {
    },
    methods: {
      goback() {
        uni.switchTab({
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
        let deviceWidth = uni.getSystemInfoSync().windowWidth;
        let rpx = 750 / deviceWidth * Number(px);
        return Math.floor(rpx);
      },
      // 监视聊天发送栏高度
      sendHeight() {
        setTimeout(() => {
          let query = uni.createSelectorQuery();
          query.select(".send-msg").boundingClientRect();
          query.exec((res) => {
            this.bottomHeight = this.rpxTopx(res[0].height);
          });
        }, 10);
      },
      // 滚动至聊天底部
      scrollToBottom(e) {
        setTimeout(() => {
          let query = uni.createSelectorQuery().in(this);
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
          uni.showToast({
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
          uni.showToast({
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
          formatAppLog("log", "at pages/test/test.vue:290", "Found question:", foundQuestion);
        }
      },
      extractKeywords(answer) {
        return new Promise((resolve, reject) => {
          uni.request({
            url: "http://127.0.0.1:5000/extraction",
            data: {
              "question": answer
            },
            method: "POST",
            success: (res) => {
              formatAppLog("log", "at pages/test/test.vue:303", res.data);
              resolve(res.data.extract);
            }
          });
        });
      },
      async tts() {
        const currentQuestion = this.question;
        this.ttsOption = await this.ttsfuction(currentQuestion);
        formatAppLog("log", "at pages/test/test.vue:313", this.ttsOption);
        this.playVoice(this.ttsOption);
      },
      ttsfuction(currentQuestion) {
        return new Promise((resolve, reject) => {
          uni.request({
            url: "http://127.0.0.1:5000/tts",
            data: {
              "text": currentQuestion
            },
            method: "POST",
            success: (res) => {
              resolve(res.data.path);
              formatAppLog("log", "at pages/test/test.vue:327", res.data.path);
            },
            fail: (err) => {
              formatAppLog("error", "at pages/test/test.vue:330", err);
            }
          });
        });
      },
      playVoice(audiopath) {
        const innerAudioContext2 = uni.createInnerAudioContext();
        innerAudioContext2.autoplay = true;
        innerAudioContext2.obeyMuteSwitch = false;
        const relativePath = audiopath.substring(audiopath.lastIndexOf("static"));
        innerAudioContext2.src = relativePath;
        innerAudioContext2.onPlay(() => {
          formatAppLog("log", "at pages/test/test.vue:346", "开始播放");
        });
        innerAudioContext2.onError((res) => {
          formatAppLog("log", "at pages/test/test.vue:349", res.errMsg);
          formatAppLog("log", "at pages/test/test.vue:350", res.errCode);
          innerAudioContext2.destroy();
        });
        innerAudioContext2.onStop(() => {
          formatAppLog("log", "at pages/test/test.vue:355", "i am onStop");
          innerAudioContext2.stop();
          innerAudioContext2.destroy();
        });
        innerAudioContext2.onEnded(() => {
          formatAppLog("log", "at pages/test/test.vue:361", "i am onEnded");
          innerAudioContext2.destroy();
          formatAppLog("log", "at pages/test/test.vue:364", "已执行destory()");
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
          uni.request({
            url: "http://127.0.0.1:5000/stt",
            // data:{
            // 	"path": this.svoicePath
            // },
            method: "GET",
            success: (res) => {
              resolve(res.data.text);
              formatAppLog("log", "at pages/test/test.vue:398", res.data.text);
            },
            fail: (err) => {
              formatAppLog("error", "at pages/test/test.vue:401", err);
            }
          });
        });
      },
      //录音上传
      submitFile() {
        let self = this;
        if (!self.svoicePath) {
          uni.showToast({
            title: "请录制后再提交",
            icon: "none"
          });
          return;
        }
        uni.showLoading({
          title: "提交中"
        });
        uni.uploadFile({
          url: "http://127.0.0.1:5000/voice",
          // 自己后台接收的接口
          filePath: self.svoicePath,
          name: "file",
          formData: {},
          success: (res) => {
            uni.hideLoading();
            uni.showToast({
              title: "上传成功",
              icon: "none"
            });
          },
          fail: (err) => {
            uni.hideLoading();
            uni.showToast({
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
        this.isSendingquestion = true;
        this.isVoiceInputActive = true;
        this.VoiceTitle = "说话中...";
        formatAppLog("log", "at pages/test/test.vue:448", "开始录音");
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
        this.isVoiceInputActive = false;
        this.VoiceTitle = "按住说话";
        formatAppLog("log", "at pages/test/test.vue:460", "录音结束");
        recorderManager.stop();
      },
      //保存数据
      dataSave() {
      },
      //取用数据
      dataGet() {
      }
      // playVoice02() {
      // 	__f__('log','at pages/test/test.vue:472','播放录音');
      // 	if (this.voicePath) {
      // 		innerAudioContext.src = this.voicePath;
      // 		innerAudioContext.play();
      // 	}
      // },
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_icon = vue.resolveComponent("u-icon");
    return vue.openBlock(), vue.createElementBlock("view", { class: "chat" }, [
      vue.createCommentVNode(" 顶部标题 "),
      vue.createElementVNode("view", { class: "topTabbar" }, [
        vue.createCommentVNode(" 返回图标 "),
        vue.createVNode(_component_u_icon, {
          class: "icon",
          name: "arrow-left",
          size: "20px",
          color: "#000",
          onClick: _cache[0] || (_cache[0] = ($event) => $options.goback())
        }),
        vue.createCommentVNode(" 标题 "),
        vue.createElementVNode("view", { class: "text" }, "营养师")
      ]),
      vue.createElementVNode("scroll-view", {
        style: vue.normalizeStyle({ height: `${$options.windowHeight - $options.inputHeight - 180}rpx` }),
        id: "scrollview",
        "scroll-y": "true",
        "scroll-top": $data.scrollTop,
        class: "scroll-view"
      }, [
        vue.createCommentVNode(" 聊天主体 "),
        vue.createElementVNode("view", {
          id: "msglistview",
          class: "chat-body"
        }, [
          vue.createCommentVNode(" 聊天记录 "),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.msgList, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", { key: index }, [
                vue.createCommentVNode(" 自己发的消息 "),
                item.userContent != "" ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "item self"
                }, [
                  vue.createCommentVNode(" 文字内容 "),
                  vue.createElementVNode(
                    "view",
                    { class: "content right" },
                    vue.toDisplayString(item.userContent),
                    1
                    /* TEXT */
                  ),
                  vue.createCommentVNode(" 头像 "),
                  vue.createElementVNode("image", {
                    class: "avatar",
                    src: item.image
                  }, null, 8, ["src"])
                ])) : vue.createCommentVNode("v-if", true),
                vue.createCommentVNode(" 机器人发的消息 "),
                item.botContent != "" ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "item Ai"
                }, [
                  vue.createCommentVNode(" 头像 "),
                  vue.createElementVNode("image", {
                    class: "avatar",
                    src: item.image
                  }, null, 8, ["src"]),
                  vue.createCommentVNode(" 文字内容 "),
                  vue.createElementVNode(
                    "view",
                    { class: "content left" },
                    vue.toDisplayString(item.botContent),
                    1
                    /* TEXT */
                  )
                ])) : vue.createCommentVNode("v-if", true)
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ], 12, ["scroll-top"]),
      vue.createCommentVNode(" 底部消息发送栏 "),
      vue.createCommentVNode(" 用来占位，防止聊天消息被发送框遮挡 "),
      vue.createElementVNode(
        "view",
        {
          class: "chat-bottom",
          style: vue.normalizeStyle({ height: `${$options.inputHeight}rpx` })
        },
        [
          vue.createElementVNode(
            "view",
            {
              class: "send-msg",
              style: vue.normalizeStyle({ bottom: `${$data.keyboardHeight - 60}rpx` })
            },
            [
              vue.createElementVNode("image", {
                class: "change-input-btn",
                src: $data.isVoiceInput ? "/static/image/麦克风-active.png" : "/static/image/麦克风.png",
                onClick: _cache[1] || (_cache[1] = ($event) => $options.changeTo())
              }, null, 8, ["src"]),
              vue.withDirectives(vue.createElementVNode(
                "view",
                { class: "uni-textarea" },
                [
                  vue.withDirectives(vue.createElementVNode(
                    "textarea",
                    {
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.chatMsg = $event),
                      maxlength: "300",
                      "confirm-type": "send",
                      onConfirm: _cache[3] || (_cache[3] = (...args) => $options.sendAnswer && $options.sendAnswer(...args)),
                      placeholder: "输入你的回答~",
                      "show-confirm-bar": false,
                      "adjust-position": false,
                      onLinechange: _cache[4] || (_cache[4] = (...args) => $options.sendHeight && $options.sendHeight(...args)),
                      onFocus: _cache[5] || (_cache[5] = (...args) => $options.focus && $options.focus(...args)),
                      onBlur: _cache[6] || (_cache[6] = (...args) => $options.blur && $options.blur(...args)),
                      "auto-height": ""
                    },
                    null,
                    544
                    /* NEED_HYDRATION, NEED_PATCH */
                  ), [
                    [vue.vModelText, $data.chatMsg]
                  ])
                ],
                512
                /* NEED_PATCH */
              ), [
                [vue.vShow, !$data.isVoiceInput]
              ]),
              vue.withDirectives(vue.createElementVNode(
                "button",
                {
                  onClick: _cache[7] || (_cache[7] = (...args) => $options.sendAnswer && $options.sendAnswer(...args)),
                  class: "send-btn"
                },
                "发送",
                512
                /* NEED_PATCH */
              ), [
                [vue.vShow, !$data.isVoiceInput]
              ])
            ],
            4
            /* STYLE */
          ),
          vue.createCommentVNode(" 语音输入按钮 "),
          vue.withDirectives(vue.createElementVNode(
            "button",
            {
              class: vue.normalizeClass(["voice-input-button", { active: $data.isVoiceInputActive }]),
              onMousedown: _cache[8] || (_cache[8] = (...args) => $options.sendAnswer && $options.sendAnswer(...args)),
              onTouchstart: _cache[9] || (_cache[9] = (...args) => $options.sendAnswer && $options.sendAnswer(...args)),
              onMouseup: _cache[10] || (_cache[10] = (...args) => $options.endPress && $options.endPress(...args)),
              onTouchend: _cache[11] || (_cache[11] = (...args) => $options.endPress && $options.endPress(...args))
            },
            vue.toDisplayString($data.VoiceTitle),
            35
            /* TEXT, CLASS, NEED_HYDRATION */
          ), [
            [vue.vShow, $data.isVoiceInput]
          ])
        ],
        4
        /* STYLE */
      )
    ]);
  }
  const PagesTestTest = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-727d09f0"], ["__file", "C:/Users/1/Documents/HBuilderProjects/Diet_Nutrition_GPT/uni_ym/pages/test/test.vue"]]);
  const _sfc_main$7 = {
    data() {
      return {
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
            botContent: "你好啊，很高兴你可以关注我，请问我有什么可以帮助你的吗？",
            userContent: "",
            image: "/static/common/unname1.jpeg"
          },
          {
            botContent: "",
            userContent: "你好呀，非常高兴认识你",
            image: "/static/common/unname2.jpg"
          }
        ]
      };
    },
    updated() {
      this.scrollToBottom();
    },
    computed: {
      windowHeight() {
        return this.rpxTopx(uni.getSystemInfoSync().windowHeight);
      },
      // 键盘弹起来的高度+发送框高度
      inputHeight() {
        return this.bottomHeight + this.keyboardHeight;
      }
    },
    onLoad() {
      uni.onKeyboardHeightChange((res) => {
        this.keyboardHeight = this.rpxTopx(res.height);
        if (this.keyboardHeight < 0)
          this.keyboardHeight = 0;
      });
    },
    onUnload() {
    },
    methods: {
      goback() {
        uni.switchTab({
          url: "/pages/tutorship/tutorship"
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
        let deviceWidth = uni.getSystemInfoSync().windowWidth;
        let rpx = 750 / deviceWidth * Number(px);
        return Math.floor(rpx);
      },
      // 监视聊天发送栏高度
      sendHeight() {
        setTimeout(() => {
          let query = uni.createSelectorQuery();
          query.select(".send-msg").boundingClientRect();
          query.exec((res) => {
            this.bottomHeight = this.rpxTopx(res[0].height);
          });
        }, 10);
      },
      // 滚动至聊天底部
      scrollToBottom(e) {
        setTimeout(() => {
          let query = uni.createSelectorQuery().in(this);
          query.select("#scrollview").boundingClientRect();
          query.select("#msglistview").boundingClientRect();
          query.exec((res) => {
            if (res[1].height > res[0].height) {
              this.scrollTop = this.rpxTopx(res[1].height - res[0].height);
            }
          });
        }, 15);
      },
      // 发送消息
      handleSend() {
        if (!this.chatMsg || !/^\s+$/.test(this.chatMsg)) {
          let obj = {
            botContent: "",
            userContent: this.chatMsg,
            image: "/static/common/unname2.jpg"
          };
          this.msgList.push(obj);
          this.chatMsg = "";
          this.scrollToBottom();
        } else {
          uni.showToast({
            title: "正在输出问题，请等待...",
            image: "/static/image/等待.png"
          });
        }
      }
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_icon = vue.resolveComponent("u-icon");
    return vue.openBlock(), vue.createElementBlock("view", { class: "chat" }, [
      vue.createCommentVNode(" 顶部标题 "),
      vue.createElementVNode("view", { class: "topTabbar" }, [
        vue.createCommentVNode(" 返回图标 "),
        vue.createVNode(_component_u_icon, {
          class: "icon",
          name: "arrow-left",
          size: "20px",
          color: "#000",
          onClick: _cache[0] || (_cache[0] = ($event) => $options.goback())
        }),
        vue.createCommentVNode(" 标题 "),
        vue.createElementVNode("view", { class: "text" }, "匿名")
      ]),
      vue.createElementVNode("scroll-view", {
        style: vue.normalizeStyle({ height: `${$options.windowHeight - $options.inputHeight - 180}rpx` }),
        id: "scrollview",
        "scroll-y": "true",
        "scroll-top": $data.scrollTop,
        class: "scroll-view"
      }, [
        vue.createCommentVNode(" 聊天主体 "),
        vue.createElementVNode("view", {
          id: "msglistview",
          class: "chat-body"
        }, [
          vue.createCommentVNode(" 聊天记录 "),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.msgList, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", { key: index }, [
                vue.createCommentVNode(" 自己发的消息 "),
                item.userContent != "" ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "item self"
                }, [
                  vue.createCommentVNode(" 文字内容 "),
                  vue.createElementVNode(
                    "view",
                    { class: "content right" },
                    vue.toDisplayString(item.userContent),
                    1
                    /* TEXT */
                  ),
                  vue.createCommentVNode(" 头像 "),
                  vue.createElementVNode("image", {
                    class: "avatar",
                    src: item.image
                  }, null, 8, ["src"])
                ])) : vue.createCommentVNode("v-if", true),
                vue.createCommentVNode(" 机器人发的消息 "),
                item.botContent != "" ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "item Ai"
                }, [
                  vue.createCommentVNode(" 头像 "),
                  vue.createElementVNode("image", {
                    class: "avatar",
                    src: item.image
                  }, null, 8, ["src"]),
                  vue.createCommentVNode(" 文字内容 "),
                  vue.createElementVNode(
                    "view",
                    { class: "content left" },
                    vue.toDisplayString(item.botContent),
                    1
                    /* TEXT */
                  )
                ])) : vue.createCommentVNode("v-if", true)
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ], 12, ["scroll-top"]),
      vue.createCommentVNode(" 底部消息发送栏 "),
      vue.createCommentVNode(" 用来占位，防止聊天消息被发送框遮挡 "),
      vue.createElementVNode(
        "view",
        {
          class: "chat-bottom",
          style: vue.normalizeStyle({ height: `${$options.inputHeight}rpx` })
        },
        [
          vue.createElementVNode(
            "view",
            {
              class: "send-msg",
              style: vue.normalizeStyle({ bottom: `${$data.keyboardHeight - 60}rpx` })
            },
            [
              vue.createElementVNode("view", { class: "uni-textarea" }, [
                vue.withDirectives(vue.createElementVNode(
                  "textarea",
                  {
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.chatMsg = $event),
                    maxlength: "300",
                    "confirm-type": "send",
                    onConfirm: _cache[2] || (_cache[2] = (...args) => $options.handleSend && $options.handleSend(...args)),
                    placeholder: "快来聊天吧~",
                    "show-confirm-bar": false,
                    "adjust-position": false,
                    onLinechange: _cache[3] || (_cache[3] = (...args) => $options.sendHeight && $options.sendHeight(...args)),
                    onFocus: _cache[4] || (_cache[4] = (...args) => $options.focus && $options.focus(...args)),
                    onBlur: _cache[5] || (_cache[5] = (...args) => $options.blur && $options.blur(...args)),
                    "auto-height": ""
                  },
                  null,
                  544
                  /* NEED_HYDRATION, NEED_PATCH */
                ), [
                  [vue.vModelText, $data.chatMsg]
                ])
              ]),
              vue.createElementVNode("button", {
                onClick: _cache[6] || (_cache[6] = (...args) => $options.handleSend && $options.handleSend(...args)),
                class: "send-btn"
              }, "发送")
            ],
            4
            /* STYLE */
          )
        ],
        4
        /* STYLE */
      )
    ]);
  }
  const PagesProblemProblem = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-f80315c0"], ["__file", "C:/Users/1/Documents/HBuilderProjects/Diet_Nutrition_GPT/uni_ym/pages/problem/problem.vue"]]);
  const _sfc_main$6 = {
    data() {
      return {
        title: "饮食营养健康问卷"
      };
    },
    onLoad() {
    },
    methods: {
      goToTest() {
        uni.navigateTo({
          url: "/pages/test/test"
        });
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
      vue.createElementVNode("image", {
        class: "logo",
        src: "/static/问卷.png",
        onClick: _cache[0] || (_cache[0] = ($event) => $options.goToTest())
      }),
      vue.createElementVNode("view", { class: "text-area" }, [
        vue.createElementVNode(
          "text",
          { class: "title" },
          vue.toDisplayString($data.title),
          1
          /* TEXT */
        )
      ])
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__file", "C:/Users/1/Documents/HBuilderProjects/Diet_Nutrition_GPT/uni_ym/pages/index/index.vue"]]);
  const fontData = [
    {
      "font_class": "arrow-down",
      "unicode": ""
    },
    {
      "font_class": "arrow-left",
      "unicode": ""
    },
    {
      "font_class": "arrow-right",
      "unicode": ""
    },
    {
      "font_class": "arrow-up",
      "unicode": ""
    },
    {
      "font_class": "auth",
      "unicode": ""
    },
    {
      "font_class": "auth-filled",
      "unicode": ""
    },
    {
      "font_class": "back",
      "unicode": ""
    },
    {
      "font_class": "bars",
      "unicode": ""
    },
    {
      "font_class": "calendar",
      "unicode": ""
    },
    {
      "font_class": "calendar-filled",
      "unicode": ""
    },
    {
      "font_class": "camera",
      "unicode": ""
    },
    {
      "font_class": "camera-filled",
      "unicode": ""
    },
    {
      "font_class": "cart",
      "unicode": ""
    },
    {
      "font_class": "cart-filled",
      "unicode": ""
    },
    {
      "font_class": "chat",
      "unicode": ""
    },
    {
      "font_class": "chat-filled",
      "unicode": ""
    },
    {
      "font_class": "chatboxes",
      "unicode": ""
    },
    {
      "font_class": "chatboxes-filled",
      "unicode": ""
    },
    {
      "font_class": "chatbubble",
      "unicode": ""
    },
    {
      "font_class": "chatbubble-filled",
      "unicode": ""
    },
    {
      "font_class": "checkbox",
      "unicode": ""
    },
    {
      "font_class": "checkbox-filled",
      "unicode": ""
    },
    {
      "font_class": "checkmarkempty",
      "unicode": ""
    },
    {
      "font_class": "circle",
      "unicode": ""
    },
    {
      "font_class": "circle-filled",
      "unicode": ""
    },
    {
      "font_class": "clear",
      "unicode": ""
    },
    {
      "font_class": "close",
      "unicode": ""
    },
    {
      "font_class": "closeempty",
      "unicode": ""
    },
    {
      "font_class": "cloud-download",
      "unicode": ""
    },
    {
      "font_class": "cloud-download-filled",
      "unicode": ""
    },
    {
      "font_class": "cloud-upload",
      "unicode": ""
    },
    {
      "font_class": "cloud-upload-filled",
      "unicode": ""
    },
    {
      "font_class": "color",
      "unicode": ""
    },
    {
      "font_class": "color-filled",
      "unicode": ""
    },
    {
      "font_class": "compose",
      "unicode": ""
    },
    {
      "font_class": "contact",
      "unicode": ""
    },
    {
      "font_class": "contact-filled",
      "unicode": ""
    },
    {
      "font_class": "down",
      "unicode": ""
    },
    {
      "font_class": "bottom",
      "unicode": ""
    },
    {
      "font_class": "download",
      "unicode": ""
    },
    {
      "font_class": "download-filled",
      "unicode": ""
    },
    {
      "font_class": "email",
      "unicode": ""
    },
    {
      "font_class": "email-filled",
      "unicode": ""
    },
    {
      "font_class": "eye",
      "unicode": ""
    },
    {
      "font_class": "eye-filled",
      "unicode": ""
    },
    {
      "font_class": "eye-slash",
      "unicode": ""
    },
    {
      "font_class": "eye-slash-filled",
      "unicode": ""
    },
    {
      "font_class": "fire",
      "unicode": ""
    },
    {
      "font_class": "fire-filled",
      "unicode": ""
    },
    {
      "font_class": "flag",
      "unicode": ""
    },
    {
      "font_class": "flag-filled",
      "unicode": ""
    },
    {
      "font_class": "folder-add",
      "unicode": ""
    },
    {
      "font_class": "folder-add-filled",
      "unicode": ""
    },
    {
      "font_class": "font",
      "unicode": ""
    },
    {
      "font_class": "forward",
      "unicode": ""
    },
    {
      "font_class": "gear",
      "unicode": ""
    },
    {
      "font_class": "gear-filled",
      "unicode": ""
    },
    {
      "font_class": "gift",
      "unicode": ""
    },
    {
      "font_class": "gift-filled",
      "unicode": ""
    },
    {
      "font_class": "hand-down",
      "unicode": ""
    },
    {
      "font_class": "hand-down-filled",
      "unicode": ""
    },
    {
      "font_class": "hand-up",
      "unicode": ""
    },
    {
      "font_class": "hand-up-filled",
      "unicode": ""
    },
    {
      "font_class": "headphones",
      "unicode": ""
    },
    {
      "font_class": "heart",
      "unicode": ""
    },
    {
      "font_class": "heart-filled",
      "unicode": ""
    },
    {
      "font_class": "help",
      "unicode": ""
    },
    {
      "font_class": "help-filled",
      "unicode": ""
    },
    {
      "font_class": "home",
      "unicode": ""
    },
    {
      "font_class": "home-filled",
      "unicode": ""
    },
    {
      "font_class": "image",
      "unicode": ""
    },
    {
      "font_class": "image-filled",
      "unicode": ""
    },
    {
      "font_class": "images",
      "unicode": ""
    },
    {
      "font_class": "images-filled",
      "unicode": ""
    },
    {
      "font_class": "info",
      "unicode": ""
    },
    {
      "font_class": "info-filled",
      "unicode": ""
    },
    {
      "font_class": "left",
      "unicode": ""
    },
    {
      "font_class": "link",
      "unicode": ""
    },
    {
      "font_class": "list",
      "unicode": ""
    },
    {
      "font_class": "location",
      "unicode": ""
    },
    {
      "font_class": "location-filled",
      "unicode": ""
    },
    {
      "font_class": "locked",
      "unicode": ""
    },
    {
      "font_class": "locked-filled",
      "unicode": ""
    },
    {
      "font_class": "loop",
      "unicode": ""
    },
    {
      "font_class": "mail-open",
      "unicode": ""
    },
    {
      "font_class": "mail-open-filled",
      "unicode": ""
    },
    {
      "font_class": "map",
      "unicode": ""
    },
    {
      "font_class": "map-filled",
      "unicode": ""
    },
    {
      "font_class": "map-pin",
      "unicode": ""
    },
    {
      "font_class": "map-pin-ellipse",
      "unicode": ""
    },
    {
      "font_class": "medal",
      "unicode": ""
    },
    {
      "font_class": "medal-filled",
      "unicode": ""
    },
    {
      "font_class": "mic",
      "unicode": ""
    },
    {
      "font_class": "mic-filled",
      "unicode": ""
    },
    {
      "font_class": "micoff",
      "unicode": ""
    },
    {
      "font_class": "micoff-filled",
      "unicode": ""
    },
    {
      "font_class": "minus",
      "unicode": ""
    },
    {
      "font_class": "minus-filled",
      "unicode": ""
    },
    {
      "font_class": "more",
      "unicode": ""
    },
    {
      "font_class": "more-filled",
      "unicode": ""
    },
    {
      "font_class": "navigate",
      "unicode": ""
    },
    {
      "font_class": "navigate-filled",
      "unicode": ""
    },
    {
      "font_class": "notification",
      "unicode": ""
    },
    {
      "font_class": "notification-filled",
      "unicode": ""
    },
    {
      "font_class": "paperclip",
      "unicode": ""
    },
    {
      "font_class": "paperplane",
      "unicode": ""
    },
    {
      "font_class": "paperplane-filled",
      "unicode": ""
    },
    {
      "font_class": "person",
      "unicode": ""
    },
    {
      "font_class": "person-filled",
      "unicode": ""
    },
    {
      "font_class": "personadd",
      "unicode": ""
    },
    {
      "font_class": "personadd-filled",
      "unicode": ""
    },
    {
      "font_class": "personadd-filled-copy",
      "unicode": ""
    },
    {
      "font_class": "phone",
      "unicode": ""
    },
    {
      "font_class": "phone-filled",
      "unicode": ""
    },
    {
      "font_class": "plus",
      "unicode": ""
    },
    {
      "font_class": "plus-filled",
      "unicode": ""
    },
    {
      "font_class": "plusempty",
      "unicode": ""
    },
    {
      "font_class": "pulldown",
      "unicode": ""
    },
    {
      "font_class": "pyq",
      "unicode": ""
    },
    {
      "font_class": "qq",
      "unicode": ""
    },
    {
      "font_class": "redo",
      "unicode": ""
    },
    {
      "font_class": "redo-filled",
      "unicode": ""
    },
    {
      "font_class": "refresh",
      "unicode": ""
    },
    {
      "font_class": "refresh-filled",
      "unicode": ""
    },
    {
      "font_class": "refreshempty",
      "unicode": ""
    },
    {
      "font_class": "reload",
      "unicode": ""
    },
    {
      "font_class": "right",
      "unicode": ""
    },
    {
      "font_class": "scan",
      "unicode": ""
    },
    {
      "font_class": "search",
      "unicode": ""
    },
    {
      "font_class": "settings",
      "unicode": ""
    },
    {
      "font_class": "settings-filled",
      "unicode": ""
    },
    {
      "font_class": "shop",
      "unicode": ""
    },
    {
      "font_class": "shop-filled",
      "unicode": ""
    },
    {
      "font_class": "smallcircle",
      "unicode": ""
    },
    {
      "font_class": "smallcircle-filled",
      "unicode": ""
    },
    {
      "font_class": "sound",
      "unicode": ""
    },
    {
      "font_class": "sound-filled",
      "unicode": ""
    },
    {
      "font_class": "spinner-cycle",
      "unicode": ""
    },
    {
      "font_class": "staff",
      "unicode": ""
    },
    {
      "font_class": "staff-filled",
      "unicode": ""
    },
    {
      "font_class": "star",
      "unicode": ""
    },
    {
      "font_class": "star-filled",
      "unicode": ""
    },
    {
      "font_class": "starhalf",
      "unicode": ""
    },
    {
      "font_class": "trash",
      "unicode": ""
    },
    {
      "font_class": "trash-filled",
      "unicode": ""
    },
    {
      "font_class": "tune",
      "unicode": ""
    },
    {
      "font_class": "tune-filled",
      "unicode": ""
    },
    {
      "font_class": "undo",
      "unicode": ""
    },
    {
      "font_class": "undo-filled",
      "unicode": ""
    },
    {
      "font_class": "up",
      "unicode": ""
    },
    {
      "font_class": "top",
      "unicode": ""
    },
    {
      "font_class": "upload",
      "unicode": ""
    },
    {
      "font_class": "upload-filled",
      "unicode": ""
    },
    {
      "font_class": "videocam",
      "unicode": ""
    },
    {
      "font_class": "videocam-filled",
      "unicode": ""
    },
    {
      "font_class": "vip",
      "unicode": ""
    },
    {
      "font_class": "vip-filled",
      "unicode": ""
    },
    {
      "font_class": "wallet",
      "unicode": ""
    },
    {
      "font_class": "wallet-filled",
      "unicode": ""
    },
    {
      "font_class": "weibo",
      "unicode": ""
    },
    {
      "font_class": "weixin",
      "unicode": ""
    }
  ];
  const getVal = (val) => {
    const reg = /^[0-9]*$/g;
    return typeof val === "number" || reg.test(val) ? val + "px" : val;
  };
  const _sfc_main$5 = {
    name: "UniIcons",
    emits: ["click"],
    props: {
      type: {
        type: String,
        default: ""
      },
      color: {
        type: String,
        default: "#333333"
      },
      size: {
        type: [Number, String],
        default: 16
      },
      customPrefix: {
        type: String,
        default: ""
      },
      fontFamily: {
        type: String,
        default: ""
      }
    },
    data() {
      return {
        icons: fontData
      };
    },
    computed: {
      unicode() {
        let code = this.icons.find((v) => v.font_class === this.type);
        if (code) {
          return code.unicode;
        }
        return "";
      },
      iconSize() {
        return getVal(this.size);
      },
      styleObj() {
        if (this.fontFamily !== "") {
          return `color: ${this.color}; font-size: ${this.iconSize}; font-family: ${this.fontFamily};`;
        }
        return `color: ${this.color}; font-size: ${this.iconSize};`;
      }
    },
    methods: {
      _onClick() {
        this.$emit("click");
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "text",
      {
        style: vue.normalizeStyle($options.styleObj),
        class: vue.normalizeClass(["uni-icons", ["uniui-" + $props.type, $props.customPrefix, $props.customPrefix ? $props.type : ""]]),
        onClick: _cache[0] || (_cache[0] = (...args) => $options._onClick && $options._onClick(...args))
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-d31e1c47"], ["__file", "C:/Users/1/Documents/HBuilderProjects/Diet_Nutrition_GPT/uni_ym/uni_modules/uni-icons/components/uni-icons/uni-icons.vue"]]);
  const _sfc_main$4 = {
    name: "UniBadge",
    emits: ["click"],
    props: {
      type: {
        type: String,
        default: "error"
      },
      inverted: {
        type: Boolean,
        default: false
      },
      isDot: {
        type: Boolean,
        default: false
      },
      maxNum: {
        type: Number,
        default: 99
      },
      absolute: {
        type: String,
        default: ""
      },
      offset: {
        type: Array,
        default() {
          return [0, 0];
        }
      },
      text: {
        type: [String, Number],
        default: ""
      },
      size: {
        type: String,
        default: "small"
      },
      customStyle: {
        type: Object,
        default() {
          return {};
        }
      }
    },
    data() {
      return {};
    },
    computed: {
      width() {
        return String(this.text).length * 8 + 12;
      },
      classNames() {
        const {
          inverted,
          type,
          size,
          absolute
        } = this;
        return [
          inverted ? "uni-badge--" + type + "-inverted" : "",
          "uni-badge--" + type,
          "uni-badge--" + size,
          absolute ? "uni-badge--absolute" : ""
        ].join(" ");
      },
      positionStyle() {
        if (!this.absolute)
          return {};
        let w = this.width / 2, h = 10;
        if (this.isDot) {
          w = 5;
          h = 5;
        }
        const x = `${-w + this.offset[0]}px`;
        const y = `${-h + this.offset[1]}px`;
        const whiteList = {
          rightTop: {
            right: x,
            top: y
          },
          rightBottom: {
            right: x,
            bottom: y
          },
          leftBottom: {
            left: x,
            bottom: y
          },
          leftTop: {
            left: x,
            top: y
          }
        };
        const match = whiteList[this.absolute];
        return match ? match : whiteList["rightTop"];
      },
      dotStyle() {
        if (!this.isDot)
          return {};
        return {
          width: "10px",
          minWidth: "0",
          height: "10px",
          padding: "0",
          borderRadius: "10px"
        };
      },
      displayValue() {
        const {
          isDot,
          text,
          maxNum
        } = this;
        return isDot ? "" : Number(text) > maxNum ? `${maxNum}+` : text;
      }
    },
    methods: {
      onClick() {
        this.$emit("click");
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-badge--x" }, [
      vue.renderSlot(_ctx.$slots, "default", {}, void 0, true),
      $props.text ? (vue.openBlock(), vue.createElementBlock(
        "text",
        {
          key: 0,
          class: vue.normalizeClass([$options.classNames, "uni-badge"]),
          style: vue.normalizeStyle([$options.positionStyle, $props.customStyle, $options.dotStyle]),
          onClick: _cache[0] || (_cache[0] = ($event) => $options.onClick())
        },
        vue.toDisplayString($options.displayValue),
        7
        /* TEXT, CLASS, STYLE */
      )) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const __easycom_1$1 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-c97cb896"], ["__file", "C:/Users/1/Documents/HBuilderProjects/Diet_Nutrition_GPT/uni_ym/uni_modules/uni-badge/components/uni-badge/uni-badge.vue"]]);
  const _sfc_main$3 = {
    name: "UniListItem",
    emits: ["click", "switchChange"],
    props: {
      direction: {
        type: String,
        default: "row"
      },
      title: {
        type: String,
        default: ""
      },
      note: {
        type: String,
        default: ""
      },
      ellipsis: {
        type: [Number, String],
        default: 0
      },
      disabled: {
        type: [Boolean, String],
        default: false
      },
      clickable: {
        type: Boolean,
        default: false
      },
      showArrow: {
        type: [Boolean, String],
        default: false
      },
      link: {
        type: [Boolean, String],
        default: false
      },
      to: {
        type: String,
        default: ""
      },
      showBadge: {
        type: [Boolean, String],
        default: false
      },
      showSwitch: {
        type: [Boolean, String],
        default: false
      },
      switchChecked: {
        type: [Boolean, String],
        default: false
      },
      badgeText: {
        type: String,
        default: ""
      },
      badgeType: {
        type: String,
        default: "success"
      },
      badgeStyle: {
        type: Object,
        default() {
          return {};
        }
      },
      rightText: {
        type: String,
        default: ""
      },
      thumb: {
        type: String,
        default: ""
      },
      thumbSize: {
        type: String,
        default: "base"
      },
      showExtraIcon: {
        type: [Boolean, String],
        default: false
      },
      extraIcon: {
        type: Object,
        default() {
          return {
            type: "",
            color: "#000000",
            size: 20,
            customPrefix: ""
          };
        }
      },
      border: {
        type: Boolean,
        default: true
      },
      customStyle: {
        type: Object,
        default() {
          return {
            padding: "",
            backgroundColor: "#FFFFFF"
          };
        }
      },
      keepScrollPosition: {
        type: Boolean,
        default: false
      }
    },
    watch: {
      "customStyle.padding": {
        handler(padding) {
          if (typeof padding == "number") {
            padding += "";
          }
          let paddingArr = padding.split(" ");
          if (paddingArr.length === 1) {
            const allPadding = paddingArr[0];
            this.padding = {
              "top": allPadding,
              "right": allPadding,
              "bottom": allPadding,
              "left": allPadding
            };
          } else if (paddingArr.length === 2) {
            const [verticalPadding, horizontalPadding] = paddingArr;
            this.padding = {
              "top": verticalPadding,
              "right": horizontalPadding,
              "bottom": verticalPadding,
              "left": horizontalPadding
            };
          } else if (paddingArr.length === 4) {
            const [topPadding, rightPadding, bottomPadding, leftPadding] = paddingArr;
            this.padding = {
              "top": topPadding,
              "right": rightPadding,
              "bottom": bottomPadding,
              "left": leftPadding
            };
          }
        },
        immediate: true
      }
    },
    // inject: ['list'],
    data() {
      return {
        isFirstChild: false,
        padding: {
          top: "",
          right: "",
          bottom: "",
          left: ""
        }
      };
    },
    mounted() {
      this.list = this.getForm();
      if (this.list) {
        if (!this.list.firstChildAppend) {
          this.list.firstChildAppend = true;
          this.isFirstChild = true;
        }
      }
    },
    methods: {
      /**
       * 获取父元素实例
       */
      getForm(name = "uniList") {
        let parent = this.$parent;
        let parentName = parent.$options.name;
        while (parentName !== name) {
          parent = parent.$parent;
          if (!parent)
            return false;
          parentName = parent.$options.name;
        }
        return parent;
      },
      onClick() {
        if (this.to !== "") {
          this.openPage();
          return;
        }
        if (this.clickable || this.link) {
          this.$emit("click", {
            data: {}
          });
        }
      },
      onSwitchChange(e) {
        this.$emit("switchChange", e.detail);
      },
      openPage() {
        if (["navigateTo", "redirectTo", "reLaunch", "switchTab"].indexOf(this.link) !== -1) {
          this.pageApi(this.link);
        } else {
          this.pageApi("navigateTo");
        }
      },
      pageApi(api) {
        let callback = {
          url: this.to,
          success: (res) => {
            this.$emit("click", {
              data: res
            });
          },
          fail: (err) => {
            this.$emit("click", {
              data: err
            });
          }
        };
        switch (api) {
          case "navigateTo":
            uni.navigateTo(callback);
            break;
          case "redirectTo":
            uni.redirectTo(callback);
            break;
          case "reLaunch":
            uni.reLaunch(callback);
            break;
          case "switchTab":
            uni.switchTab(callback);
            break;
          default:
            uni.navigateTo(callback);
        }
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$1);
    const _component_uni_badge = resolveEasycom(vue.resolveDynamicComponent("uni-badge"), __easycom_1$1);
    return vue.openBlock(), vue.createElementBlock("view", {
      class: vue.normalizeClass([{ "uni-list-item--disabled": $props.disabled }, "uni-list-item"]),
      style: vue.normalizeStyle({ "background-color": $props.customStyle.backgroundColor }),
      "hover-class": !$props.clickable && !$props.link || $props.disabled || $props.showSwitch ? "" : "uni-list-item--hover",
      onClick: _cache[1] || (_cache[1] = (...args) => $options.onClick && $options.onClick(...args))
    }, [
      !$data.isFirstChild ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 0,
          class: vue.normalizeClass(["border--left", { "uni-list--border": $props.border }])
        },
        null,
        2
        /* CLASS */
      )) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["uni-list-item__container", { "container--right": $props.showArrow || $props.link, "flex--direction": $props.direction === "column" }]),
          style: vue.normalizeStyle({ paddingTop: $data.padding.top, paddingLeft: $data.padding.left, paddingRight: $data.padding.right, paddingBottom: $data.padding.bottom })
        },
        [
          vue.renderSlot(_ctx.$slots, "header", {}, () => [
            vue.createElementVNode("view", { class: "uni-list-item__header" }, [
              $props.thumb ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "uni-list-item__icon"
              }, [
                vue.createElementVNode("image", {
                  src: $props.thumb,
                  class: vue.normalizeClass(["uni-list-item__icon-img", ["uni-list--" + $props.thumbSize]])
                }, null, 10, ["src"])
              ])) : $props.showExtraIcon ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "uni-list-item__icon"
              }, [
                vue.createVNode(_component_uni_icons, {
                  customPrefix: $props.extraIcon.customPrefix,
                  color: $props.extraIcon.color,
                  size: $props.extraIcon.size,
                  type: $props.extraIcon.type
                }, null, 8, ["customPrefix", "color", "size", "type"])
              ])) : vue.createCommentVNode("v-if", true)
            ])
          ], true),
          vue.renderSlot(_ctx.$slots, "body", {}, () => [
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["uni-list-item__content", { "uni-list-item__content--center": $props.thumb || $props.showExtraIcon || $props.showBadge || $props.showSwitch }])
              },
              [
                $props.title ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 0,
                    class: vue.normalizeClass(["uni-list-item__content-title", [$props.ellipsis !== 0 && $props.ellipsis <= 2 ? "uni-ellipsis-" + $props.ellipsis : ""]])
                  },
                  vue.toDisplayString($props.title),
                  3
                  /* TEXT, CLASS */
                )) : vue.createCommentVNode("v-if", true),
                $props.note ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 1,
                    class: "uni-list-item__content-note"
                  },
                  vue.toDisplayString($props.note),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ],
              2
              /* CLASS */
            )
          ], true),
          vue.renderSlot(_ctx.$slots, "footer", {}, () => [
            $props.rightText || $props.showBadge || $props.showSwitch ? (vue.openBlock(), vue.createElementBlock(
              "view",
              {
                key: 0,
                class: vue.normalizeClass(["uni-list-item__extra", { "flex--justify": $props.direction === "column" }])
              },
              [
                $props.rightText ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 0,
                    class: "uni-list-item__extra-text"
                  },
                  vue.toDisplayString($props.rightText),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true),
                $props.showBadge ? (vue.openBlock(), vue.createBlock(_component_uni_badge, {
                  key: 1,
                  type: $props.badgeType,
                  text: $props.badgeText,
                  "custom-style": $props.badgeStyle
                }, null, 8, ["type", "text", "custom-style"])) : vue.createCommentVNode("v-if", true),
                $props.showSwitch ? (vue.openBlock(), vue.createElementBlock("switch", {
                  key: 2,
                  disabled: $props.disabled,
                  checked: $props.switchChecked,
                  onChange: _cache[0] || (_cache[0] = (...args) => $options.onSwitchChange && $options.onSwitchChange(...args))
                }, null, 40, ["disabled", "checked"])) : vue.createCommentVNode("v-if", true)
              ],
              2
              /* CLASS */
            )) : vue.createCommentVNode("v-if", true)
          ], true)
        ],
        6
        /* CLASS, STYLE */
      ),
      $props.showArrow || $props.link ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
        key: 1,
        size: 16,
        class: "uni-icon-wrapper",
        color: "#bbb",
        type: "arrowright"
      })) : vue.createCommentVNode("v-if", true)
    ], 14, ["hover-class"]);
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-c7524739"], ["__file", "C:/Users/1/Documents/HBuilderProjects/Diet_Nutrition_GPT/uni_ym/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue"]]);
  const _sfc_main$2 = {
    name: "uniList",
    "mp-weixin": {
      options: {
        multipleSlots: false
      }
    },
    props: {
      stackFromEnd: {
        type: Boolean,
        default: false
      },
      enableBackToTop: {
        type: [Boolean, String],
        default: false
      },
      scrollY: {
        type: [Boolean, String],
        default: false
      },
      border: {
        type: Boolean,
        default: true
      },
      renderReverse: {
        type: Boolean,
        default: false
      }
    },
    // provide() {
    // 	return {
    // 		list: this
    // 	};
    // },
    created() {
      this.firstChildAppend = false;
    },
    methods: {
      loadMore(e) {
        this.$emit("scrolltolower");
      },
      scroll(e) {
        this.$emit("scroll", e);
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-list uni-border-top-bottom" }, [
      $props.border ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "uni-list--border-top"
      })) : vue.createCommentVNode("v-if", true),
      vue.renderSlot(_ctx.$slots, "default", {}, void 0, true),
      $props.border ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "uni-list--border-bottom"
      })) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const __easycom_1 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-c2f1266a"], ["__file", "C:/Users/1/Documents/HBuilderProjects/Diet_Nutrition_GPT/uni_ym/uni_modules/uni-list/components/uni-list/uni-list.vue"]]);
  const _sfc_main$1 = {
    data() {
      return {
        title: "个人信息",
        src: ""
      };
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_list_item = resolveEasycom(vue.resolveDynamicComponent("uni-list-item"), __easycom_0);
    const _component_uni_list = resolveEasycom(vue.resolveDynamicComponent("uni-list"), __easycom_1);
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("image", {
          class: "logo",
          src: "/static/image/用户页头像.jpg"
        }),
        vue.createElementVNode("view", { class: "text-area" }, [
          vue.createElementVNode(
            "text",
            { class: "title" },
            vue.toDisplayString($data.title),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createElementVNode("view", null, [
        vue.createVNode(_component_uni_list, null, {
          default: vue.withCtx(() => [
            vue.createVNode(_component_uni_list_item, {
              title: "问卷记录",
              showArrow: "",
              thumb: "/static/image/记录.png",
              "thumb-size": "base",
              clickable: "",
              onClick: _cache[0] || (_cache[0] = () => {
              })
            }),
            vue.createVNode(_component_uni_list_item, {
              title: "清除问卷",
              showArrow: "",
              thumb: "/static/image/laji.png",
              "thumb-size": "base",
              clickable: "",
              onClick: _cache[1] || (_cache[1] = () => {
              })
            })
          ]),
          _: 1
          /* STABLE */
        })
      ])
    ]);
  }
  const PagesMineMine = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "C:/Users/1/Documents/HBuilderProjects/Diet_Nutrition_GPT/uni_ym/pages/mine/mine.vue"]]);
  __definePage("pages/test/test2", PagesTestTest2);
  __definePage("pages/api-use/api-use2", PagesApiUseApiUse2);
  __definePage("pages/test/test", PagesTestTest);
  __definePage("pages/problem/problem", PagesProblemProblem);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/mine/mine", PagesMineMine);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "C:/Users/1/Documents/HBuilderProjects/Diet_Nutrition_GPT/uni_ym/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
