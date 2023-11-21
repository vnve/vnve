import {
  Select,
  Flex,
  Box,
  FormControl,
  FormLabel,
  Button,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure,
  Icon,
  Tooltip,
} from "@chakra-ui/react";
import { DialogueScene } from "@vnve/template";
import { getEditor } from "../../lib/context";
import { Img, Scene } from "@vnve/core";
import AssetLibrary from "../AssetLibrary/AssetLibrary";
import { AssetItem } from "../../lib/assets";
import { useState } from "react";
import IconMoveUp from "~icons/material-symbols/arrow-upward";
import IconMoveDown from "~icons/material-symbols/arrow-downward";
import IconDelete from "~icons/material-symbols/delete-outline-sharp";
import IconEdit from "~icons/material-symbols/edit-square-outline-sharp";
import IconInsert from "~icons/material-symbols/arrow-insert";
import IconMic from "~icons/material-symbols/mic-outline";
import CharacterVoice from "../CharacterVoice/CharacterVoice";
import { LINE_DISPLAY_EFFECT_OPTIONS } from "../../lib/const";

type OpenFromType =
  | "addCharacter"
  | "changeCharacter"
  | "selectBackground"
  | "selectDialog";

export default function DialogueSceneDetail({
  activeScene,
  setActiveScene,
  addSound,
}: {
  activeScene: DialogueScene;
  setActiveScene: React.Dispatch<React.SetStateAction<Scene | undefined>>;
  addSound: (asset: any) => void;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [openAssetFrom, setOpenAssetFrom] = useState<OpenFromType>();
  const [currentTargetIndex, setCurrentTargetIndex] = useState<number>();
  const {
    isOpen: isOpenCV,
    onOpen: onOpenCV,
    onClose: onCloseCV,
  } = useDisclosure();
  const [assetTypeFilter, setAssetTypeFilter] = useState<
    "background" | "character" | "dialog"
  >();

  function focusLine(line: { name: string; content: string }) {
    const editor = getEditor();
    const scene = editor.activeScene as DialogueScene;

    scene.nameText._width = 0;
    scene.nameText._height = 0;
    scene.dialogText._width = 0;
    scene.dialogText._height = 0;
    scene.nameText.text = line.name;
    scene.dialogText.text = line.content;
  }

  function changeLines(
    targetIndex: number,
    value: string,
    type: "name" | "content",
  ) {
    const editor = getEditor();

    const newLines = activeScene.lines.map((line, lineIndex) => {
      if (lineIndex === targetIndex) {
        let newLine = { ...line };

        if (type === "name") {
          newLine = {
            ...line,
            name: value,
          };
        } else {
          newLine = {
            ...line,
            content: value,
          };
        }

        focusLine(newLine);

        return newLine;
      }
      return line;
    });

    (editor.activeScene as DialogueScene).nameText._width = 0;
    (editor.activeScene as DialogueScene).nameText._height = 0;
    (editor.activeScene as DialogueScene).dialogText._width = 0;
    (editor.activeScene as DialogueScene).dialogText._height = 0;
    (editor.activeScene as DialogueScene).setLines(newLines);
    setActiveScene({
      ...activeScene,
      lines: newLines,
      duration: editor.activeScene?.duration,
    } as DialogueScene);
  }

  function deleteLine(targetIndex: number) {
    const editor = getEditor();
    const newLines = activeScene.lines.filter(
      (_line, index) => index !== targetIndex,
    );

    (editor.activeScene as DialogueScene).setLines(newLines);
    setActiveScene({
      ...activeScene,
      lines: newLines,
      duration: editor.activeScene?.duration,
    } as DialogueScene);
  }

  function addLine() {
    const editor = getEditor();
    const newLines = [
      ...activeScene.lines,
      {
        name: "",
        content: "",
      },
    ];

    (editor.activeScene as DialogueScene).setLines(newLines);
    setActiveScene({
      ...activeScene,
      lines: newLines,
      duration: editor.activeScene?.duration,
    } as DialogueScene);
  }

  function moveLineUp(targetIndex: number) {
    const editor = getEditor();
    const newLines = [...(editor!.activeScene as DialogueScene).lines];

    [newLines[targetIndex], newLines[targetIndex - 1]] = [
      newLines[targetIndex - 1],
      newLines[targetIndex],
    ];
    (editor.activeScene as DialogueScene).setLines(newLines);
    setActiveScene({
      ...activeScene,
      lines: newLines,
    } as DialogueScene);
  }

  function moveLineDown(targetIndex: number) {
    const editor = getEditor();
    const newLines = [...(editor!.activeScene as DialogueScene).lines];

    [newLines[targetIndex], newLines[targetIndex + 1]] = [
      newLines[targetIndex + 1],
      newLines[targetIndex],
    ];
    (editor.activeScene as DialogueScene).setLines(newLines);
    setActiveScene({
      ...activeScene,
      lines: newLines,
    } as DialogueScene);
  }

  function insertLine(targetIndex: number) {
    const editor = getEditor();
    const newLines = [...(editor!.activeScene as DialogueScene).lines];

    newLines.splice(targetIndex + 1, 0, {
      name: "",
      content: "",
    });

    (editor.activeScene as DialogueScene).setLines(newLines);
    setActiveScene({
      ...activeScene,
      lines: newLines,
    } as DialogueScene);
  }

  function changeWordsPerMinute(value: string) {
    const editor = getEditor();
    const wordsPerMinute = Number(value);

    (editor.activeScene as DialogueScene).wordsPerMinute = wordsPerMinute;
    (editor.activeScene as DialogueScene).setLines(
      (editor.activeScene as DialogueScene).lines,
    );
    setActiveScene({
      ...activeScene,
      wordsPerMinute,
      duration: editor.activeScene?.duration,
    } as DialogueScene);
  }

  function openAssetLibrary(from: OpenFromType, targetIndex?: number) {
    setOpenAssetFrom(from);
    if (from === "selectBackground") {
      setAssetTypeFilter("background");
    } else if (from === "selectDialog") {
      setAssetTypeFilter("dialog");
    } else if (["addCharacter", "changeCharacter"].includes(from)) {
      setAssetTypeFilter("character");
    }

    if (typeof targetIndex !== "undefined") {
      setCurrentTargetIndex(targetIndex);
    }
    onOpen();
  }

  async function selectBackground(asset: AssetItem) {
    const editor = getEditor();
    const backgroundImg = new Img(asset);

    backgroundImg.load();
    editor.addChildTransformListener(backgroundImg);
    (editor.activeScene as DialogueScene).setBackgroundImg(backgroundImg);
    setActiveScene({
      ...activeScene,
      backgroundImg,
    } as DialogueScene);
  }

  async function removeBackground() {
    const editor = getEditor();

    editor.removeChildTransformListener(
      (editor.activeScene as DialogueScene).backgroundImg!,
    );
    (editor.activeScene as DialogueScene).removeBackgroundImg();
    setActiveScene({
      ...activeScene,
      backgroundImg: undefined,
    } as DialogueScene);
  }

  function addCharacterImg(asset: AssetItem) {
    const editor = getEditor();
    const newImg = new Img(asset);

    newImg.load();
    editor.addChildTransformListener(newImg);
    (editor.activeScene as DialogueScene).addCharacterImg(newImg);
    setActiveScene({
      ...activeScene,
      characterImgs: [...activeScene.characterImgs, newImg],
    } as DialogueScene);
  }

  function changeCharacterImg(asset: AssetItem) {
    if (typeof currentTargetIndex !== "undefined") {
      const editor = getEditor();
      const hitCharacterImg = (editor.activeScene as DialogueScene)
        .characterImgs[currentTargetIndex];

      hitCharacterImg.name = asset.name;
      hitCharacterImg.source = asset.source;
      hitCharacterImg.load();

      setActiveScene({
        ...activeScene,
        characterImgs: activeScene.characterImgs.map((item, index) => {
          if (index === currentTargetIndex) {
            return {
              ...item,
              name: asset.name,
              source: asset.source,
            };
          }
          return item;
        }),
      } as DialogueScene);
    }
  }

  function removeCharacterImg(targetIndex: number) {
    const editor = getEditor();

    const removedChild = (editor.activeScene as DialogueScene).characterImgs[
      targetIndex
    ];

    editor.removeChildTransformListener(removedChild);
    (editor.activeScene as DialogueScene).removeCharacterImg(removedChild);
    setActiveScene({
      ...activeScene,
      characterImgs: activeScene.characterImgs.filter(
        (_item, index) => index !== targetIndex,
      ),
    } as DialogueScene);
  }

  async function selectDialogImg(asset: AssetItem) {
    const editor = getEditor();
    const dialogImg = new Img(asset);

    dialogImg.load();
    editor.addChildTransformListener(dialogImg);
    (editor.activeScene as DialogueScene).setDialogImg(dialogImg);
    setActiveScene({
      ...activeScene,
      dialogImg,
    } as DialogueScene);
  }

  function removeDialogImg() {
    const editor = getEditor();

    editor.removeChildTransformListener(
      (editor.activeScene as DialogueScene).dialogImg!,
    );
    (editor.activeScene as DialogueScene).removeDialogImg();
    setActiveScene({
      ...activeScene,
      dialogImg: undefined,
    } as DialogueScene);
  }

  function onAssetSelect(asset: AssetItem) {
    if (openAssetFrom === "selectBackground") {
      selectBackground(asset);
    } else if (openAssetFrom === "selectDialog") {
      selectDialogImg(asset);
    } else if (openAssetFrom === "addCharacter") {
      addCharacterImg(asset);
    } else if (openAssetFrom === "changeCharacter") {
      changeCharacterImg(asset);
    }
  }

  function openLineCV(targetIndex: number) {
    setCurrentTargetIndex(targetIndex);
    onOpenCV();
  }

  function addLineCV(source: string) {
    const editor = getEditor();
    const hitLine = (editor.activeScene as DialogueScene).lines[
      currentTargetIndex
    ];

    addSound({
      name: `台词${currentTargetIndex + 1}`,
      source,
      start: hitLine.start,
      duration: hitLine.duration,
    });
  }

  function changeLineDisplayEffect(lineDisplayEffect: string) {
    const editor = getEditor();

    (editor.activeScene as DialogueScene).lineDisplayEffect =
      lineDisplayEffect as any;
    (editor.activeScene as DialogueScene).setLines(
      (editor.activeScene as DialogueScene).lines,
    );
    setActiveScene({
      ...activeScene,
      lineDisplayEffect,
    } as DialogueScene);
  }

  return (
    <Flex flexDirection={"column"} gap={6}>
      <FormControl>
        <FormLabel fontSize={"sm"}>对白内容</FormLabel>
        {activeScene.lines.map((line, index) => {
          return (
            <Flex key={index} flexDirection={"column"} gap={1} mb={2}>
              <Textarea
                w={"200px"}
                value={line.name}
                onChange={(event) =>
                  changeLines(index, event.target.value, "name")
                }
                onFocus={() => focusLine(line)}
                placeholder="角色名"
                rows={1}
              ></Textarea>
              <Flex gap={2}>
                <Textarea
                  placeholder="角色台词"
                  rows={4}
                  value={line.content}
                  onChange={(event) =>
                    changeLines(index, event.target.value, "content")
                  }
                  onFocus={() => focusLine(line)}
                ></Textarea>
                <Flex
                  flexDirection={"column"}
                  gap={1}
                  justifyContent={"flex-start"}
                >
                  <Tooltip label="配音">
                    <Box
                      cursor={"pointer"}
                      w={4}
                      h={4}
                      onClick={() => openLineCV(index)}
                    >
                      <Icon w={4} h={4} as={IconMic}></Icon>
                    </Box>
                  </Tooltip>
                  {index !== 0 && (
                    <Tooltip label="上移">
                      <Box
                        cursor={"pointer"}
                        w={4}
                        h={4}
                        onClick={() => moveLineUp(index)}
                      >
                        <Icon w={4} h={4} as={IconMoveUp}></Icon>
                      </Box>
                    </Tooltip>
                  )}
                  {index !== activeScene.lines.length - 1 && (
                    <Tooltip label="下移">
                      <Box
                        cursor={"pointer"}
                        w={4}
                        h={4}
                        onClick={() => moveLineDown(index)}
                      >
                        <Icon w={4} h={4} as={IconMoveDown}></Icon>
                      </Box>
                    </Tooltip>
                  )}
                  <Tooltip label="插入">
                    <Box
                      cursor={"pointer"}
                      w={4}
                      h={4}
                      onClick={() => insertLine(index)}
                    >
                      <Icon w={4} h={4} as={IconInsert}></Icon>
                    </Box>
                  </Tooltip>
                  <Tooltip label="删除">
                    <Box
                      cursor={"pointer"}
                      w={4}
                      h={4}
                      onClick={() => deleteLine(index)}
                    >
                      <Icon w={4} h={4} as={IconDelete}></Icon>
                    </Box>
                  </Tooltip>
                </Flex>
              </Flex>
            </Flex>
          );
        })}
        <Button colorScheme="teal" size="xs" onClick={addLine}>
          新增
        </Button>
      </FormControl>
      <Flex gap={2}>
        <FormControl>
          <FormLabel fontSize={"sm"}>背景图</FormLabel>
          {activeScene.backgroundImg ? (
            <Flex gap={2} alignItems={"center"} fontSize={"sm"} mb={2}>
              {activeScene.backgroundImg.name}
              <Icon
                cursor={"pointer"}
                w={4}
                h={4}
                as={IconEdit}
                onClick={() => openAssetLibrary("selectBackground")}
              ></Icon>
              <Icon
                cursor={"pointer"}
                w={4}
                h={4}
                as={IconDelete}
                onClick={removeBackground}
              ></Icon>
            </Flex>
          ) : (
            <Button
              colorScheme="teal"
              size="xs"
              onClick={() => openAssetLibrary("selectBackground")}
            >
              新增
            </Button>
          )}
        </FormControl>
        <FormControl>
          <FormLabel fontSize={"sm"}>角色立绘</FormLabel>
          {activeScene.characterImgs.map((item, index) => {
            return (
              <Flex
                gap={2}
                alignItems={"center"}
                fontSize={"sm"}
                mb={2}
                key={index}
              >
                {item.name}
                <Icon
                  cursor={"pointer"}
                  w={4}
                  h={4}
                  as={IconEdit}
                  onClick={() => openAssetLibrary("changeCharacter", index)}
                ></Icon>
                <Icon
                  cursor={"pointer"}
                  w={4}
                  h={4}
                  as={IconDelete}
                  onClick={() => removeCharacterImg(index)}
                ></Icon>
              </Flex>
            );
          })}
          <Button
            colorScheme="teal"
            size="xs"
            onClick={() => openAssetLibrary("addCharacter")}
          >
            新增
          </Button>
        </FormControl>
      </Flex>
      <Flex gap={2}>
        <FormControl>
          <FormLabel fontSize={"sm"}>对话框素材图</FormLabel>
          {activeScene.dialogImg ? (
            <Flex alignItems={"center"} fontSize={"sm"} gap={2}>
              {activeScene.dialogImg.name}
              <Icon
                cursor={"pointer"}
                w={4}
                h={4}
                as={IconEdit}
                onClick={() => openAssetLibrary("selectDialog")}
              ></Icon>
              <Icon
                cursor={"pointer"}
                w={4}
                h={4}
                as={IconDelete}
                onClick={removeDialogImg}
              ></Icon>
            </Flex>
          ) : (
            <Button
              colorScheme="teal"
              size="xs"
              onClick={() => openAssetLibrary("selectDialog")}
            >
              新增
            </Button>
          )}
        </FormControl>
        <FormControl>
          <FormLabel fontSize={"sm"}>语速(字/分钟)</FormLabel>
          <NumberInput
            step={100}
            min={0}
            value={activeScene.wordsPerMinute}
            onChange={changeWordsPerMinute}
          >
            <NumberInputField type="number" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      </Flex>

      <Flex gap={2}>
        <FormControl>
          <FormLabel fontSize={"sm"}>台词效果</FormLabel>
          <Select
            value={activeScene.lineDisplayEffect}
            onChange={(event) => changeLineDisplayEffect(event.target.value)}
          >
            {LINE_DISPLAY_EFFECT_OPTIONS.map((option) => {
              return (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              );
            })}
          </Select>
        </FormControl>
        <FormControl></FormControl>
      </Flex>

      <CharacterVoice
        isOpen={isOpenCV}
        onSelect={(source) => addLineCV(source)}
        onClose={onCloseCV}
      ></CharacterVoice>

      <AssetLibrary
        type="image"
        typeFilter={assetTypeFilter}
        isOpen={isOpen}
        onClose={onClose}
        onSelect={onAssetSelect}
      ></AssetLibrary>
    </Flex>
  );
}
