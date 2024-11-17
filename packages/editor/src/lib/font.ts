/**
 * code from https://stackoverflow.com/questions/3368837/list-every-font-a-users-browser-can-display
 */
const Detector = function () {
  // a font will be compared against all the three default fonts.
  // and if it doesn't match all 3 then that font is not available.
  const baseFonts = ["monospace", "sans-serif", "serif"];

  //we use m or w because these two characters take up the maximum width.
  // And we use a LLi so that the same matching fonts can get separated
  const testString = "mmmmmmmmmmlli";

  //we test using 72px font size, we may use any size. I guess larger the better.
  const testSize = "72px";

  const h = document.getElementsByTagName("body")[0];

  // create a SPAN in the document to get the width of the text we use to test
  const s = document.createElement("span");
  s.style.fontSize = testSize;
  s.innerHTML = testString;
  const defaultWidth = {};
  const defaultHeight = {};
  for (const index in baseFonts) {
    //get the default width for the three base fonts
    s.style.fontFamily = baseFonts[index];
    h.appendChild(s);
    defaultWidth[baseFonts[index]] = s.offsetWidth; //width for the default font
    defaultHeight[baseFonts[index]] = s.offsetHeight; //height for the defualt font
    h.removeChild(s);
  }

  function detect(font) {
    let detected = false;
    for (const index in baseFonts) {
      s.style.fontFamily = font + "," + baseFonts[index]; // name of the font along with the base font for fallback.
      h.appendChild(s);
      const matched =
        s.offsetWidth != defaultWidth[baseFonts[index]] ||
        s.offsetHeight != defaultHeight[baseFonts[index]];
      h.removeChild(s);
      detected = detected || matched;
    }
    return detected;
  }

  this.detect = detect;
};

const FONT_DATA = {
  windows: [
    {
      ch: "宋体",
      en: "SimSun",
    },
    {
      ch: "黑体",
      en: "SimHei",
    },
    {
      ch: "微软雅黑",
      en: "Microsoft Yahei",
    },
    {
      ch: "微软正黑体",
      en: "Microsoft JhengHei",
    },
    {
      ch: "楷体",
      en: "KaiTi",
    },
    {
      ch: "新宋体",
      en: "NSimSun",
    },
    {
      ch: "仿宋",
      en: "FangSong",
    },
  ],
  "OS X": [
    {
      ch: "苹方",
      en: "PingFang SC",
    },
    {
      ch: "冬青黑体简",
      en: "Hiragino Sans GB",
    },
    {
      ch: "兰亭黑-简",
      en: "Lantinghei SC",
    },
    {
      ch: "翩翩体-简",
      en: "Hanzipen SC",
    },
    {
      ch: "手札体-简",
      en: "Hannotate SC",
    },
    {
      ch: "宋体-简",
      en: "Songti SC",
    },
    {
      ch: "娃娃体-简",
      en: "Wawati SC",
    },
    {
      ch: "魏碑-简",
      en: "Weibei SC",
    },
    {
      ch: "行楷-简",
      en: "Xingkai SC",
    },
    {
      ch: "雅痞-简",
      en: "Yapi SC",
    },
    {
      ch: "圆体-简",
      en: "Yuanti SC",
    },
  ],
  office: [
    {
      ch: "幼圆",
      en: "YouYuan",
    },
    {
      ch: "隶书",
      en: "LiSu",
    },
    {
      ch: "华文细黑",
      en: "STXihei",
    },
    {
      ch: "华文黑体",
      en: "STHeiti",
    },
    {
      ch: "华文楷体",
      en: "STKaiti",
    },
    {
      ch: "华文宋体",
      en: "STSong",
    },
    {
      ch: "华文仿宋",
      en: "STFangsong",
    },
    {
      ch: "华文中宋",
      en: "STZhongsong",
    },
    {
      ch: "华文彩云",
      en: "STCaiyun",
    },
    {
      ch: "华文琥珀",
      en: "STHupo",
    },
    {
      ch: "华文新魏",
      en: "STXinwei",
    },
    {
      ch: "华文隶书",
      en: "STLiti",
    },
    {
      ch: "华文行楷",
      en: "STXingkai",
    },
    {
      ch: "方正舒体",
      en: "FZShuTi",
    },
    {
      ch: "方正姚体",
      en: "FZYaoti",
    },
  ],
  open: [
    {
      ch: "思源黑体",
      en: "Source Han Sans CN",
    },
    {
      ch: "思源宋体",
      en: "Source Han Serif SC",
    },
    {
      ch: "文泉驿微米黑",
      en: "WenQuanYi Micro Hei",
    },
    {
      ch: "霞鹜文楷",
      en: "LXGW WenKai",
    },
    {
      ch: "方舟像素",
      en: "Ark Pixel 12px Monospaced zh_cn",
    },
    {
      ch: "DW Pica Roman V",
      en: "DW Pica Roman V",
    },
  ],
};

const fontDetecter = new Detector();

export const SUPPORTED_FONT_FAMILY_LIST = [{ ch: "Arial", en: "Arial" }].concat(
  [
    ...FONT_DATA["OS X"],
    ...FONT_DATA.windows,
    ...FONT_DATA.open,
    ...FONT_DATA.office,
  ].filter((item) => fontDetecter.detect(item.en)),
);

export enum SUPPORTED_FONT_WEIGHT {
  NORMAL = "normal",
  BOLD = "bold",
}

export enum SUPPORTED_FONT_STYLE {
  NORMAL = "normal",
  ITALIC = "italic",
}

export async function loadFont(
  fontName: string,
  fontSource: string | ArrayBuffer,
) {
  const fontFile = new FontFace(
    fontName,
    typeof fontSource === "string" ? `url(${fontSource})` : fontSource,
  );
  document.fonts.add(fontFile);
  await fontFile.load();
}
