import { Tooltip, Icon, Box, Flex, useDisclosure } from "@chakra-ui/react";
import { Img } from "@vnve/core";
import { getEditor } from "../../lib/context";
import { AssetItem } from "../../lib/assets";
import AssetLibrary from "../AssetLibrary/AssetLibrary";
import IconImagesmodeSharp from "~icons/material-symbols/imagesmode-outline-sharp";
import IconPhotoLibrary from "~icons/material-symbols/reset-image-sharp";

export default function ImgToolbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  function setAsBackground() {
    const editor = getEditor();
    if (editor.activeChild) {
      editor.activeChild.x = 0;
      editor.activeChild.y = 0;
      editor.activeChild.width = editor.width;
      editor.activeChild.height = editor.height;
      editor.moveChildToBottom();
    }
  }

  function changeImg(asset: AssetItem) {
    const editor = getEditor();

    if (editor.activeChild) {
      const activeChild = editor.activeChild as Img;

      activeChild.name = asset.name;
      activeChild.source = asset.source;
      activeChild.load();
    }
  }

  return (
    <Flex gap={2} alignItems={"center"}>
      <Tooltip label="更换图片">
        <Box cursor={"pointer"} w={6} h={6}>
          <Icon w={6} h={6} as={IconPhotoLibrary} onClick={onOpen}></Icon>
        </Box>
      </Tooltip>
      <Tooltip label="设为背景">
        <Box cursor={"pointer"} w={6} h={6}>
          <Icon
            w={6}
            h={6}
            as={IconImagesmodeSharp}
            onClick={setAsBackground}
          ></Icon>
        </Box>
      </Tooltip>
      <AssetLibrary
        type="image"
        isOpen={isOpen}
        onClose={onClose}
        onSelect={changeImg}
      ></AssetLibrary>
    </Flex>
  );
}
