import {
  DBAsset,
  DBAssetType,
  getAssetById,
  getAssetByName,
  getAssetSourceURL,
  getAssetSourceURLByAsset,
  importAssetToProjectTmp,
  NARRATOR_ASSET_ID,
  templateDB,
} from "@/db";
import {
  Editor,
  LayerZIndex,
  Sound,
  Sprite,
  AnimatedGIF,
  Video,
  Text,
  createDialogueScene,
  Scene,
  createTitleScene,
  createMonologueScene,
} from "@vnve/core";
import { fetchAudioFile, linesToText } from "./utils";
import { longTextSynthesis, NONE_VOICE } from "./tts";

export async function createSprite(asset: DBAsset, editor: Editor) {
  const states = asset.states;
  const state = states.find((state) => state.id === asset.stateId) ?? states[0];
  let sprite: Sprite | AnimatedGIF | Video;

  if (state.ext === "gif") {
    sprite = new AnimatedGIF({
      source: getAssetSourceURL(state),
    });
  } else if (state.ext === "mp4") {
    sprite = new Video({
      source: getAssetSourceURL(state),
    });
  } else {
    sprite = new Sprite({
      source: getAssetSourceURL(state),
    });
  }

  sprite.label = asset.name;
  sprite.assetID = asset.id;
  sprite.assetType = asset.type;

  await sprite.load();

  // 默认设置（大小，层级，位置）
  if (asset.type === DBAssetType.Character) {
    sprite.zIndex = LayerZIndex.Character;
    sprite.x = editor.options.width / 2 - sprite.width / 2;
    sprite.y = editor.options.height - sprite.height;
  } else if (asset.type === DBAssetType.Background) {
    sprite.zIndex = LayerZIndex.Background;
    sprite.width = editor.options.width;
    sprite.height = editor.options.height;
  } else if (asset.type === DBAssetType.Dialog) {
    sprite.zIndex = LayerZIndex.Dialog;
    sprite.x = editor.options.width / 2 - sprite.width / 2;
    sprite.y = editor.options.height - sprite.height;
  }

  return sprite;
}

export function createText(editor: Editor) {
  const text = new Text("自定义文案", {
    fill: 0xffffff,
    breakWords: true,
    wordWrap: true,
    wordWrapWidth: 1600,
    fontSize: 60,
    leading: 15,
  });

  text.x = editor.options.width / 2 - text.width / 2;
  text.y = editor.options.height / 2 - text.height / 2;
  text.zIndex = LayerZIndex.Text;
  text.label = "自定义文案" + text.name;

  return text;
}

export function createSound(asset: DBAsset) {
  const states = asset.states;
  const state = states.find((state) => state.id === asset.stateId) ?? states[0];
  const sound = new Sound({
    source: getAssetSourceURL(state),
  });

  sound.label = state.name; // 音频直接使用state的name
  sound.assetID = asset.id;
  sound.assetType = asset.type;

  return sound;
}

let disableAudio = false;

export function setDisableAudio(value: boolean) {
  disableAudio = value;
}

export function getDisableAudio() {
  return disableAudio;
}

function parseName(str: string) {
  let name = str;
  let state = "";
  const match = str.match(/^(.+)\[(.+)\]$/);

  if (match) {
    name = match[1];
    state = match[2];
  }

  return {
    name,
    state,
  };
}

interface StoryCharacter {
  /**
   * 角色名称或者旁白
   */
  name: string;
  /**
   * 角色状态
   */
  state: string;
}

interface StoryDialogue {
  /**
   * 发言角色，单个场景中发言的角色不要超过 3 个，假如超过 3 个请拆分成多个场景
   */
  character: StoryCharacter;
  /**
   * 角色台词，如果台词中存在双引号请转换成单引号
   */
  line: string;
}

interface StoryBackground {
  /**
   * 背景名称
   */
  name: string;
  /**
   * 背景状态
   */
  state: string;
}

export interface StoryScene {
  /**
   * 场景名称，当背景发生变化时切换场景
   */
  name: string;
  /**
   * 场景类型, 默认为对话场景
   */
  type?: string;
  /**
   * 背景
   */
  background: StoryBackground;
  /**
   * 场景对话列表
   */
  dialogues: StoryDialogue[];
}

