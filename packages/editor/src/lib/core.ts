import { DBAsset, DBAssetType, getAssetByName, getAssetSourceURL } from "@/db";
import {
  Editor,
  LayerZIndex,
  Sound,
  Sprite,
  AnimatedGIF,
  Video,
  Text,
  createDialogueScene,
} from "@vnve/core";

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

function parseNames(str: string) {
  let name = str;
  let stateName;
  const match = str.match(/^(.+)\[(.+)\]$/);

  if (match) {
    name = match[1];
    stateName = match[2];
  }

  return {
    name,
    stateName,
  };
}

export async function text2Scenes(
  text,
  editor: Editor,
  ignoreAssetMatchError = false,
) {
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
  const screenplay = [];

  paragraphs.forEach((item) => {
    if (item.name === "标题") {
      screenplay.push({
        name: item.value,
        background: "",
        dialogues: [],
      });
    } else if (item.name === "场景") {
      // 缺失标题时，按照场景分隔
      if (
        !screenplay[screenplay.length - 1] ||
        screenplay[screenplay.length - 1].background
      ) {
        screenplay.push({
          name: "",
          background: "",
          dialogues: [],
        });
      }

      screenplay[screenplay.length - 1].background = item.value;
    } else {
      screenplay[screenplay.length - 1].dialogues.push(item);
    }
  });

  console.log("screenplay", screenplay);

  for (const item of screenplay) {
    try {
      const scene = createDialogueScene();

      scene.label = item.name;

      editor.addScene(scene);
      editor.setActiveScene(scene);

      if (item.background) {
        const { name, stateName } = parseNames(item.background);
        const asset = await getAssetByName(
          name,
          stateName,
          DBAssetType.Background,
        );
        if (asset) {
          const background = await createSprite(asset, editor);

          editor.addChild(background);
        } else {
          const tip = `素材库中没有找到名称为"${name}${
            stateName ? `[${stateName}]` : ""
          }"的背景素材`;

          if (ignoreAssetMatchError) {
            console.warn(tip);
          } else {
            throw new Error(tip);
          }
        }
      }

      let characterIndex = 1;
      const characterList = new Set();
      item.dialogues.forEach((dialogue) => {
        const { name } = parseNames(dialogue.name);

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

        if (dialogue.name === "旁白") {
          speaker.speakerTargetName = "Narrator";
        } else {
          const { name, stateName } = parseNames(dialogue.name);
          const asset = await getAssetByName(
            name,
            stateName,
            DBAssetType.Character,
          );
          const tip = `素材库中没有找到名称为"${name}${
            stateName ? `[${stateName}]` : ""
          }"的角色素材`;

          if (asset) {
            const speakerSprite = scene.getChildByLabel(name) as Sprite;

            // 需要判断下此时场景中是否存在添加过的角色
            if (speakerSprite) {
              speaker.speakerTargetName = speakerSprite.name;
              speaker.name = speakerSprite.label;

              // 存在状态名，需要插入一条切换指令
              if (stateName) {
                const states = asset.states;
                const state =
                  states.find((state) => state.id === asset.stateId) ??
                  states[0];

                changeSourceDirective = {
                  type: "directive",
                  value: {
                    directive: "ChangeSource",
                    params: {
                      targetName: speakerSprite.name,
                      source: getAssetSourceURL(state),
                    },
                    label: `变更:${speakerSprite.label}:${stateName}`,
                  },
                  children: [
                    {
                      text: "",
                    },
                  ],
                };
              }
            } else {
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
            if (ignoreAssetMatchError) {
              console.warn(tip);
            } else {
              throw new Error(tip);
            }
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
                  text: dialogue.value,
                },
              ],
            },
          ],
        });
      }
    } catch (error) {
      throw new Error(`${item.name}中存在语法错误：${error.message}`);
    }
  }
}
