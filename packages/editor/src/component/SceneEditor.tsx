import { Creator, Editor, Child, Scene, Text as TextChild } from "@vnve/core";
import { SCENE_TEMPLATE_LIST, SCENE_CHILD_TEMPLATE_LIST } from "../lib/const";
import { useContext, useEffect, useRef, useState } from "react";
import { EditorContext, getEditor, setEditor } from "../lib/context";
import {
  Box,
  Progress,
  List,
  ListItem,
  ListIcon,
  Text,
  ButtonGroup,
  Button,
  Card,
  CardBody,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  FormControl,
  FormLabel,
  PopoverBody,
  Input,
  Icon,
  Spacer,
  useToast,
} from "@chakra-ui/react";
import SceneEditorToolbar from "./SceneEditorToolbar/SceneEditorToolbar";
import IconAddScene from "~icons/material-symbols/add-ad-sharp";
import IconAddChild from "~icons/material-symbols/box-add-outline-sharp";
import IconAdd from "~icons/material-symbols/add-box-outline-sharp";
import IconPreview from "~icons/material-symbols/preview-sharp";
import IconVideo from "~icons/material-symbols/video-settings-sharp";
import { DialogueScene } from "@vnve/template";

export default function SceneEditor({ onlyVideo }: { onlyVideo: boolean }) {
  const { activeScene, scenes, setScenes, setActiveChild, setActiveScene } =
    useContext(EditorContext);
  const creatorRef = useRef<Creator>();

  const editorRef = useRef(null);
  const previewRef = useRef(null);
  const [exportVideoSrc, setExportVideoSrc] = useState("");
  const [exportProgress, setExportProgress] = useState(0);
  const [exportFileName, setExportFileName] = useState("");
  const {
    isOpen: isOpenPreview,
    onOpen: onOpenPreview,
    onClose: onClosePreview,
  } = useDisclosure();
  const {
    isOpen: isOpenExport,
    onOpen: onOpenExport,
    onClose: onCloseExport,
  } = useDisclosure();

  const {
    isOpen: isOpenFileName,
    onOpen: onOpenFileName,
    onClose: onCloseFileName,
  } = useDisclosure();

  const toast = useToast();
  const [currentPreviewIsAll, setCurrentPreviewIsAll] = useState(false);

  useEffect(() => {
    creatorRef.current = new Creator({
      onProgress(percent) {
        setExportProgress(percent * 100);
      },
      onlyVideo,
    });
    // TODO: perf
    setEditor(
      new Editor({
        container: editorRef.current! as HTMLCanvasElement,
        onChangeActiveChild(child) {
          setActiveChild({
            ...child,
            width: child.width,
            height: child.height,
            text: (child as TextChild).text,
            style: (child as TextChild).style && {
              ...(child as TextChild).style,
              fontSize: (child as TextChild).style.fontSize,
            },
          } as Child); // create active child for view
        },
        onChangeActiveScene(scene) {
          setActiveScene({
            ...scene,
            transitions: [...scene.transitions],
            filters: scene.filters ? [...scene.filters] : null,
            sounds: [...scene.sounds],
            characterImgs: [...((scene as DialogueScene).characterImgs || [])],
          } as any); // create active scene for view
        },
      }),
    );
  }, []);

  function addScene(option: (typeof SCENE_TEMPLATE_LIST)[number]) {
    const editor = getEditor();
    const newScene = option.factory();

    editor.addScene(newScene);
    editor.renderScene(newScene);

    // for view update
    setScenes([...scenes, newScene]);
  }

  function addChild(option: (typeof SCENE_CHILD_TEMPLATE_LIST)[number]) {
    const editor = getEditor();
    const newChild = option.factory();

    editor.addChild(newChild);
  }

  async function openPreview(all = true) {
    setCurrentPreviewIsAll(all);
    onOpenPreview();
    const editor = getEditor();
    let scenes: Scene[] = [];

    if (all) {
      scenes = editor.exportScenes();
    } else {
      const cloned = editor.cloneScene();
      if (cloned) {
        scenes = [cloned];
      }
    }

    setTimeout(() => {
      creatorRef.current?.preview(
        previewRef.current! as HTMLCanvasElement,
        scenes,
      );
    }, 100);
  }

  function closePreview() {
    onClosePreview();
    creatorRef.current?.stopPreview();
  }

  function closePreviewAndExport() {
    closePreview();
    // stop preview will not stop immediately
    // TODO: perf stop action
    setTimeout(() => {
      openExport(currentPreviewIsAll);
    }, 100);
  }

  async function openExport(all = true) {
    setExportFileName("");
    setExportProgress(0);
    setExportVideoSrc("");
    onOpenExport();
    const editor = getEditor();
    let scenes: Scene[] = [];

    if (all) {
      scenes = editor.exportScenes();
    } else {
      const cloned = editor.cloneScene();
      if (cloned) {
        scenes = [cloned];
      }
    }

    const blob = await creatorRef.current.start(scenes).catch((e) => {
      toast({
        description: `导出失败：${e?.message}`,
        status: "error",
        duration: 1500,
      });
    });

    if (blob) {
      setExportVideoSrc(URL.createObjectURL(blob));
    }
  }

  function closeExport() {
    stopExport();
    if (exportVideoSrc) {
      URL.revokeObjectURL(exportVideoSrc);
    }
  }

  function stopExport() {
    onCloseExport();
    creatorRef.current?.stop();
  }

  function saveVideo() {
    if (!exportFileName) {
      toast({
        description: "请输入保存文件名",
        status: "info",
      });
      return;
    }

    const a = document.createElement("a");
    a.setAttribute("download", `${exportFileName}.mp4`);
    a.setAttribute("href", exportVideoSrc);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onCloseFileName();
  }

  function goVideoUp() {
    window.open(
      "https://member.bilibili.com/platform/upload/video/frame?from=vnve",
      "_blank",
    );
  }

  function goInteractiveVideoUp() {
    window.open(
      "https://member.bilibili.com/platform/upload/video/interactive?from=vnve",
      "_blank",
    );
  }

  return (
    <>
      <Card>
        <CardBody flexDirection={"column"} p={{ base: 1, md: 3 }}>
          <SceneEditorToolbar></SceneEditorToolbar>
          <Box
            width={{ base: "368px", md: "640px" }}
            height={{ base: "207px", md: "360px" }}
          >
            <canvas
              ref={editorRef}
              style={{ width: "100%", height: "100%" }}
            ></canvas>
          </Box>
          <Flex h={"36px"} mt={2} justifyContent={"space-between"}>
            <ButtonGroup mr={2}>
              <Popover trigger="hover" placement="bottom-start">
                <PopoverTrigger>
                  <Button colorScheme="teal">
                    <Icon as={IconAddScene} w={5} h={5} mr={1}></Icon>
                    新增场景
                  </Button>
                </PopoverTrigger>
                <PopoverContent w={"132px"}>
                  <PopoverBody>
                    <List>
                      {SCENE_TEMPLATE_LIST.map((option) => {
                        return (
                          <ListItem
                            key={option.name}
                            onClick={() => addScene(option)}
                            cursor={"pointer"}
                            userSelect={"none"}
                            _hover={{ bgColor: "teal.50" }}
                            display={"flex"}
                            alignItems={"center"}
                            p={1}
                          >
                            <ListIcon as={IconAdd} w={4} h={4}></ListIcon>
                            <Text fontSize={"14px"} as={"b"}>
                              {option.name}
                            </Text>
                          </ListItem>
                        );
                      })}
                    </List>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
              <Popover trigger="hover" placement="bottom-start">
                <PopoverTrigger>
                  <Button colorScheme="teal" isDisabled={!activeScene}>
                    <Icon as={IconAddChild} w={5} h={5} mr={1}></Icon>新增元素
                  </Button>
                </PopoverTrigger>
                <PopoverContent w={"120px"}>
                  <PopoverBody>
                    <List>
                      {SCENE_CHILD_TEMPLATE_LIST.map((option) => {
                        return (
                          <ListItem
                            key={option.name}
                            userSelect={"none"}
                            onClick={() => addChild(option)}
                            cursor={"pointer"}
                            _hover={{ bgColor: "teal.50" }}
                            display={"flex"}
                            alignItems={"center"}
                            p={1}
                          >
                            <ListIcon as={IconAdd} w={4} h={4}></ListIcon>
                            <Text fontSize={"14px"} as={"b"}>
                              {option.name}
                            </Text>
                          </ListItem>
                        );
                      })}
                    </List>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </ButtonGroup>

            <ButtonGroup>
              <Popover trigger="hover" placement="bottom-start">
                <PopoverTrigger>
                  <Button
                    colorScheme="teal"
                    isDisabled={!activeScene || scenes.length === 0}
                  >
                    <Icon as={IconPreview} w={5} h={5} mr={1}></Icon>
                    预览
                  </Button>
                </PopoverTrigger>
                <PopoverContent w={"160px"}>
                  <PopoverBody>
                    <List>
                      <ListItem
                        onClick={() => openPreview(false)}
                        cursor={"pointer"}
                        userSelect={"none"}
                        _hover={{ bgColor: "teal.50" }}
                        display={"flex"}
                        alignItems={"center"}
                        p={1}
                      >
                        <Text fontSize={"14px"} as={"b"}>
                          仅预览当前场景
                        </Text>
                      </ListItem>
                      <ListItem
                        onClick={() => openPreview()}
                        cursor={"pointer"}
                        userSelect={"none"}
                        _hover={{ bgColor: "teal.50" }}
                        display={"flex"}
                        alignItems={"center"}
                        p={1}
                      >
                        <Text fontSize={"14px"} as={"b"}>
                          预览全部场景
                        </Text>
                      </ListItem>
                    </List>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
              <Popover trigger="hover">
                <PopoverTrigger>
                  <Button
                    colorScheme="teal"
                    isDisabled={!activeScene || scenes.length === 0}
                  >
                    <Icon as={IconVideo} w={5} h={5} mr={1}></Icon>导出
                  </Button>
                </PopoverTrigger>
                <PopoverContent w={"160px"}>
                  <PopoverBody>
                    <List>
                      <ListItem
                        onClick={() => openExport(false)}
                        cursor={"pointer"}
                        userSelect={"none"}
                        _hover={{ bgColor: "teal.50" }}
                        display={"flex"}
                        alignItems={"center"}
                        p={1}
                      >
                        <Text fontSize={"14px"} as={"b"}>
                          仅导出当前场景
                        </Text>
                      </ListItem>
                      <ListItem
                        onClick={() => openExport()}
                        cursor={"pointer"}
                        userSelect={"none"}
                        _hover={{ bgColor: "teal.50" }}
                        display={"flex"}
                        alignItems={"center"}
                        p={1}
                      >
                        <Text fontSize={"14px"} as={"b"}>
                          导出全部场景
                        </Text>
                      </ListItem>
                    </List>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </ButtonGroup>
          </Flex>
        </CardBody>
      </Card>
      <Modal
        isOpen={isOpenPreview}
        onClose={closePreview}
        closeOnEsc={false}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent maxW={"820px"}>
          <ModalHeader>预览</ModalHeader>
          <ModalCloseButton />
          <ModalBody display={"flex"} justifyContent={"center"}>
            <Box
              width={{ base: "368px", md: "768px" }}
              height={{ base: "207px", md: "432px" }}
            >
              <canvas
                ref={previewRef}
                style={{ width: "100%", height: "100%" }}
              ></canvas>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="teal" onClick={closePreviewAndExport}>
              导出视频
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isOpenExport}
        onClose={closeExport}
        closeOnEsc={false}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent maxW={"820px"}>
          <ModalHeader>导出视频</ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            {exportVideoSrc ? (
              <Box
                width={{ base: "368px", md: "768px" }}
                height={{ base: "207px", md: "432px" }}
              >
                <video
                  src={exportVideoSrc}
                  style={{ width: "100%", height: "100%" }}
                  controls
                ></video>
              </Box>
            ) : (
              <Progress
                w={"100%"}
                colorScheme="teal"
                size="lg"
                value={exportProgress}
              ></Progress>
            )}
          </ModalBody>

          <ModalFooter display={"flex"} justifyContent={"space-between"}>
            {exportVideoSrc ? (
              <ButtonGroup colorScheme="blue">
                <Button onClick={goVideoUp}>视频投稿</Button>
                <Button onClick={goInteractiveVideoUp}>互动视频投稿</Button>
              </ButtonGroup>
            ) : (
              <Spacer></Spacer>
            )}
            {exportVideoSrc ? (
              <Button colorScheme="teal" onClick={onOpenFileName}>
                保存视频
              </Button>
            ) : (
              <Button colorScheme="red" onClick={stopExport}>
                停止导出
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isOpenFileName}
        onClose={onCloseFileName}
        closeOnEsc={false}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>保存视频</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel size="sm">文件名</FormLabel>
              <Input
                value={exportFileName}
                onChange={(event) => setExportFileName(event.target.value)}
              ></Input>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme={"teal"} onClick={saveVideo}>
              确定
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
