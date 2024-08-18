import { Child, Scene, canIUse, Img, Sound, Editor, Video } from "@vnve/core";
import { useEffect, useState } from "react";
import { EditorContext } from "../lib/context";
import PageHeader from "../component/PageHeader";
import {
  Flex,
  Link,
  useToast,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
  DrawerFooter,
  Button,
} from "@chakra-ui/react";
import SceneEditor from "../component/SceneEditor";
import SceneDetail from "../component/SceneDetail";
import SceneList from "../component/SceneList";
import { BrowserEnvSupportType } from "../lib/const";
import { getSourceFromDB, setSourceToDB } from "../lib/utils";
import { MonologueScene, TitleScene, DialogueScene } from "@vnve/template";

Editor.supportSceneTypes = {
  Scene,
  MonologueScene,
  TitleScene,
  DialogueScene,
};
Sound.setSourceToDB = setSourceToDB;
Sound.getSourceFromDB = getSourceFromDB;
Img.setSourceToDB = setSourceToDB;
Img.getSourceFromDB = getSourceFromDB;
Video.setSourceToDB = setSourceToDB;
Video.getSourceFromDB = getSourceFromDB;

export default function EditorPage() {
  const [activeChild, setActiveChild] = useState<Child>();
  const [activeScene, setActiveScene] = useState<Scene>();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [supportStatus, setSupportStatus] =
    useState<BrowserEnvSupportType>("checkingEnv");
  const toast = useToast();
  const { isOpen, onOpen: onOpenSceneDetailDrawer, onClose } = useDisclosure();

  useEffect(() => {
    canIUse().then((result) => {
      // setSupportStatus("fullSupport");
      if (result.video && result.audio) {
        setSupportStatus("fullSupport");
      } else if (result.video && !result.audio) {
        setSupportStatus("onlyVideoSupport");
        toast({
          description:
            "当前浏览器仅支持视频合成，不支持音频～推荐使用电脑端最新的Chrome或Edge浏览器",
          status: "warning",
          isClosable: true,
        });
      } else {
        setSupportStatus("notSupport");
      }
    });
  }, [toast]);

  return (
    <EditorContext.Provider
      value={{
        activeChild,
        activeScene,
        scenes,
        setActiveChild,
        setActiveScene,
        setScenes,
      }}
    >
      {["fullSupport", "onlyVideoSupport"].includes(supportStatus) ? (
        <Flex direction={"column"} p={1} h={"100vh"}>
          <PageHeader></PageHeader>
          <Flex flex={1} justifyContent={"center"}>
            {window.screen.width < 768 ? (
              <Drawer placement={"left"} onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent maxWidth={"90vw"}>
                  <DrawerBody p={1}>
                    <SceneDetail
                      disabledAudio={supportStatus !== "fullSupport"}
                    ></SceneDetail>
                  </DrawerBody>
                  <DrawerFooter p={1}>
                    <Button variant="outline" mb={2} onClick={onClose}>
                      关闭
                    </Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            ) : (
              <SceneDetail
                disabledAudio={supportStatus !== "fullSupport"}
              ></SceneDetail>
            )}
            <Flex direction={"column"} flex={1} gap={1}>
              <SceneEditor
                onlyVideo={supportStatus === "onlyVideoSupport"}
              ></SceneEditor>
              <SceneList
                onOpenSceneDetailDrawer={
                  window.screen.width < 768 && onOpenSceneDetailDrawer
                }
              ></SceneList>
            </Flex>
          </Flex>
        </Flex>
      ) : (
        <Flex
          position={"fixed"}
          top={0}
          left={0}
          backgroundColor={"#fff"}
          justify={"center"}
          alignItems={"center"}
          w={"full"}
          h={"100vh"}
          fontSize={"2xl"}
          as={"b"}
        >
          {supportStatus === "checkingEnv" ? (
            <>浏览器环境检测中...</>
          ) : (
            <>
              请先升级至最新版本的
              <Link
                href="https://www.google.cn/intl/zh-CN/chrome/"
                isExternal
                color="teal"
              >
                Chrome
              </Link>
              或
              <Link
                href="https://www.microsoft.com/zh-cn/edge/download"
                isExternal
                color="teal"
              >
                Edge
              </Link>
              浏览器！
            </>
          )}
        </Flex>
      )}
    </EditorContext.Provider>
  );
}
