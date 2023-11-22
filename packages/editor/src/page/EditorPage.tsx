import { Child, Scene, isEnvSupported } from "@vnve/core";
import { useEffect, useState } from "react";
import { EditorContext, getEditor } from "../lib/context";
import PageHeader from "../component/PageHeader";
import { Flex, Link } from "@chakra-ui/react";
import SceneEditor from "../component/SceneEditor";
import SceneDetail from "../component/SceneDetail";
import SceneList from "../component/SceneList";

export default function EditorPage() {
  const [activeChild, setActiveChild] = useState<Child>();
  const [activeScene, setActiveScene] = useState<Scene>();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [supported, setSupported] = useState(true);

  isEnvSupported().then((result) => {
    setSupported(result);
  });

  // use effect to sync editor activeChild status
  useEffect(() => {
    const editor = getEditor();

    if (editor.activeChild) {
      // Object.assign(editor.activeChild, activeChild);
    }
  }, [activeChild]);

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
      <Flex direction={"column"} p={1} h={"100vh"}>
        <PageHeader></PageHeader>
        <Flex flex={1}>
          <SceneDetail></SceneDetail>
          <Flex direction={"column"} gap={1}>
            <SceneEditor></SceneEditor>
            <SceneList></SceneList>
          </Flex>
        </Flex>
      </Flex>
      {supported && (
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
        </Flex>
      )}
    </EditorContext.Provider>
  );
}
