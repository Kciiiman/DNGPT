"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      title: "个人信息",
      src: ""
    };
  }
};
if (!Array) {
  const _easycom_uni_list_item2 = common_vendor.resolveComponent("uni-list-item");
  const _easycom_uni_list2 = common_vendor.resolveComponent("uni-list");
  (_easycom_uni_list_item2 + _easycom_uni_list2)();
}
const _easycom_uni_list_item = () => "../../uni_modules/uni-list/components/uni-list-item/uni-list-item.js";
const _easycom_uni_list = () => "../../uni_modules/uni-list/components/uni-list/uni-list.js";
if (!Math) {
  (_easycom_uni_list_item + _easycom_uni_list)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.title),
    b: common_vendor.o(() => {
    }),
    c: common_vendor.p({
      title: "问卷记录",
      showArrow: true,
      thumb: "/static/image/记录.png",
      ["thumb-size"]: "base",
      clickable: true
    }),
    d: common_vendor.o(() => {
    }),
    e: common_vendor.p({
      title: "清除问卷",
      showArrow: true,
      thumb: "/static/image/laji.png",
      ["thumb-size"]: "base",
      clickable: true
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "C:/Users/1/Documents/HBuilderProjects/Diet_Nutrition_GPT/uni_ym/pages/mine/mine.vue"]]);
wx.createPage(MiniProgramPage);
