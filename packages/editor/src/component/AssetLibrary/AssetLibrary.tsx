import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import AssetList from "./AssetList";
import { AssetItem } from "../../lib/assets";

export default function AssetLibrary({
  type,
  typeFilter,
  isOpen,
  onClose,
  onSelect,
}: {
  type?: "image" | "audio";
  typeFilter?: "background" | "character" | "dialog";
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (asset: AssetItem) => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent minW={"820px"} minH={"600px"} maxW={"820px"} maxH={"640px"}>
        <ModalHeader>素材库</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflow={"scroll"}>
          <Tabs size={"sm"} defaultIndex={type === "audio" ? 1 : 0}>
            <TabList>
              <Tab isDisabled={type === "audio"}>图片</Tab>
              <Tab isDisabled={type === "image"}>音频</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <AssetList
                  type="image"
                  typeFilter={typeFilter}
                  onClose={onClose}
                  onSelect={onSelect}
                ></AssetList>
              </TabPanel>
              <TabPanel>
                <AssetList
                  type="audio"
                  onClose={onClose}
                  onSelect={onSelect}
                ></AssetList>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
