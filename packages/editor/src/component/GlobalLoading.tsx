import { Spinner, Flex, Text, Box } from "@chakra-ui/react";

export default function GlobalLoading({ text }: { text: string }) {
  return (
    <Flex
      position={"fixed"}
      zIndex={99999}
      top={0}
      left={0}
      width={"100vw"}
      height={"100vh"}
      justify={"center"}
      alignItems={"center"}
      flexDirection={"column"}
      backgroundColor={"rgba(0,0,0, 0.6)"}
    >
      <Spinner color={"teal.300"} size={"md"} mb={2}></Spinner>
      <Text color={"teal.300"} fontSize={"md"}>
        {text}
      </Text>
    </Flex>
  );
}
