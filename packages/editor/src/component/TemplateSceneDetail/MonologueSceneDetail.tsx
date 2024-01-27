import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Icon,
  Button,
  Tooltip,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure,
  Select,
  Text,
} from "@chakra-ui/react";
import { MonologueScene } from "@vnve/template";
import { EditorContext, getEditor } from "../../lib/context";
import { Img, Scene } from "@vnve/core";
import AssetLibrary from "../AssetLibrary/AssetLibrary";
import { AssetItem } from "../../lib/assets";
import IconMoveUp from "~icons/material-symbols/arrow-upward";
import IconMoveDown from "~icons/material-symbols/arrow-downward";
import IconDelete from "~icons/material-symbols/delete-outline-sharp";
import IconEdit from "~icons/material-symbols/edit-square-outline-sharp";
import IconInsert from "~icons/material-symbols/arrow-insert";
import IconMic from "~icons/material-symbols/mic-outline";
import CharacterVoice from "../CharacterVoice/CharacterVoice";
import { useContext, useState } from "react";
import {
  LINE_DISPLAY_EFFECT_OPTIONS,
  setDefaultLineDisplayEffect,
  setDefaultWordsPerMinute,
} from "../../lib/const";

export default function MonologueSceneDetail({
  activeScene,
  setActiveScene,
  addSound,
  disabledAudio,
}: {
  activeScene: MonologueScene;
  setActiveScene: React.Dispatch<React.SetStateAction<Scene | undefined>>;
  addSound: (asset: any) => void;
  disabledAudio: boolean;
}) {
  const { setActiveChild } = useContext(EditorContext);
  const [currentTargetIndex, setCurrentTargetIndex] = useState<number>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenCV,
    onOpen: onOpenCV,
    onClose: onCloseCV,
  } = useDisclosure();
  const [currentLinePosition, setCurrentLinePosition] = useState({
    lineIndex: -1,
    positionStartTime: 0,
  });

  function focusLine(value: string) {
    const editor = getEditor();
    const scene = editor.activeScene as MonologueScene;

    if (scene.lineText) {
      scene.lineText._width = 0;
      scene.lineText._height = 0;
      scene.lineText.text = value;
    }

    // reset line position
    setCurrentLinePosition({
      lineIndex: -1,
      positionStartTime: 0,
    });
  }

  function selectLine(
    targetIndex: number,
    e: React.SyntheticEvent<HTMLTextAreaElement, Event>,
  ) {
    if (e.nativeEvent.type === "mouseup") {
      const editor = getEditor();
      const scene = editor.activeScene as MonologueScene;
      const positionStartTime = scene.getLinePositionStartTime(
        targetIndex,
        e.currentTarget.selectionStart,
      );

      setCurrentLinePosition({
        lineIndex: targetIndex,
        positionStartTime,
      });
    }
  }

  function changeLines(targetIndex: number, value: string) {
    const editor = getEditor();

    const newLines = activeScene.lines.map((line, lineIndex) => {
      if (lineIndex === targetIndex) {
        focusLine(value);
        return {
          content: value,
        };
      }
      return line;
    });

    const scene = editor.activeScene as MonologueScene;

    if (scene.lineText) {
      scene.lineText._width = 0;
      scene.lineText._height = 0;
    }

    scene.setLines(newLines);
    setActiveScene({
      ...activeScene,
      lines: newLines,
      duration: editor.activeScene?.duration,
    } as MonologueScene);
  }

  function deleteLine(targetIndex: number) {
    const editor = getEditor();
    const newLines = activeScene.lines.filter(
      (_line, index) => index !== targetIndex,
    );

    (editor.activeScene as MonologueScene).setLines(newLines);
    setActiveScene({
      ...activeScene,
      lines: newLines,
      duration: editor.activeScene?.duration,
    } as MonologueScene);
  }

  function addLine() {
    const editor = getEditor();
    const newLines = [
      ...activeScene.lines,
      {
        content: "",
      },
    ];

    (editor.activeScene as MonologueScene).setLines(newLines);
    setActiveScene({
      ...activeScene,
      lines: newLines,
      duration: editor.activeScene?.duration,
    } as MonologueScene);
  }

  function moveLineUp(targetIndex: number) {
    const editor = getEditor();
    const newLines = [...(editor!.activeScene as MonologueScene).lines];

    [newLines[targetIndex], newLines[targetIndex - 1]] = [
      newLines[targetIndex - 1],
      newLines[targetIndex],
    ];
    (editor.activeScene as MonologueScene).setLines(newLines);
    setActiveScene({
      ...activeScene,
      lines: newLines,
    } as MonologueScene);
  }

  function moveLineDown(targetIndex: number) {
    const editor = getEditor();
    const newLines = [...(editor!.activeScene as MonologueScene).lines];

    [newLines[targetIndex], newLines[targetIndex + 1]] = [
      newLines[targetIndex + 1],
      newLines[targetIndex],
    ];
    (editor.activeScene as MonologueScene).setLines(newLines);
    setActiveScene({
      ...activeScene,
      lines: newLines,
    } as MonologueScene);
  }

  function insertLine(targetIndex: number) {
    const editor = getEditor();
    const newLines = [...(editor!.activeScene as MonologueScene).lines];

    newLines.splice(targetIndex + 1, 0, {
      content: "",
    });

    (editor.activeScene as MonologueScene).setLines(newLines);
    setActiveScene({
      ...activeScene,
      lines: newLines,
    } as MonologueScene);
  }

  function changeWordsPerMinute(value: string) {
    const editor = getEditor();
    const wordsPerMinute = Number(value);

    setDefaultWordsPerMinute(wordsPerMinute);

    (editor.activeScene as MonologueScene).wordsPerMinute = wordsPerMinute;
    (editor.activeScene as MonologueScene).setLines(
      (editor.activeScene as MonologueScene).lines,
    );
    setActiveScene({
      ...activeScene,
      wordsPerMinute,
      duration: editor.activeScene?.duration,
    } as MonologueScene);
  }

  async function selectBackground(asset: AssetItem) {
    const editor = getEditor();
    const backgroundImg = new Img(asset);

    backgroundImg.load();
    editor.addChildTransformListener(backgroundImg);
    (editor.activeScene as MonologueScene).setBackgroundImg(backgroundImg);
    setActiveScene({
      ...activeScene,
      backgroundImg,
    } as MonologueScene);
  }

  async function removeBackground() {
    const editor = getEditor();
    const activeMonologueScene = editor.activeScene as MonologueScene;

    if (editor.activeChild?.uuid === activeMonologueScene.backgroundImg!.uuid) {
      editor.removeTransformer();
      setActiveChild(undefined);
    }

    editor.removeChildTransformListener(activeMonologueScene.backgroundImg!);
    activeMonologueScene.removeBackgroundImg();
    setActiveScene({
      ...activeScene,
      backgroundImg: undefined,
    } as MonologueScene);
  }

  function openLineCV(targetIndex: number) {
    setCurrentTargetIndex(targetIndex);
    onOpenCV();
  }

  function addLineCV(source: string) {
    const editor = getEditor();
    const hitLine = (editor.activeScene as MonologueScene).lines[
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

    setDefaultLineDisplayEffect(lineDisplayEffect);

    (editor.activeScene as MonologueScene).lineDisplayEffect =
      lineDisplayEffect as any;
    (editor.activeScene as MonologueScene).setLines(
      (editor.activeScene as MonologueScene).lines,
    );
    setActiveScene({
      ...activeScene,
      lineDisplayEffect,
    } as MonologueScene);
  }

  return (
    <Flex flexDirection={"column"} gap={6}>
      <FormControl>
        <FormLabel fontSize={"sm"}>独白内容</FormLabel>
        {activeScene.lines.map((line, index) => {
          return (
            <Flex key={index} gap={1} mb={2}>
              <Flex flexDirection={"column"} w={"full"}>
                <Textarea
                  placeholder="独白台词"
                  rows={5}
                  value={line.content}
                  onChange={(event) => changeLines(index, event.target.value)}
                  onFocus={(event) => focusLine(event.target.value)}
                  onSelect={(e) => selectLine(index, e)}
                ></Textarea>
                <Flex gap={1} alignItems={"center"} alignSelf={"flex-end"}>
                  {currentLinePosition.lineIndex === index && (
                    <>
                      <Text fontSize={"xs"} color={"GrayText"}>
                        选中位置开始时间:
                        {(currentLinePosition.positionStartTime / 1000).toFixed(
                          1,
                        )}
                        s
                      </Text>
                      <Text fontSize={"xs"} color={"GrayText"}>
                        |
                      </Text>
                    </>
                  )}
                  <Text fontSize={"xs"} color={"GrayText"}>
                    开始时间: {(line.start / 1000).toFixed(1)}s
                  </Text>
                  <Text fontSize={"xs"} color={"GrayText"}>
                    |
                  </Text>
                  <Text fontSize={"xs"} color={"GrayText"}>
                    持续时间: {(line.duration / 1000).toFixed(1)}s
                  </Text>
                </Flex>
              </Flex>
              <Flex
                flexDirection={"column"}
                gap={1}
                justifyContent={"flex-start"}
              >
                {!disabledAudio && (
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
                )}
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
                onClick={onOpen}
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
            <Button colorScheme="teal" size="xs" onClick={onOpen}>
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
        typeFilter={"background"}
        isOpen={isOpen}
        onClose={onClose}
        onSelect={selectBackground}
      ></AssetLibrary>
    </Flex>
  );
}
