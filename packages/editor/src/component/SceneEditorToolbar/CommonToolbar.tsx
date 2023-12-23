import {
  FormControl,
  FormLabel,
  Switch,
  Box,
  Icon,
  Flex,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  Text,
  Portal,
  Button,
  List,
  ListItem,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tooltip,
} from "@chakra-ui/react";
import { Child, IEditorChildPosition, Img } from "@vnve/core";
import { EditorContext, getEditor } from "../../lib/context";
import { useContext } from "react";
import { PRESET_ANIMATION_LIST, PRESET_FILTER_LIST } from "../../lib/const";
import IconOpacity from "~icons/material-symbols/opacity";
import IconStack from "~icons/material-symbols/stack-sharp";
import IconPosition from "~icons/material-symbols/position-bottom-left-outline-sharp";
import IconCopy from "~icons/material-symbols/content-copy-outline-sharp";
import IconDelete from "~icons/material-symbols/delete-outline-sharp";
import IconAnimation from "~icons/material-symbols/animation";
import IconWidthAndHeight from "~icons/material-symbols/width-full-outline-sharp";
import IconFilterEffect from "~icons/material-symbols/filter-b-and-w-sharp";

export default function CommonToolbar({
  activeChild,
  changeActiveChild,
}: {
  activeChild: Child;
  changeActiveChild: (props: string, value: any) => void;
}) {
  const { setActiveChild } = useContext(EditorContext);

  function moveChildToTop() {
    const editor = getEditor();

    editor.moveChildToTop();
  }

  function moveChildToBottom() {
    const editor = getEditor();

    editor.moveChildToBottom();
  }

  function moveUpChild() {
    const editor = getEditor();

    editor.moveUpChild();
  }

  function moveDownChild() {
    const editor = getEditor();

    editor.moveDownChild();
  }

  function setChildPosition(position: IEditorChildPosition) {
    const editor = getEditor();

    editor.setChildPosition(position);
  }

  async function copyChild() {
    const editor = getEditor();
    const clonedChild = editor.cloneChild();

    if (clonedChild) {
      if (typeof (clonedChild as Img).load === "function") {
        await (clonedChild as Img).load();
      }
      clonedChild.x += clonedChild.width * 0.1;
      clonedChild.y += clonedChild.height * 0.1;

      editor.addChild(clonedChild);
    }
  }

  function deleteChild() {
    const editor = getEditor();

    editor.removeChild(editor.activeChild!);
    editor.removeTransformer();
    setActiveChild(undefined);
  }

  function changeChildAnimationEffect(name: string, targetIndex: number) {
    changeActiveChild(
      "animationParams",
      activeChild.animationParams?.map((item, index) => {
        if (targetIndex === index) {
          const hit = PRESET_ANIMATION_LIST.find(
            (preset) => preset.name === name,
          );

          return {
            ...item,
            name: hit?.name,
            label: hit?.label,
            value: hit?.value,
          };
        } else {
          return item;
        }
      }),
    );
  }

  function changeChildAnimationDuration(duration: string, targetIndex: number) {
    changeActiveChild(
      "animationParams",
      activeChild.animationParams?.map((item, index) => {
        if (targetIndex === index) {
          return {
            ...item,
            value: item.value.map((v, i) => {
              if (i === 1) {
                return {
                  ...v,
                  duration: Number(duration) * 1000,
                };
              } else {
                return v;
              }
            }),
          };
        } else {
          return item;
        }
      }),
    );
  }

  function changeChildAnimationDelay(delay: string, targetIndex: number) {
    changeActiveChild(
      "animationParams",
      activeChild.animationParams?.map((item, index) => {
        if (targetIndex === index) {
          return {
            ...item,
            value: item.value.map((v, i) => {
              if (i === 1) {
                return {
                  ...v,
                  delay: Number(delay) * 1000,
                };
              } else {
                return v;
              }
            }),
          };
        } else {
          return item;
        }
      }),
    );
  }

  function changeChildAnimationRepeat(repeat: boolean, targetIndex: number) {
    changeActiveChild(
      "animationParams",
      activeChild.animationParams?.map((item, index) => {
        if (targetIndex === index) {
          return {
            ...item,
            value: item.value.map((v, i) => {
              if (i === 1) {
                return {
                  ...v,
                  repeat: repeat ? -1 : 0,
                };
              } else {
                return v;
              }
            }),
          };
        } else {
          return item;
        }
      }),
    );
  }

  function addChildAnimationItem() {
    changeActiveChild("animationParams", [
      ...(activeChild.animationParams || []),
      PRESET_ANIMATION_LIST[0],
    ]);
  }

  function deleteChildAnimationItem(targetIndx: number) {
    changeActiveChild(
      "animationParams",
      activeChild.animationParams?.filter(
        (_item, index) => index !== targetIndx,
      ),
    );
  }

  function changeNumProperty(property: string, value: string) {
    changeActiveChild(property, Number(value));
  }

  function addChildFilter() {
    changeActiveChild("filters", [
      ...(activeChild.filters || []),
      PRESET_FILTER_LIST[0].factory(),
    ]);
  }

  function changeChildFilterEffect(name: string, targetIndex: number) {
    changeActiveChild(
      "filters",
      activeChild.filters?.map((item, index) => {
        if (targetIndex === index) {
          const hit = PRESET_FILTER_LIST.find((preset) => preset.name === name);

          return hit.factory();
        } else {
          return item;
        }
      }),
    );
  }

  function deleteChildFilter(targetIndx: number) {
    changeActiveChild(
      "filters",
      activeChild.filters?.filter((_item, index) => index !== targetIndx),
    );
  }

  return (
    activeChild && (
      <Flex alignItems={"center"} gap={2}>
        <Popover trigger="hover">
          <PopoverTrigger>
            <Box cursor={"pointer"} w={6} h={6}>
              <Icon as={IconOpacity} w={6} h={6}></Icon>
            </Box>
          </PopoverTrigger>
          <Portal>
            <PopoverContent>
              <PopoverArrow />
              <PopoverHeader as={"b"}>透明度</PopoverHeader>
              <PopoverBody>
                <Slider
                  value={activeChild.alpha}
                  min={0}
                  max={1}
                  step={0.1}
                  onChange={(num) => changeActiveChild("alpha", num)}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </PopoverBody>
            </PopoverContent>
          </Portal>
        </Popover>
        <Popover trigger="hover">
          <PopoverTrigger>
            <Box cursor={"pointer"} w={6} h={6}>
              <Icon as={IconWidthAndHeight} w={6} h={6}></Icon>
            </Box>
          </PopoverTrigger>
          <Portal>
            <PopoverContent>
              <PopoverArrow />
              <PopoverHeader as={"b"}>宽高</PopoverHeader>
              <PopoverBody display={"flex"} gap={2}>
                <FormControl>
                  <FormLabel fontSize={"sm"}>宽</FormLabel>
                  <NumberInput
                    value={activeChild.width}
                    min={0}
                    step={10}
                    onChange={(value) => changeNumProperty("width", value)}
                  >
                    <NumberInputField type="number" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"}>高</FormLabel>
                  <NumberInput
                    value={activeChild.height}
                    min={0}
                    step={10}
                    onChange={(value) => changeNumProperty("height", value)}
                  >
                    <NumberInputField type="number" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </PopoverBody>
            </PopoverContent>
          </Portal>
        </Popover>
        <Popover trigger="hover">
          <PopoverTrigger>
            <Box cursor={"pointer"} w={6} h={6}>
              <Icon as={IconStack} w={6} h={6}></Icon>
            </Box>
          </PopoverTrigger>
          <Portal>
            <PopoverContent>
              <PopoverArrow />
              <PopoverHeader as={"b"}>层级</PopoverHeader>
              <PopoverBody display={"flex"} gap={2}>
                <Button onClick={moveChildToTop}>置顶</Button>
                <Button onClick={moveUpChild}>上移一层</Button>
                <Button onClick={moveDownChild}>下移一层</Button>
                <Button onClick={moveChildToBottom}>置底</Button>
              </PopoverBody>
            </PopoverContent>
          </Portal>
        </Popover>
        <Popover trigger="hover">
          <PopoverTrigger>
            <Box cursor={"pointer"} w={6} h={6}>
              <Icon as={IconPosition} w={6} h={6}></Icon>
            </Box>
          </PopoverTrigger>
          <Portal>
            <PopoverContent>
              <PopoverArrow />
              <PopoverHeader as={"b"}>位置</PopoverHeader>
              <PopoverBody>
                <Flex gap={2} mb={4} alignItems={"center"}>
                  <Text fontSize={"14px"} as={"b"}>
                    水平
                  </Text>
                  <Button onClick={() => setChildPosition("left")}>左</Button>
                  <Button onClick={() => setChildPosition("center")}>中</Button>
                  <Button onClick={() => setChildPosition("right")}>右</Button>
                </Flex>
                <Flex gap={2} alignItems={"center"}>
                  <Text fontSize={"14px"} as={"b"}>
                    垂直
                  </Text>
                  <Button onClick={() => setChildPosition("top")}>上</Button>
                  <Button onClick={() => setChildPosition("middle")}>中</Button>
                  <Button onClick={() => setChildPosition("bottom")}>下</Button>
                </Flex>
              </PopoverBody>
            </PopoverContent>
          </Portal>
        </Popover>
        <Popover trigger="hover">
          <PopoverTrigger>
            <Box cursor={"pointer"} w={6} h={6}>
              <Icon as={IconAnimation} w={6} h={6}></Icon>
            </Box>
          </PopoverTrigger>
          <Portal>
            <PopoverContent
              w={{ base: "280px", md: "500px" }}
              overflow={"scroll"}
            >
              <PopoverArrow />
              <PopoverHeader as={"b"}>动画效果</PopoverHeader>
              <PopoverBody w={"480px"}>
                <List>
                  {activeChild.animationParams?.map((item, index) => {
                    return (
                      <ListItem
                        key={index}
                        display={"flex"}
                        flexDirection={"column"}
                        mb={2}
                      >
                        <Flex gap={2} alignItems={"flex-start"}>
                          <FormControl>
                            <FormLabel fontSize={"sm"}>效果</FormLabel>
                            <Select
                              w={"120px"}
                              value={item.name}
                              onChange={(event) =>
                                changeChildAnimationEffect(
                                  event.target.value,
                                  index,
                                )
                              }
                            >
                              {PRESET_ANIMATION_LIST.map((option) => {
                                return (
                                  <option key={option.name} value={option.name}>
                                    {option.label}
                                  </option>
                                );
                              })}
                            </Select>
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize={"sm"}>持续时间(s)</FormLabel>
                            <NumberInput
                              w={"100px"}
                              precision={1}
                              value={
                                (item.value[1].duration as number) / 1000 || 0
                              }
                              min={0}
                              step={0.1}
                              onChange={(value) =>
                                changeChildAnimationDuration(value, index)
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
                            <FormLabel fontSize={"sm"}>延迟时间(s)</FormLabel>
                            <NumberInput
                              w={"100px"}
                              value={
                                (item.value[1].delay as number) / 1000 || 0
                              }
                              precision={1}
                              min={0}
                              step={0.1}
                              onChange={(value) =>
                                changeChildAnimationDelay(value, index)
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
                            <FormLabel fontSize={"sm"}>是否循环</FormLabel>
                            <Switch
                              isChecked={item.value[1].repeat === -1}
                              onChange={(event) =>
                                changeChildAnimationRepeat(
                                  event.target.checked,
                                  index,
                                )
                              }
                            ></Switch>
                          </FormControl>
                          <Icon
                            cursor={"pointer"}
                            as={IconDelete}
                            w={6}
                            h={6}
                            onClick={() => deleteChildAnimationItem(index)}
                          ></Icon>
                        </Flex>
                      </ListItem>
                    );
                  })}
                </List>
                <Button
                  colorScheme="teal"
                  mt={2}
                  size={"xs"}
                  onClick={addChildAnimationItem}
                >
                  新增动画
                </Button>
              </PopoverBody>
            </PopoverContent>
          </Portal>
        </Popover>
        <Popover trigger="hover">
          <PopoverTrigger>
            <Box cursor={"pointer"} w={6} h={6}>
              <Icon as={IconFilterEffect} w={6} h={6}></Icon>
            </Box>
          </PopoverTrigger>
          <Portal>
            <PopoverContent>
              <PopoverArrow />
              <PopoverHeader as={"b"}>滤镜效果</PopoverHeader>
              <PopoverBody>
                <List>
                  {activeChild.filters?.map((item, index) => {
                    return (
                      <ListItem
                        key={index}
                        display={"flex"}
                        flexDirection={"column"}
                        mb={2}
                      >
                        <Flex gap={2} alignItems={"flex-start"}>
                          <FormControl>
                            <FormLabel fontSize={"sm"}>效果</FormLabel>
                            <Select
                              value={(item as any).name}
                              onChange={(event) =>
                                changeChildFilterEffect(
                                  event.target.value,
                                  index,
                                )
                              }
                            >
                              {PRESET_FILTER_LIST.map((option) => {
                                return (
                                  <option key={option.name} value={option.name}>
                                    {option.label}
                                  </option>
                                );
                              })}
                            </Select>
                          </FormControl>
                          <Icon
                            cursor={"pointer"}
                            as={IconDelete}
                            w={6}
                            h={6}
                            onClick={() => deleteChildFilter(index)}
                          ></Icon>
                        </Flex>
                      </ListItem>
                    );
                  })}
                </List>
                <Button
                  colorScheme="teal"
                  mt={2}
                  size={"xs"}
                  onClick={addChildFilter}
                >
                  新增滤镜
                </Button>
              </PopoverBody>
            </PopoverContent>
          </Portal>
        </Popover>
        <Tooltip label="复制">
          <Box cursor={"pointer"} w={6} h={6} onClick={copyChild}>
            <Icon as={IconCopy} w={6} h={6}></Icon>
          </Box>
        </Tooltip>
        <Tooltip label="删除">
          <Box cursor={"pointer"} w={6} h={6} onClick={deleteChild}>
            <Icon as={IconDelete} w={6} h={6}></Icon>
          </Box>
        </Tooltip>
      </Flex>
    )
  );
}
