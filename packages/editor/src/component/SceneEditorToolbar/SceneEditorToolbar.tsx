import { useContext } from "react";
import { EditorContext, getEditor } from "../../lib/context";
import { Flex, Divider } from "@chakra-ui/react";
import { Child, Text, Video } from "@vnve/core";
import CommonToolbar from "./CommonToolbar";
import TextToolbar from "./TextToolbar";
import ImgToolbar from "./ImgToolbar";
import GraphicsToolbar from "./GraphicsToolbar";
import VideoToolbar from "./VideoToolbar";

export default function SceneEditorToolbar() {
  const { activeChild, setActiveChild } = useContext(EditorContext);

  function changeActiveChild(props: string, value: any) {
    if (activeChild) {
      const editor = getEditor();
      editor.activeChild[props] = value;
      setActiveChild({
        ...activeChild,
        [props]: value,
      } as Child);
    }
  }

  return (
    <Flex
      mb={1}
      h={9}
      alignItems={"center"}
      maxWidth={{ base: "calc(100vw - 20px)", md: "initial" }}
      overflowX={"scroll"}
    >
      {activeChild && (
        <>
          {activeChild.type === "Text" && (
            <TextToolbar
              activeChild={activeChild as Text}
              changeActiveChild={changeActiveChild}
            ></TextToolbar>
          )}
          {["Img", "AnimatedGIF"].includes(activeChild.type) && (
            <ImgToolbar type={activeChild.type}></ImgToolbar>
          )}
          {activeChild.type === "Video" && (
            <VideoToolbar
              activeChild={activeChild as Video}
              changeActiveChild={changeActiveChild}
            ></VideoToolbar>
          )}
          {activeChild.type === "Graphics" && (
            <GraphicsToolbar></GraphicsToolbar>
          )}
          <Divider orientation="vertical" h={5} ml={1} mr={1}></Divider>
          <CommonToolbar
            activeChild={activeChild}
            changeActiveChild={changeActiveChild}
          ></CommonToolbar>
        </>
      )}
    </Flex>
  );
}