export function story2Text(story: StoryScene[]) {
  const genStateStr = (name: string, state: string) => {
    return state ? `${name}[${state}]` : name;
  };

  return story
    .map((scene) => {
      const paragraphs = [];

      if (scene.name) {
        paragraphs.push(`标题\n${scene.name}`);
      }

      paragraphs.push(
        `场景\n${genStateStr(scene.background.name, scene.background.state)}`,
      );

      scene.dialogues.forEach((dialogue) => {
        const { name, state } = dialogue.character;

        paragraphs.push(`${genStateStr(name, state)}\n${dialogue.line}`);
      });

      return paragraphs.join("\n\n");
    })
    .join("\n\n\n");
}

export function text2Story(text): StoryScene[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .filter((item) => item.trim() !== "")
    .map((item) => {
      const [name, ...values] = item.split("\n");
      return {
        name,
        value: values.join("\n"), // 换行的台词重新组合成value
      };
    });
  const story: StoryScene[] = [];

  paragraphs.forEach((item) => {
    if (item.name === "标题") {
      story.push({
        name: item.value,
        background: {
          name: "",
          state: "",
        },
        dialogues: [],
      });
    } else if (/场景(\[.+\])?/.test(item.name)) {
      const type = item.name.match(/场景(\[.+\])?/)[1]?.replace(/\[|\]/g, "");
      // 缺失标题时，按照场景分隔
      if (!story[story.length - 1]) {
        story.push({
          name: "",
          type,
          background: {
            name: "",
            state: "",
          },
          dialogues: [],
        });
      }

      story[story.length - 1].type = type;
      story[story.length - 1].background = parseName(item.value);
    } else {
      story[story.length - 1].dialogues.push({
        character: parseName(item.name),
        line: item.value,
      });
    }
  });

  return story;
}

export async function parseStory(story: StoryScene[]) {
  const characters = new Set<string>();
  const backgrounds = new Set<string>();

  story.forEach((scene) => {
    scene.dialogues.forEach((dialogue) => {
      if (dialogue.character.name !== "旁白") {
        characters.add(dialogue.character.name);
      }
    });

    backgrounds.add(scene.background.name);
  });

  const characterAssetMap: Record<string, DBAsset> = {};
  const backgroundAssetMap: Record<string, DBAsset> = {};

  for (const name of characters) {
    characterAssetMap[name] = await getAssetByName(
      name,
      undefined,
      DBAssetType.Character,
    );
  }

  for (const name of backgrounds) {
    backgroundAssetMap[name] = await getAssetByName(
      name,
      undefined,
      DBAssetType.Background,
    );
  }

  return {
    characterAssetMap,
    backgroundAssetMap,
  };
}

function getAssetState(asset: DBAsset, stateName: string) {
  return (
    asset.states.find((state) => state.name === stateName) ||
    asset.states.find((state) => state.id === asset.stateId) ||
    asset.states[0]
  );
}

