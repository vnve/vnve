import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Textarea,
  useDisclosure,
  Icon,
} from "@chakra-ui/react";
import { TitleScene } from "@vnve/template";
import { getEditor } from "../../lib/context";
import { Img, Scene } from "@vnve/core";
import AssetLibrary from "../AssetLibrary/AssetLibrary";
import { AssetItem } from "../../lib/assets";
import IconDelete from "~icons/material-symbols/delete-outline-sharp";
import IconEdit from "~icons/material-symbols/edit-square-outline-sharp";

export default function TitleSceneDetail({
  activeScene,
  setActiveScene,
}: {
  activeScene: TitleScene;
  setActiveScene: React.Dispatch<React.SetStateAction<Scene | undefined>>;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  function changeTitleText(value: string) {
    const editor = getEditor();

    (editor.activeScene as TitleScene).titleText._width = 0;
    (editor.activeScene as TitleScene).titleText._height = 0;
    (editor.activeScene as TitleScene).titleText.text = value;
    setActiveScene({
      ...activeScene,
      titleText: {
        ...activeScene.titleText,
        text: value,
      },
    } as TitleScene);
  }

  function changeSubTitleText(value: string) {
    const editor = getEditor();

    (editor.activeScene as TitleScene)!.subtitleText._width = 0;
    (editor.activeScene as TitleScene)!.subtitleText._height = 0;
    (editor.activeScene as TitleScene)!.subtitleText!.text = value;
    setActiveScene({
      ...activeScene,
      subtitleText: {
        ...activeScene.subtitleText,
        text: value,
      },
    } as TitleScene);
  }

  async function selectBackground(asset: AssetItem) {
    const editor = getEditor();
    const backgroundImg = new Img({
      name: asset.name,
      source: asset.source,
    });

    backgroundImg.load();
    editor.addChildTransformListener(backgroundImg);
    (editor.activeScene as TitleScene).setBackgroundImg(backgroundImg);
    setActiveScene({
      ...activeScene,
      backgroundImg,
    } as TitleScene);
  }

  async function removeBackground() {
    const editor = getEditor();

    editor.removeChildTransformListener(
      (editor.activeScene as TitleScene).backgroundImg!,
    );
    (editor.activeScene as TitleScene).removeBackgroundImg();
    setActiveScene({
      ...activeScene,
      backgroundImg: undefined,
    } as TitleScene);
  }

  return (
    <Flex flexDirection={"column"} gap={6}>
      <FormControl>
        <FormLabel fontSize={"sm"}>主标题</FormLabel>
        <Textarea
          rows={2}
          value={activeScene.titleText.text}
          onChange={(event) => changeTitleText(event.target.value)}
        ></Textarea>
      </FormControl>
      <FormControl>
        <FormLabel fontSize={"sm"}>副标题</FormLabel>
        <Textarea
          rows={2}
          value={activeScene.subtitleText?.text || ""}
          onChange={(event) => changeSubTitleText(event.target.value)}
        ></Textarea>
      </FormControl>
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
      <AssetLibrary
        type="image"
        typeFilter="background"
        isOpen={isOpen}
        onClose={onClose}
        onSelect={selectBackground}
      ></AssetLibrary>
    </Flex>
  );
}
