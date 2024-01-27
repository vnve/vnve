import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
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
  Popover,
  PopoverCloseButton,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  Portal,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";
import { DialogueScene } from "@vnve/template";
import { EditorContext, getEditor } from "../../lib/context";
import { Child, Img, Scene } from "@vnve/core";
import AssetLibrary from "../AssetLibrary/AssetLibrary";
import { AssetItem } from "../../lib/assets";
import { useContext, useState } from "react";
import IconMoveUp from "~icons/material-symbols/arrow-upward";
import IconMoveDown from "~icons/material-symbols/arrow-downward";
import IconDelete from "~icons/material-symbols/delete-outline-sharp";
import IconEdit from "~icons/material-symbols/edit-square-outline-sharp";
import IconInsert from "~icons/material-symbols/arrow-insert";
import IconMic from "~icons/material-symbols/mic-outline";
import CharacterVoice from "../CharacterVoice/CharacterVoice";
import {
  LINE_DISPLAY_EFFECT_OPTIONS,
  setDefaultLineDisplayEffect,
  setDefaultWordsPerMinute,
} from "../../lib/const";

type OpenFromType =
  | "addCharacter"
  | "changeCharacter"
  | "selectBackground"
  | "selectDialog";

export default function DialogueSceneDetail({
  activeScene,
  setActiveScene,
  addSound,
  disabledAudio,
}: {
  activeScene: DialogueScene;
  setActiveScene: React.Dispatch<React.SetStateAction<Scene | undefined>>;
  addSound: (asset: any) => void;
  disabledAudio: boolean;
}) {
  const { setActiveChild } = useContext(EditorContext);
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
  const [currentLinePosition, setCurrentLinePosition] = useState({
    lineIndex: -1,
    positionStartTime: 0,
  });

  function focusLine(
    line: { name: string; content: string },
    type?: "name" | "content",
  ) {
    const editor = getEditor();
    const scene = editor.activeScene as DialogueScene;

    if (scene.nameText) {
      scene.nameText._width = 0;
      scene.nameText._height = 0;
      scene.nameText.text = line.name;
      if (type === "name") {
        editor.setActiveChild(scene.nameText);
      }
    }

    if (scene.dialogText) {
      scene.dialogText._width = 0;
      scene.dialogText._height = 0;
      scene.dialogText.text = line.content;
      if (type === "content") {
        editor.setActiveChild(scene.dialogText);
      }
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
      const scene = editor.activeScene as DialogueScene;
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

    const scene = editor.activeScene as DialogueScene;

    if (scene.nameText) {
      scene.nameText._width = 0;
      scene.nameText._height = 0;
    }

    if (scene.dialogText) {
      scene.dialogText._width = 0;
      scene.dialogText._height = 0;
    }

    scene.setLines(newLines);
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
      name: newLines[targetIndex].name,
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

    setDefaultWordsPerMinute(wordsPerMinute);

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

    const activeDialogueScene = editor.activeScene as DialogueScene;

    // if select should remove transformer
    if (editor.activeChild?.uuid === activeDialogueScene.backgroundImg!.uuid) {
      editor.removeTransformer();
      setActiveChild(undefined);
    }

    editor.removeChildTransformListener(activeDialogueScene.backgroundImg!);
    activeDialogueScene.removeBackgroundImg();
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

    // if select should remove transformer
    if (editor.activeChild?.uuid === removedChild.uuid) {
      editor.removeTransformer();
      setActiveChild(undefined);
    }

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
    const activeDialogueScene = editor.activeScene as DialogueScene;

    // if select should remove transformer
    if (editor.activeChild?.uuid === activeDialogueScene.dialogImg!.uuid) {
      editor.removeTransformer();
      setActiveChild(undefined);
    }

    editor.removeChildTransformListener(activeDialogueScene.dialogImg!);
    activeDialogueScene.removeDialogImg();
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

    setDefaultLineDisplayEffect(lineDisplayEffect);

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

  function customSingleLine(
    lineIndex: number,
    key: "wordsPerMinute" | "displayEffect" | "gapTime",
    value: unknown,
  ) {
    const editor = getEditor();
    const scene = editor.activeScene as DialogueScene;
    const newLines = scene.lines.map((item, index) => {
      if (index === lineIndex) {
        return {
          ...item,
          [key]: key === "gapTime" ? Number(value) * 1000 : value,
        };
      }
      return item;
    });

    scene.setLines(newLines);
    setActiveScene({
      ...activeScene,
      lines: newLines,
      duration: scene.duration,
    } as DialogueScene);
  }

  function focusChild(child: Child) {
    const editor = getEditor();

    editor.setActiveChild(child);
  }

  return (
    <Flex flexDirection={"column"} gap={6}>
      <FormControl>
        <FormLabel fontSize={"sm"}>对白内容</FormLabel>
        {activeScene.lines.map((line, index) => {
          return (
            <Card key={index} mb={1} variant={"outline"}>
              <CardHeader
                pb={0}
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Heading size="xs" fontWeight="medium">
                  对白{index + 1}
                </Heading>
                <Popover trigger="click">
                  <PopoverTrigger>
                    <Button size={"xs"}>自定义</Button>
                  </PopoverTrigger>
                  <Portal>
                    <PopoverContent>
                      <PopoverArrow />
                      <PopoverCloseButton />
                      <PopoverHeader as={"b"}>单句自定义设置</PopoverHeader>
                      <PopoverBody
                        display={"flex"}
                        flexDirection={"column"}
                        gap={2}
                      >
                        <FormControl>
                          <FormLabel fontSize={"sm"}>语速(字/分钟)</FormLabel>
                          <NumberInput
                            step={100}
                            min={1}
                            value={line.wordsPerMinute}
                            onChange={(value) =>
                              customSingleLine(index, "wordsPerMinute", value)
                            }
                          >
                            <NumberInputField type="number" />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize={"sm"}>停顿时间(s)</FormLabel>
                          <NumberInput
                            step={0.1}
                            min={0}
                            value={line.gapTime >= 0 ? line.gapTime / 1000 : ""}
                            onChange={(value) =>
                              customSingleLine(index, "gapTime", value)
                            }
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize={"sm"}>台词效果</FormLabel>
                          <Select
                            placeholder=" "
                            value={line.displayEffect}
                            onChange={(event) =>
                              customSingleLine(
                                index,
                                "displayEffect",
                                event.target.value,
                              )
                            }
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
                      </PopoverBody>
                    </PopoverContent>
                  </Portal>
                </Popover>
              </CardHeader>
              <CardBody display={"flex"} flexDirection={"column"} gap={1}>
                <Textarea
                  w={"200px"}
                  value={line.name}
                  onChange={(event) =>
                    changeLines(index, event.target.value, "name")
                  }
                  onFocus={() => focusLine(line, "name")}
                  placeholder="角色名"
                  rows={1}
                ></Textarea>
                <Flex gap={2}>
                  <Flex w={"full"} flexDirection={"column"}>
                    <Textarea
                      placeholder="角色台词"
                      rows={4}
                      value={line.content}
                      onChange={(event) =>
                        changeLines(index, event.target.value, "content")
                      }
                      onFocus={() => focusLine(line, "content")}
                      onSelect={(e) => selectLine(index, e)}
                    ></Textarea>
                    <Flex gap={1} alignItems={"center"} alignSelf={"flex-end"}>
                      {currentLinePosition.lineIndex === index && (
                        <>
                          <Text fontSize={"xs"} color={"GrayText"}>
                            焦点时间:
                            {(
                              currentLinePosition.positionStartTime / 1000
                            ).toFixed(1)}
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
              </CardBody>
            </Card>
          );
        })}
        <Button colorScheme="teal" size="xs" onClick={addLine}>
          新增对白
        </Button>
      </FormControl>
      <Flex gap={2}>
        <FormControl>
          <FormLabel fontSize={"sm"}>背景图</FormLabel>
          {activeScene.backgroundImg ? (
            <UnorderedList>
              <ListItem>
                <Flex gap={2} alignItems={"center"} fontSize={"sm"} mb={2}>
                  <Text
                    cursor={"pointer"}
                    onClick={() => focusChild(activeScene.backgroundImg)}
                  >
                    {activeScene.backgroundImg.name}
                  </Text>
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
              </ListItem>
            </UnorderedList>
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
          <UnorderedList>
            {activeScene.characterImgs.map((item, index) => {
              return (
                <ListItem>
                  <Flex
                    gap={2}
                    alignItems={"center"}
                    fontSize={"sm"}
                    mb={2}
                    key={index}
                  >
                    <Text cursor={"pointer"} onClick={() => focusChild(item)}>
                      {item.name}
                    </Text>
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
                </ListItem>
              );
            })}
          </UnorderedList>
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
          <FormLabel fontSize={"sm"}>对话框</FormLabel>
          {activeScene.dialogImg ? (
            <UnorderedList>
              <ListItem>
                <Flex alignItems={"center"} fontSize={"sm"} gap={2}>
                  <Text
                    cursor={"pointer"}
                    onClick={() => focusChild(activeScene.dialogImg)}
                  >
                    {activeScene.dialogImg.name}
                  </Text>
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
              </ListItem>
            </UnorderedList>
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
