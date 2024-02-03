import { useContext } from "react";
import {
  Tooltip,
  Flex,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  Portal,
  Select,
  Icon,
  Box,
  Textarea,
} from "@chakra-ui/react";
import { Text as TextChild } from "@vnve/core";
import { EditorContext, getEditor } from "../../lib/context";
import { HexColorPicker } from "react-colorful";
import IconFormatColorText from "~icons/material-symbols/format-color-text";
import IconEdit from "~icons/material-symbols/edit";
import IconTextIncrease from "~icons/material-symbols/text-increase";
import IconTextDecrease from "~icons/material-symbols/text-decrease";
import IconFormatBlod from "~icons/material-symbols/format-bold";
import IconFormatItalic from "~icons/material-symbols/format-italic";
import IconFormatClear from "~icons/material-symbols/format-clear";
import IconFont from "~icons/material-symbols/font-download-outline-sharp";
import { FONT_LIST } from "../../lib/const";

export default function TextToolbar({
  activeChild,
  changeActiveChild,
}: {
  activeChild: TextChild;
  changeActiveChild: (props: string, value: any) => void;
}) {
  const { setActiveChild } = useContext(EditorContext);

  function changeStyle(prop: string, value: any) {
    const editor = getEditor();
    const textChild = editor.activeChild as TextChild;

    textChild._width = 0;
    textChild._height = 0;
    textChild.style[prop] = value;
    setActiveChild({
      ...activeChild,
      style: {
        ...activeChild.style,
        [prop]: value,
      },
    } as TextChild);
  }

  function changeFontSize(type: "increase" | "decrease") {
    const fontSize = Number(activeChild.style.fontSize);

    changeStyle(
      "fontSize",
      type === "increase" ? fontSize + 10 : fontSize - 10,
    );
  }

  function changeFontFamily(value: string) {
    changeStyle("fontFamily", value);
  }

  function clearTextFormat() {
    changeStyle("fontWeight", "normal");
    changeStyle("fontStyle", "normal");
  }

  function changeTextContent(value: string) {
    const editor = getEditor();

    (editor.activeChild as TextChild)._width = 0;
    (editor.activeChild as TextChild)._height = 0;
    (editor.activeChild as TextChild).text = value;
    changeActiveChild("text", value);
  }

  return (
    <Flex gap={2} alignItems={"center"}>
      <Popover trigger="hover">
        <PopoverTrigger>
          <Box cursor={"pointer"} w={6} h={6}>
            <Icon w={6} h={6} as={IconEdit}></Icon>
          </Box>
        </PopoverTrigger>
        <Portal>
          <PopoverContent>
            <PopoverArrow />
            <PopoverHeader as={"b"}>文本内容</PopoverHeader>
            <PopoverBody>
              <Textarea
                placeholder="文本内容"
                value={activeChild.text || ""}
                onChange={(event) => changeTextContent(event.target.value)}
              ></Textarea>
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
      <Popover trigger="hover">
        <PopoverTrigger>
          <Box cursor={"pointer"} w={6} h={6}>
            <Icon w={6} h={6} as={IconFormatColorText}></Icon>
          </Box>
        </PopoverTrigger>
        <Portal>
          <PopoverContent w={"100%"}>
            <PopoverArrow />
            <PopoverBody>
              <HexColorPicker
                color={activeChild.style.fill as string}
                onChange={(value) => changeStyle("fill", value)}
              ></HexColorPicker>
              {/* <HexColorInput
                color={activeChild.style.fill as string}
                onChange={(value) => changeStyle("fill", value)}
              ></HexColorInput> */}
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
      <Tooltip label="减少字号">
        <Box cursor={"pointer"} w={6} h={6}>
          <Icon
            w={6}
            h={6}
            as={IconTextDecrease}
            onClick={() => changeFontSize("decrease")}
          ></Icon>
        </Box>
      </Tooltip>
      <Tooltip label="增加字号">
        <Box cursor={"pointer"} w={6} h={6}>
          <Icon
            w={6}
            h={6}
            as={IconTextIncrease}
            onClick={() => changeFontSize("increase")}
          ></Icon>
        </Box>
      </Tooltip>
      <Tooltip label="加粗">
        <Box cursor={"pointer"} w={6} h={6}>
          <Icon
            w={6}
            h={6}
            as={IconFormatBlod}
            onClick={() => changeStyle("fontWeight", "bold")}
          ></Icon>
        </Box>
      </Tooltip>
      <Tooltip label="倾斜">
        <Box cursor={"pointer"} w={6} h={6}>
          <Icon
            w={6}
            h={6}
            as={IconFormatItalic}
            onClick={() => changeStyle("fontStyle", "italic")}
          ></Icon>
        </Box>
      </Tooltip>
      <Tooltip label="清除样式">
        <Box cursor={"pointer"} w={6} h={6}>
          <Icon
            w={6}
            h={6}
            as={IconFormatClear}
            onClick={clearTextFormat}
          ></Icon>
        </Box>
      </Tooltip>

      <Popover trigger="hover">
        <PopoverTrigger>
          <Box cursor={"pointer"} w={6} h={6}>
            <Icon w={6} h={6} as={IconFont}></Icon>
          </Box>
        </PopoverTrigger>
        <Portal>
          <PopoverContent>
            <PopoverArrow />
            <PopoverHeader as={"b"}>字体</PopoverHeader>
            <PopoverBody>
              <Select
                value={activeChild.style.fontFamily}
                onChange={(event) => changeFontFamily(event.target.value)}
              >
                {FONT_LIST.map((item) => {
                  return (
                    <option key={item.value} value={item.value}>
                      {item.name}
                    </option>
                  );
                })}
              </Select>
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    </Flex>
  );
}
