import {
  Text,
  Flex,
  Button,
  Icon,
  useDisclosure,
  Image,
} from "@chakra-ui/react";
import AssetLibrary from "./AssetLibrary/AssetLibrary";
import logo from "../assets/image/logo.webp";
import IconBox from "~icons/material-symbols/box-outline-sharp";
import IconGithub from "~icons/carbon/logo-github";

export default function PageHeader() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  function openGithubRepo() {
    window.open("https://github.com/vnve/vnve", "_blank");
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
        <Flex>
          <Button colorScheme="teal" variant="ghost" onClick={onOpen}>
            <Icon as={IconBox} w={6} h={6}></Icon>
          </Button>
          <Button colorScheme="teal" variant="ghost" onClick={openGithubRepo}>
            <Icon as={IconGithub} w={6} h={6}></Icon>
          </Button>
        </Flex>
      </Flex>
      <AssetLibrary isOpen={isOpen} onClose={onClose}></AssetLibrary>
    </>
  );
}
