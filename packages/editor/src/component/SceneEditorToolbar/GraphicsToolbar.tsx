import {
  Box,
  Flex,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Portal,
  Tooltip,
  Icon,
} from "@chakra-ui/react";
import { Graphics } from "@vnve/core";
import { getEditor } from "../../lib/context";
import { HexColorPicker } from "react-colorful";
import IconImagesmodeSharp from "~icons/material-symbols/imagesmode-outline-sharp";
import IconFormatColorFill from "~icons/material-symbols/format-color-fill";

export default function GraphicsToolbar() {
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

  function changeFill(value: string) {
    const editor = getEditor();
    if (editor.activeChild) {
      const activeChild = editor.activeChild as Graphics;
      const width = activeChild.width;
      const height = activeChild.height;

      activeChild
        .clear()
        .beginFill(value)
        .drawRect(0, 0, width, height)
        .endFill();
    }
  }

  function changeLineStyle(width?: number, color?: string, alpha?: number) {
    const editor = getEditor();
    if (editor.activeChild) {
      const activeChild = editor.activeChild as Graphics;

      activeChild.lineStyle(
        width ?? activeChild.line.width,
        color ?? activeChild.line.color,
        alpha ?? activeChild.line.alpha,
      );
    }
  }

  return (
    <Flex alignItems={"center"} gap={2}>
      <Popover trigger="hover" placement="top-start">
        <PopoverTrigger>
          <Box cursor={"pointer"} w={6} h={6}>
            <Icon w={6} h={6} as={IconFormatColorFill}></Icon>
          </Box>
        </PopoverTrigger>
        <Portal>
          <PopoverContent w={"100%"}>
            <PopoverArrow />
            <PopoverBody>
              <HexColorPicker onChange={changeFill}></HexColorPicker>
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
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
    </Flex>
  );
}
