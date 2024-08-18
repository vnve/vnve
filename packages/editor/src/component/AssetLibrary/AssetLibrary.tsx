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
import { useMemo } from "react";

export default function AssetLibrary({
  type,
  typeFilter,
  sourceTypeFilter,
  isOpen,
  onClose,
  onSelect,
}: {
  type?: "image" | "audio" | "video";
  typeFilter?: "background" | "character" | "dialog";
  sourceTypeFilter?: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (asset: AssetItem) => void;
}) {
  const defaultIndex = useMemo(() => {
    const indexMap = {
      image: 0,
      audio: 1,
      video: 2,
    };

    return indexMap[type] || 0;
  }, [type]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent minW={"90vw"} minH={"75vh"} maxW={"90vw"} maxH={"75vh"}>
        <ModalHeader>素材库</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflow={"scroll"} p={{ base: 2, md: 4 }}>
          <Tabs size={"sm"} defaultIndex={defaultIndex}>
            <TabList>
              <Tab isDisabled={type ? type !== "image" : false}>图片</Tab>
              <Tab isDisabled={type ? type !== "audio" : false}>音频</Tab>
              <Tab isDisabled={type ? type !== "video" : false}>视频</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <AssetList
                  type="image"
                  typeFilter={typeFilter}
                  sourceTypeFilter={sourceTypeFilter}
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
              <TabPanel>
                <AssetList
                  type="video"
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
