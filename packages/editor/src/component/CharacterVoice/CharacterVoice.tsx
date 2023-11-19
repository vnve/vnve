import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
} from "@chakra-ui/react";
import { useState } from "react";
import RecordUserVoice from "./RecordUserVoice";
import UploadVoice from "./UploadVoice";

export default function CharacterVoice({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (url: string) => void;
}) {
  const [voiceUrl, setVoiceUrl] = useState("");

  function select() {
    onSelect(voiceUrl);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>配音</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflow={"scroll"}>
          <Tabs size={"sm"}>
            <TabList>
              <Tab>录制配音</Tab>
              <Tab>上传配音</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <RecordUserVoice
                  onChangeVoiceUrl={setVoiceUrl}
                ></RecordUserVoice>
              </TabPanel>
              <TabPanel>
                <UploadVoice onChangeVoiceUrl={setVoiceUrl}></UploadVoice>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="teal" onClick={select}>
            使用
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
