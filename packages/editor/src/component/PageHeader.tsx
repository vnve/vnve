import {
  Text,
  Flex,
  ButtonGroup,
  Button,
  Icon,
  useDisclosure,
  Image,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
} from "@chakra-ui/react";
import AssetLibrary from "./AssetLibrary/AssetLibrary";
import logo from "../assets/image/logo.webp";
import IconBox from "~icons/material-symbols/box-outline-sharp";
import IconGithub from "~icons/carbon/logo-github";
import IconSave from "~icons/material-symbols/save-outline-sharp";
import { EditorContext, getEditor } from "../lib/context";
import { useContext, useEffect, useRef, useState } from "react";
import { db } from "../lib/db";

export default function PageHeader() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setScenes } = useContext(EditorContext);
  const [lastSaveTime, setLastSaveTime] = useState(0);
  const toast = useToast();
  const {
    isOpen: isOpenDraftTip,
    onOpen: onOpenDraftTip,
    onClose: onCloseDraftTip,
  } = useDisclosure();
  const startAutoSave = useRef(false);

  useEffect(() => {
    checkDraft();

    const autoSaveTimer = setInterval(
      () => {
        if (startAutoSave.current) {
          saveDraft();
        }
      },
      3 * 60 * 1000,
    );

    return () => {
      clearInterval(autoSaveTimer);
    };
  }, []);

  function openGithubRepo() {
    window.open("https://github.com/vnve/vnve", "_blank");
  }

  async function checkDraft() {
    const hasDraft = await db.drafts.get(1);

    if (hasDraft) {
      onOpenDraftTip();
    }
  }

  async function applyDraft() {
    const editor = getEditor();
    let draft;

    try {
      draft = (await db.drafts.get(1)).content;
      const draftLoadingPromise = editor.loadFromJSON(draft);

      toast.promise(draftLoadingPromise, {
        success: { title: "草稿加载成功！", duration: 1000 },
        error: { title: "草稿加载失败!", duration: 1500 },
        loading: { title: "草稿加载中..." },
      });
      await draftLoadingPromise;
      setScenes([...editor.scenes]);
      onCloseDraftTip();
      startAutoSave.current = true;
    } catch (error) {
      console.log("load draft err:", error);
      console.log("error draft:", draft);
      toast({
        description: "草稿文件异常！",
        status: "error",
        duration: 1500,
      });
    }
  }

  function removeDraft() {
    db.drafts.delete(1);
    db.draftAssets.clear();
  }

  function closeDraftTip() {
    removeDraft();
    onCloseDraftTip();
    startAutoSave.current = true;
  }

  async function saveDraft() {
    const editor = getEditor();
    const now = Date.now();

    try {
      const draft = editor.saveAsJSON();
      await db.drafts.put({
        id: 1,
        name: "draft",
        content: draft,
        time: now,
      });
      setLastSaveTime(now);
    } catch (error) {
      console.error(error);
      toast({
        description: `保存失败：${error?.message}`,
        status: "error",
        duration: 1500,
      });
    }
  }

  return (
    <>
      <Flex
        align={"center"}
        justify={"space-between"}
        p={2}
        borderBottomWidth={"1px"}
      >
        <Flex alignItems={"center"}>
          <Image src={logo} w={9} h={9}></Image>
          <Text fontSize={"24px"} color={"teal"} as={"b"}>
            N V E
          </Text>
        </Flex>
        <Flex alignItems={"center"}>
          {lastSaveTime > 0 && (
            <Flex flexDirection={"column"} mr={0.5}>
              <Text color="teal" fontSize={"xs"}>
                自动保存于
              </Text>
              <Text color="teal" fontSize={"xs"}>
                {new Date(lastSaveTime).toLocaleString()}
              </Text>
            </Flex>
          )}
          <ButtonGroup spacing={0.5}>
            <Button colorScheme="teal" variant="ghost" onClick={saveDraft}>
              <Icon as={IconSave} w={6} h={6}></Icon>
            </Button>
            <Button colorScheme="teal" variant="ghost" onClick={onOpen}>
              <Icon as={IconBox} w={6} h={6}></Icon>
            </Button>
            <Button colorScheme="teal" variant="ghost" onClick={openGithubRepo}>
              <Icon as={IconGithub} w={6} h={6}></Icon>
            </Button>
          </ButtonGroup>
        </Flex>
      </Flex>
      <Modal
        isOpen={isOpenDraftTip}
        onClose={onCloseDraftTip}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>提示</ModalHeader>
          <ModalBody>检测到本地存在草稿文件，是否使用草稿继续编辑？</ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={closeDraftTip}>
              取消
            </Button>
            <Button colorScheme="teal" onClick={applyDraft}>
              确定
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <AssetLibrary isOpen={isOpen} onClose={onClose}></AssetLibrary>
    </>
  );
}