export async function story2Scenes(
  story: StoryScene[],
  editor: Editor,
  characterAssetMap: Record<string, DBAsset>,
  backgroundAssetMap: Record<string, DBAsset>,
) {
  for (const item of story) {
    let scene: Scene;
    if (item.type) {
      const typeMap = {
        标题: createTitleScene,
        独白: createMonologueScene,
        对话: createDialogueScene,
      };
      let createScene = typeMap[item.type];

      if (!createScene) {
        try {
          const templateItem = await templateDB
            .where("name")
            .equals(item.type)
            .first();
          const newScene = await Scene.fromJSON(
            JSON.parse(templateItem.content),
            false,
          );
          createScene = () => {
            return newScene;
          };
        } catch (error) {
          console.error("未找到对应的模版场景", error);
          createScene = createDialogueScene;
        }
      }

      scene = createScene();
    } else {
      scene = createDialogueScene();
    }

    scene.label = item.name;

    editor.addScene(scene);
    editor.setActiveScene(scene);

    if (item.background) {
      const { name, state } = item.background;
      const asset = backgroundAssetMap[name];

      if (asset) {
        const hitState = getAssetState(asset, state);
        asset.name = name; // 将素材库中的素材名修改为背景名称
        asset.stateId = hitState.id;
        const background = await createSprite(asset, editor);

        editor.addChild(background);
      }
    }

    let characterIndex = 1;
    const characterList = new Set();
    item.dialogues.forEach((dialogue) => {
      const { name } = dialogue.character;

      if (name !== "旁白") {
        characterList.add(name);
      }
    });
    const characterTotal = characterList.size;

    for (const dialogue of item.dialogues) {
      const speaker = {
        targetName: "", // 暂未使用, 目前都使用的Scene.config中targetName
        speakerTargetName: "",
        name: "",
      };
      let changeSourceDirective;

      if (dialogue.character.name === "旁白") {
        speaker.speakerTargetName = "Narrator";
      } else {
        const { name, state } = dialogue.character;
        const asset = characterAssetMap[name];

        if (asset) {
          const speakerSprite = scene.getChildByLabel(name) as Sprite;

          // 需要判断下此时场景中是否存在添加过的角色
          if (speakerSprite) {
            speaker.speakerTargetName = speakerSprite.name;
            speaker.name = speakerSprite.label;

            // 存在状态名，并且能够从素材中找到对应的状态
            // 则插入一条切换指令
            if (state && asset.states.find((item) => item.name === state)) {
              const hitState = getAssetState(asset, state);

              changeSourceDirective = {
                type: "directive",
                value: {
                  directive: "ChangeSource",
                  params: {
                    targetName: speakerSprite.name,
                    source: getAssetSourceURL(hitState),
                  },
                  label: `变更:${speakerSprite.label}:${state}`,
                },
                children: [
                  {
                    text: "",
                  },
                ],
              };
            }
          } else {
            const hitState = getAssetState(asset, state);
            asset.stateId = hitState.id;
            asset.name = name; // 将素材库中的素材名修改为角色名称
            const newSpeakerSprite = await createSprite(asset, editor);

            // 根据角色人数，自动调整位置
            newSpeakerSprite.x =
              (editor.options.width / (characterTotal + 1)) * characterIndex -
              newSpeakerSprite.width / 2;

            characterIndex++;

            editor.addChild(newSpeakerSprite);
            speaker.speakerTargetName = newSpeakerSprite.name;
            speaker.name = newSpeakerSprite.label;
          }
        } else {
          speaker.name = name;
        }
      }

      let directiveChildren = [];

      if (changeSourceDirective) {
        directiveChildren = [
          {
            text: "",
          },
          changeSourceDirective,
          {
            text: "",
          },
        ];
      }

      editor.addDialogue({
        speak: {
          speaker,
        },
        lines: [
          {
            type: "p",
            children: [
              ...directiveChildren,
              {
                text: dialogue.line,
              },
            ],
          },
        ],
      });
    }
  }
}
export async function genTTS({
  lines,
  editor,
  project,
  speak,
  ttsSettings,
}): Promise<{
  sound: Sound;
  url: string;
}> {
  if (!ttsSettings || !ttsSettings.appid || !ttsSettings.token) {
    throw new Error("请先完成语音合成设置");
  }

  const speakerTargetName = speak.speaker.speakerTargetName;
  let speakerAssetID;

  if (speakerTargetName === "Narrator") {
    speakerAssetID = NARRATOR_ASSET_ID;
  } else {
    const speakerSprite = editor.activeScene.getChildByName(
      speakerTargetName,
    ) as Sprite;
    speakerAssetID = speakerSprite.assetID;
  }

  const speakerAsset = await getAssetById(speakerAssetID);
  const voice = speakerAsset.voice;

  if (!voice) {
    throw new Error(`当前角色没有配置音色, 请在素材库中先配置音色`);
  }

  if (voice === NONE_VOICE) {
    throw {
      voice,
      message: "当前角色音色配置为无，无法合成语音， 请在素材库中修改音色",
    };
  }

  // 更新前，假如已经有配音，先从场景中删除
  if (speak.voice?.targetName) {
    editor.removeSoundByName(speak.voice.targetName);
  }

  const text = linesToText(lines);

  try {
    const result = await longTextSynthesis({
      token: ttsSettings.token,
      appid: ttsSettings.appid,
      text,
      voiceType: voice,
    });
    const file = await fetchAudioFile(result.audio_url, text.slice(0, 6));
    const soundAsset = await importAssetToProjectTmp(
      project.id,
      DBAssetType.Audio,
      file,
    );
    const sound = createSound(soundAsset);

    editor.addSound(sound);
    const url = getAssetSourceURLByAsset(soundAsset);

    return {
      sound,
      url,
    };
  } catch (error) {
    console.error(error);
    throw new Error(`${text.slice(0, 6)}... 语音合成失败: ${error.message}`);
  }
}
