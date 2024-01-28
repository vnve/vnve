import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Select,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
} from "@chakra-ui/react";
import { PRESET_ANIMATION_LIST } from "../../lib/const";
import { getEditor } from "../../lib/context";
import { DialogueScene } from "@vnve/template";
import { useState } from "react";
import { AnimationParam, AnimationParamsValue, Child } from "@vnve/core";

export default function QuickAnimationSetting({
  activeScene,
  delay,
  isOpen,
  onClose,
}: {
  activeScene: DialogueScene;
  delay: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [target, setTarget] = useState<Child | undefined>();
  const [animationParam, setAnimationParam] = useState<AnimationParam>(
    PRESET_ANIMATION_LIST[0],
  );
  const toast = useToast();

  function changeTargetImg(uuid: string) {
    const editor = getEditor();
    const scene = editor.activeScene as DialogueScene;
    const hitTarget = scene.characterImgs.find((item) => item.uuid === uuid);

    if (hitTarget) {
      setTarget(hitTarget);
      changeAnimationValue("delay", delay / 1000);
    }
  }

  function changeAnimation(name: string) {
    const hit = PRESET_ANIMATION_LIST.find((preset) => preset.name === name);

    if (hit) {
      setAnimationParam({
        ...animationParam,
        name: hit.name,
        label: hit.label,
        value: hit.value,
      });
    }
  }

  function changeAnimationValue(
    key: "delay" | "duration" | "repeat",
    value: number | string | boolean,
  ) {
    setAnimationParam({
      ...animationParam,
      value: animationParam.value.map((v, i) => {
        if (i === 1) {
          return {
            ...v,
            [key]: key === "repeat" ? (value ? -1 : 0) : Number(value) * 1000,
          };
        } else {
          return v;
        }
      }) as AnimationParamsValue,
    });
  }

  function addAnimation() {
    if (!target) {
      toast({
        description: "请先选择目标立绘",
        status: "warning",
        duration: 1000,
      });
      return;
    }

    target.addAnimation(animationParam);
    onClose();
    setTarget(undefined);
    setAnimationParam(PRESET_ANIMATION_LIST[0]);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>新增动画</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex gap={2} flexDirection={"column"}>
            <FormControl>
              <FormLabel fontSize={"sm"}>目标立绘</FormLabel>
              <Select
                placeholder="请选择立绘"
                value={target ? target.uuid : ""}
                onChange={(event) => changeTargetImg(event.target.value)}
              >
                {activeScene?.characterImgs?.map((option) => {
                  return (
                    <option key={option.name} value={option.uuid}>
                      {option.name}
                    </option>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize={"sm"}>效果</FormLabel>
              <Select
                value={animationParam.name}
                onChange={(event) => changeAnimation(event.target.value)}
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
                precision={1}
                value={(animationParam.value[1].duration as number) / 1000 || 0}
                min={0.001}
                step={0.1}
                onChange={(value) => changeAnimationValue("duration", value)}
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
                value={(animationParam.value[1].delay as number) / 1000 || 0}
                precision={1}
                min={0}
                step={0.1}
                onChange={(value) => changeAnimationValue("delay", value)}
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
                isChecked={animationParam.value[1].repeat === -1}
                onChange={(event) =>
                  changeAnimationValue("repeat", event.target.checked)
                }
              ></Switch>
            </FormControl>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button mr={2} onClick={onClose}>
            取消
          </Button>
          <Button colorScheme="teal" onClick={addAnimation}>
            确定
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
