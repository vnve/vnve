export interface StorybookI {
  id: number
  name: string
  cover: string
  characterList: {
    id: number
    name: string
    sex: 'male' | 'female'
    profession: string
    portrait: string
    background: string
    isShow: boolean
    introduce?: string
  }[]
  sceneList: {
    name: string
    background: string
  }[]
  presetType: 0
  screenplay: string
}
const storybookMaterialMap:Record<string, string> = {}
export function setStorybookMaterialMap(map: Record<string, string>) {
  Object.keys(map).forEach(key => {
    storybookMaterialMap[key] = map[key]
  })
}
function getMaterial(key: string) {
  return storybookMaterialMap[key] || ''
}

const storybookList: StorybookI[] = [{
  id: 0,
  presetType: 0,
  name: '完美修仙',
  cover: getMaterial('0-cover'),
  screenplay: '',
  sceneList: [],
  characterList: [{
    id: 0,
    name: 'xx',
    sex: 'male',
    profession: '',
    portrait: '',
    background: '',
    isShow: true
  }]
}, {
  id: 1,
  presetType: 0,
  name: '《午夜凶铃》',
  cover: getMaterial('1-cover'),
  screenplay: '《午夜凶铃》发生在一个古老的别墅里，一位名叫周盈的女性邀请了一群人前来参加她的生日派对。然而，在派对开始之前，周盈突然失踪，大家开始在别墅中四处寻找她的踪迹。就在此时，别墅的灯光闪烁，传来一声未曾听见的电话铃声，而铃声的来源似乎是来自周盈失踪前放下的电话。随着大家深入调查，大家发现这个别墅似乎隐藏着某种恐怖的秘密，而每个人都难逃被卷入其中的命运。以下是人物介绍: 周盈：失踪的生日主角，外表柔弱，但背后却藏有许多不为人知的秘密。杨晓晨：周盈的朋友，一名从事广告设计的女性，性格开朗，却总感觉有些神经质。陈俊宏：周盈的丈夫，外表成熟稳重，但内心充满了野心，和周盈之间的关系颇为复杂。李云飞：周盈的前男友，经营着一家公司，因周盈的失踪而显得焦虑不安。许琳：周盈的同事，一位单纯而美丽的女性，似乎总是充满好奇心，但也有一些隐秘的动机。张大伟：一名警察，受命调查周盈失踪案，拥有敏锐的直觉，但他与案件似乎有着复杂的关系',
  sceneList: [
    {
      name: '别墅大厅',
      background: getMaterial('1-scene-0')
    },
    {
      name: '别墅厨房',
      background: getMaterial('1-scene-1')
    },
    {
      name: '别墅张大伟房间',
      background: getMaterial('1-scene-2')
    },
    {
      name: '别墅周盈房间',
      background: getMaterial('1-scene-3')
    },
    {
      name: '别墅陈俊宏房间',
      background: getMaterial('1-scene-4')
    },
    {
      name: '别墅杨晓晨房间',
      background: getMaterial('1-scene-5')
    },
    {
      name: '别墅李云飞房间',
      background: getMaterial('1-scene-6')
    },
    {
      name: '别墅许琳房间',
      background: getMaterial('1-scene-7')
    },
  ],
  characterList: [{
    id: 0,
    name: '张大伟',
    sex: 'male',
    profession: '',
    portrait: getMaterial('1-character-0-pt'),
    background: getMaterial('1-character-0-bg'),
    isShow: true
  }, {
    id: 1,
    name: '周盈',
    sex: 'female',
    profession: '',
    portrait: getMaterial('1-character-1-pt'),
    background: getMaterial('1-character-1-bg'),
    isShow: false
  }, {
    id: 2,
    name: '陈俊宏',
    sex: 'male',
    profession: '',
    portrait: getMaterial('1-character-2-pt'),
    background: getMaterial('1-character-2-bg'),
    isShow: true
  }, {
    id: 3,
    name: '杨晓晨',
    sex: 'female',
    profession: '',
    portrait: getMaterial('1-character-3-pt'),
    background: getMaterial('1-character-3-bg'),
    isShow: true
  }, {
    id: 4,
    name: '李云飞',
    sex: 'male',
    profession: '',
    portrait: getMaterial('1-character-4-pt'),
    background: getMaterial('1-character-4-bg'),
    isShow: false
  }, {
    id: 5,
    name: '许琳',
    sex: 'female',
    profession: '',
    portrait: getMaterial('1-character-5-pt'),
    background: getMaterial('1-character-5-bg'),
    isShow: true
  }]
}]
function getPreset(storybook: StorybookI, character: StorybookI['characterList'][0]) {
  return `请你扮演一个文字冒险游戏，这是游戏背景：${storybook.screenplay}。我将扮演${character.name}。游戏的场景只有${storybook.sceneList.map(item => item.name).join('、')}。所有角色名请使用中文，旁白内容和角色台词需要足够的丰富，有趣，充满悬疑色彩。请返回导向最终结局的下一个关键节点，返回的格式参考如下：
  场景
  （场景名称）
  旁白
  （旁白内容）
  角色
  （角色台词）
  `
}
export {
  storybookList,
  getPreset
}
