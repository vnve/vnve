import {
  Tooltip,
  Icon,
  Box,
  Flex,
  useDisclosure,
  Popover,
  PopoverTrigger,
  Portal,
  PopoverContent,
  PopoverArrow,
  PopoverHeader,
  PopoverBody,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { Video } from "@vnve/core";
import { getEditor } from "../../lib/context";
import { AssetItem } from "../../lib/assets";
import AssetLibrary from "../AssetLibrary/AssetLibrary";
import IconFullScreen from "~icons/tdesign/fullscreen-2";
import TdesignVideo from "~icons/tdesign/video";
import TdesignVideoLibrary from "~icons/tdesign/video-library";

export default function VideoToolbar({
  activeChild,
  changeActiveChild,
}: {
  activeChild: Video;
  changeActiveChild: (props: string, value: any) => void;
}) {
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

  function changeVideo(asset: AssetItem) {
    const editor = getEditor();

    if (editor.activeChild) {
      const activeChild = editor.activeChild as Video;

      activeChild.name = asset.name;
      activeChild.source = asset.source;
      activeChild.load();
    }
  }

  function changeVideoDuration(value: number) {
    const duration = value * 1000;

    changeActiveChild("duration", duration);
  }

  return (
    <Flex gap={2} alignItems={"center"}>
      <Popover trigger="hover">
        <PopoverTrigger>
          <Box cursor={"pointer"} w={6} h={6}>
            <Icon as={TdesignVideo} w={6} h={6}></Icon>
          </Box>
        </PopoverTrigger>
        <Portal>
          <PopoverContent>
            <PopoverArrow />
            <PopoverHeader as={"b"}>视频时长(秒)</PopoverHeader>
            <PopoverBody>
              <NumberInput
                value={activeChild.duration / 1000}
                min={0}
                step={10}
                onChange={(value) => changeVideoDuration(+value)}
              >
                <NumberInputField type="number" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
      <Tooltip label="更换视频">
        <Box cursor={"pointer"} w={6} h={6}>
          <Icon w={6} h={6} as={TdesignVideoLibrary} onClick={onOpen}></Icon>
        </Box>
      </Tooltip>
      <Tooltip label="设为背景">
        <Box cursor={"pointer"} w={6} h={6}>
          <Icon
            w={6}
            h={6}
            as={IconFullScreen}
            onClick={setAsBackground}
          ></Icon>
        </Box>
      </Tooltip>
      <AssetLibrary
        type="video"
        isOpen={isOpen}
        onClose={onClose}
        onSelect={changeVideo}
      ></AssetLibrary>
    </Flex>
  );
}
