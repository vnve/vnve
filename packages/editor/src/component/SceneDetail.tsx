import {
  Text,
  Card,
  CardHeader,
  CardBody,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Flex,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  List,
  ListItem,
  useDisclosure,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Icon,
  Divider,
} from "@chakra-ui/react";
import { useContext } from "react";
import { EditorContext, getEditor } from "../lib/context";
import { Scene, Sound } from "@vnve/core";
import { SCENE_TRANSITION_LIST } from "../lib/const";
import TitleSceneDetail from "./TemplateSceneDetail/TitleSceneDetail";
import { TitleScene, MonologueScene, DialogueScene } from "@vnve/template";
import MonologueSceneDetail from "./TemplateSceneDetail/MonologueSceneDetail";
import DialogueSceneDetail from "./TemplateSceneDetail/DialogueSceneDetail";
import AssetLibrary from "./AssetLibrary/AssetLibrary";
import IconDetail from "~icons/material-symbols/movie-edit-outline-sharp";
import IconDelete from "~icons/material-symbols/delete-outline-sharp";

export default function SceneDetail({
  disabledAudio,
}: {
  disabledAudio: boolean;
}) {
  const { activeScene, setActiveScene } = useContext(EditorContext);
  const { isOpen, onOpen, onClose } = useDisclosure();

  function changeActiveScene(prop: string, value: any) {
    setActiveScene({
      ...activeScene,
      [prop]: value,
    } as Scene);
  }

  function changeSceneName(name: string) {
    const editor = getEditor();

    if (editor.activeScene) {
      editor.activeScene.name = name;
    }
    changeActiveScene("name", name);
  }

  function changeSceneDuration(duration: string) {
    const editor = getEditor();
    const newDuration = Number(duration) * 1000;

    if (editor.activeScene) {
      editor.activeScene.setDuration(newDuration);
    }
    changeActiveScene("duration", newDuration);
  }

  function changeSceneTransition(targetIndex: number, transitionName: string) {
    const editor = getEditor();

    if (editor.activeScene && activeScene) {
      const hit = SCENE_TRANSITION_LIST.find(
        (item) => item.name === transitionName,
      );

      if (hit) {
        editor.activeScene.transitions[targetIndex] = hit.factory();
        changeActiveScene(
          "transitions",
          activeScene.transitions.map((transition, index) => {
            if (index === targetIndex) {
              return {
                ...transition,
                ...hit,
              };
            }
            return transition;
          }),
        );
      }
    }
  }

  function deleteSceneTransition(targetIndex: number) {
    const editor = getEditor();

    if (editor.activeScene && activeScene) {
      editor.activeScene.removeTransition(
        editor.activeScene.transitions[targetIndex],
      );
      changeActiveScene(
        "transitions",
        activeScene.transitions.filter((_item, index) => index !== targetIndex),
      );
    }
  }

  function addSceneTransition() {
    const editor = getEditor();

    if (editor.activeScene && activeScene) {
      const newTransition = SCENE_TRANSITION_LIST[0].factory();

      editor.activeScene.addTransition(newTransition);
      changeActiveScene("transitions", [
        ...activeScene.transitions,
        newTransition,
      ]);
    }
  }

  function changeSceneTransitionDuration(targetIndex: number, value: string) {
    const editor = getEditor();
    const duration = Number(value) * 1000;

    if (editor.activeScene && activeScene) {
      editor.activeScene.transitions[targetIndex].duration = duration;
      changeActiveScene(
        "transitions",
        activeScene.transitions.map((transition, index) => {
          if (index === targetIndex) {
            return {
              ...transition,
              duration,
            };
          }
          return transition;
        }),
      );
    }
  }

  async function addSound(asset: any) {
    const editor = getEditor();

    if (editor.activeScene && activeScene) {
      const newSound = new Sound({
        name: asset.name ?? "",
        source: asset.source,
        start: asset.start ?? 0,
      });

      await newSound.load();

      if (asset.duration) {
        const duration =
          asset.duration < editor.activeScene.duration
            ? asset.duration
            : editor.activeScene.duration;
        newSound.duration = duration;
      }

      editor.activeScene.addSound(newSound);
      changeActiveScene("sounds", [...activeScene.sounds, newSound]);
    }
  }

  function removeSound(targetIndex: number) {
    const editor = getEditor();

    if (editor.activeScene && activeScene) {
      editor.activeScene.removeSound(editor.activeScene.sounds[targetIndex]);
      changeActiveScene(
        "sounds",
        activeScene.sounds.filter((_item, index) => index !== targetIndex),
      );
    }
  }

  function changeSoundProperty(
    targetIndex: number,
    property: keyof Sound,
    value: any,
  ) {
    let newValue = value;

    if (["start", "duration"].includes(property)) {
      newValue = Number(value);
      newValue = newValue * 1000;
    }

    const editor = getEditor();

    if (editor.activeScene && activeScene) {
      const hitSound = editor.activeScene.sounds[targetIndex] as any;

      hitSound[property] = newValue;

      changeActiveScene(
        "sounds",
        activeScene.sounds.map((item, index) => {
          if (index === targetIndex) {
            return {
              ...item,
              [property]: newValue,
            };
          }
          return item;
        }),
      );
    }
  }

  return (
    <Card flex={1} mr={1} overflow={"scroll"} maxH={"calc(100vh - 60px)"}>
      {activeScene && (
        <>
          <CardHeader>
            <Heading size={"sm"} display={"flex"} alignItems={"center"}>
              场景编辑 <Icon as={IconDetail} w={6} h={6} ml={1}></Icon>
            </Heading>
          </CardHeader>

          <CardBody>
            <Flex gap={4} flexDirection={"column"}>
              <Flex gap={4}>
                <FormControl>
                  <FormLabel fontSize={"sm"}>场景名</FormLabel>
                  <Input
                    value={activeScene.name}
                    onChange={(event) => changeSceneName(event.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"}>场景时长(s)</FormLabel>
                  <NumberInput
                    precision={1}
                    value={activeScene.duration / 1000 || 0}
                    min={0}
                    step={1}
                    onChange={(value) => changeSceneDuration(value)}
                  >
                    <NumberInputField type="number" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </Flex>
              <Divider></Divider>
              {activeScene.type === "TitleScene" && (
                <TitleSceneDetail
                  activeScene={activeScene as TitleScene}
                  setActiveScene={setActiveScene}
                ></TitleSceneDetail>
              )}
              {activeScene.type === "MonologueScene" && (
                <MonologueSceneDetail
                  activeScene={activeScene as MonologueScene}
                  setActiveScene={setActiveScene}
                  addSound={addSound}
                  disabledAudio={disabledAudio}
                ></MonologueSceneDetail>
              )}
              {activeScene.type === "DialogueScene" && (
                <DialogueSceneDetail
                  activeScene={activeScene as DialogueScene}
                  setActiveScene={setActiveScene}
                  addSound={addSound}
                  disabledAudio={disabledAudio}
                ></DialogueSceneDetail>
              )}
              <Divider></Divider>
              <Flex gap={4}>
                {!disabledAudio && (
                  <FormControl>
                    <FormLabel fontSize={"sm"}>场景音乐</FormLabel>
                    <List spacing={2}>
                      {activeScene.sounds.map((sound, index) => {
                        return (
                          <ListItem
                            key={index}
                            display={"flex"}
                            flexDirection={"column"}
                            gap={2}
                          >
                            <Flex justifyContent={"space-between"}>
                              <Text fontSize={"sm"}>
                                {index + 1}. {sound.name}
                              </Text>

                              <Icon
                                cursor={"pointer"}
                                w={5}
                                h={5}
                                as={IconDelete}
                                onClick={() => removeSound(index)}
                              ></Icon>
                            </Flex>
                            <Flex gap={4}>
                              <FormControl>
                                <FormLabel fontSize={"sm"}>
                                  开始时间(s)
                                </FormLabel>
                                <NumberInput
                                  precision={1}
                                  min={0}
                                  step={1}
                                  value={sound.start / 1000}
                                  onChange={(value) =>
                                    changeSoundProperty(index, "start", value)
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
                                <FormLabel fontSize={"sm"}>
                                  持续时间(s)
                                </FormLabel>
                                <NumberInput
                                  precision={1}
                                  min={0}
                                  max={(sound.bufferDuration || 0) / 1000}
                                  step={1}
                                  value={sound.duration / 1000 || 0}
                                  onChange={(value) =>
                                    changeSoundProperty(
                                      index,
                                      "duration",
                                      value,
                                    )
                                  }
                                >
                                  <NumberInputField type="number" />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                              </FormControl>
                            </Flex>
                            <Flex gap={4}>
                              <FormControl>
                                <FormLabel fontSize={"sm"}>音量</FormLabel>
                                <Slider
                                  value={sound.volume}
                                  min={0}
                                  max={1}
                                  step={0.1}
                                  onChange={(num) =>
                                    changeSoundProperty(index, "volume", num)
                                  }
                                >
                                  <SliderTrack>
                                    <SliderFilledTrack />
                                  </SliderTrack>
                                  <SliderThumb />
                                </Slider>
                              </FormControl>
                              <FormControl display={"flex"}>
                                <FormControl>
                                  <FormLabel fontSize={"sm"}>循环</FormLabel>
                                  <Switch
                                    isChecked={sound.loop}
                                    onChange={(event) =>
                                      changeSoundProperty(
                                        index,
                                        "loop",
                                        event.target.checked,
                                      )
                                    }
                                  ></Switch>
                                </FormControl>
                                <FormControl>
                                  <FormLabel fontSize={"sm"}>跨场景</FormLabel>
                                  <Switch
                                    isChecked={sound.untilEnd}
                                    onChange={(event) =>
                                      changeSoundProperty(
                                        index,
                                        "untilEnd",
                                        event.target.checked,
                                      )
                                    }
                                  ></Switch>
                                </FormControl>
                              </FormControl>
                            </Flex>
                          </ListItem>
                        );
                      })}
                    </List>
                    <Button colorScheme="teal" size="xs" onClick={onOpen}>
                      新增
                    </Button>
                    <AssetLibrary
                      type="audio"
                      isOpen={isOpen}
                      onClose={onClose}
                      onSelect={addSound}
                    ></AssetLibrary>
                  </FormControl>
                )}
                <FormControl>
                  <FormLabel fontSize={"sm"}>转场效果</FormLabel>
                  {activeScene.transitions.map((transition, index) => {
                    return (
                      <Flex key={index} gap={2} mb={1} alignItems={"center"}>
                        <Select
                          value={transition.name}
                          onChange={(event) =>
                            changeSceneTransition(index, event.target.value)
                          }
                        >
                          {SCENE_TRANSITION_LIST.map((option) => {
                            return (
                              <option key={option.name} value={option.name}>
                                {option.label}
                              </option>
                            );
                          })}
                        </Select>
                        <NumberInput
                          value={transition.duration / 1000 || 0}
                          precision={1}
                          min={0}
                          step={0.1}
                          onChange={(value) =>
                            changeSceneTransitionDuration(index, value)
                          }
                        >
                          <NumberInputField type="number" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>

                        <Icon
                          cursor={"pointer"}
                          w={5}
                          h={5}
                          as={IconDelete}
                          onClick={() => deleteSceneTransition(index)}
                        ></Icon>
                      </Flex>
                    );
                  })}
                  <Button
                    colorScheme="teal"
                    size="xs"
                    onClick={addSceneTransition}
                  >
                    新增
                  </Button>
                </FormControl>
              </Flex>
            </Flex>
          </CardBody>
        </>
      )}
    </Card>
  );
}
