import {
  Tooltip,
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  List,
  ListItem,
  Flex,
  Text,
  Icon,
  Tag,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { EditorContext, getEditor } from "../lib/context";
import { Scene } from "@vnve/core";
import IconSceneList from "~icons/material-symbols/movie-info-outline-sharp";
import IconMoveUp from "~icons/material-symbols/arrow-upward";
import IconMoveDown from "~icons/material-symbols/arrow-downward";
import IconCopy from "~icons/material-symbols/content-copy-outline-sharp";
import IconDelete from "~icons/material-symbols/delete-outline-sharp";
import { SCENE_TYPE_NAME_MAP } from "../lib/const";
import { DialogueScene } from "@vnve/template";

export default function SceneList({
  onOpenSceneDetailDrawer,
}: {
  onOpenSceneDetailDrawer?: () => void;
}) {
  const { activeScene, scenes, setScenes, setActiveScene, setActiveChild } =
    useContext(EditorContext);

  function changeActiveScene(scene: Scene) {
    const editor = getEditor();

    editor.renderScene(scene);
    setActiveScene({
      ...scene,
      transitions: [...scene.transitions],
      filters: scene.filters ? [...scene.filters] : null,
      sounds: [...scene.sounds],
      characterImgs: [...((scene as DialogueScene).characterImgs || [])],
    } as any);

    if (onOpenSceneDetailDrawer) {
      onOpenSceneDetailDrawer();
    }
  }

  function removeScene(scene: Scene, e: React.MouseEvent) {
    e.stopPropagation();

    const editor = getEditor();

    // for canvas update
    editor.removeScene(scene);
    // for view update
    setScenes(scenes.filter((item) => item.uuid !== scene.uuid));
    setActiveScene(undefined);
    setActiveChild(undefined);
  }

  function copyScene(scene: Scene, sceneIndex: number, e: React.MouseEvent) {
    e.stopPropagation();

    const editor = getEditor();

    const cloned = editor.cloneScene(scene);

    if (cloned) {
      editor.addScene(cloned);
      setScenes([...scenes, cloned]);
      changeActiveScene(cloned);
    }
  }

  function swapScene(
    sceneIndex: number,
    direction: "up" | "down",
    e: React.MouseEvent,
  ) {
    e.stopPropagation();

    const editor = getEditor();
    const swappedScenes = [...scenes];

    if (direction === "up") {
      editor.swapScene(sceneIndex, sceneIndex - 1);
      [swappedScenes[sceneIndex], swappedScenes[sceneIndex - 1]] = [
        swappedScenes[sceneIndex - 1],
        swappedScenes[sceneIndex],
      ];
    } else {
      editor.swapScene(sceneIndex, sceneIndex + 1);
      [swappedScenes[sceneIndex], swappedScenes[sceneIndex + 1]] = [
        swappedScenes[sceneIndex + 1],
        swappedScenes[sceneIndex],
      ];
    }

    setScenes(swappedScenes);
  }

  function sliceSceneName(text: string) {
    return text.length > 30 ? text.slice(0, 30) + "..." : text;
  }

  return (
    <Card flex={1}>
      <CardHeader>
        <Heading size={"sm"} display={"flex"} alignItems={"center"}>
          场景列表
          <Icon as={IconSceneList} w={6} h={6} ml={1}></Icon>
        </Heading>
      </CardHeader>
      <CardBody p={{ base: 1, md: 3 }}>
        <List spacing={1} maxH={"calc(100vh - 600px)"} overflow={"scroll"}>
          {scenes.map((scene, sceneIndex) => {
            return (
              <ListItem
                display={"flex"}
                alignItems={"center"}
                justifyContent={"space-between"}
                cursor={"pointer"}
                onClick={() => changeActiveScene(scene)}
                key={scene.uuid}
                h={"36px"}
                py={1}
                px={2}
                bgColor={activeScene?.uuid === scene.uuid ? "teal.50" : ""}
              >
                <Flex>
                  <Text display={"inline-block"} width={"24px"} fontSize={"sm"}>
                    {sceneIndex + 1}.
                  </Text>
                  <Tag colorScheme="green" size={"sm"} mr={1}>
                    {SCENE_TYPE_NAME_MAP[scene.type]}
                  </Tag>
                  <Tag colorScheme="blue" size={"sm"} mr={1}>
                    {(scene.duration / 1000).toFixed(1)}s
                  </Tag>
                  <Text display={"inline-block"} fontSize={"sm"}>
                    {sliceSceneName(scene.name)}
                  </Text>
                </Flex>
                <Flex gap={2} alignItems={"center"}>
                  {sceneIndex !== 0 && (
                    <Tooltip label="上移">
                      <Box cursor={"pointer"} w={5} h={5}>
                        <Icon
                          w={5}
                          h={5}
                          as={IconMoveUp}
                          onClick={(e) => swapScene(sceneIndex, "up", e)}
                        ></Icon>
                      </Box>
                    </Tooltip>
                  )}
                  {sceneIndex !== scenes.length - 1 && (
                    <Tooltip label="下移">
                      <Box cursor={"pointer"} w={5} h={5}>
                        <Icon
                          w={5}
                          h={5}
                          as={IconMoveDown}
                          onClick={(e) => swapScene(sceneIndex, "down", e)}
                        ></Icon>
                      </Box>
                    </Tooltip>
                  )}
                  <Tooltip label="复制">
                    <Box cursor={"pointer"} w={5} h={5}>
                      <Icon
                        w={5}
                        h={5}
                        as={IconCopy}
                        onClick={(e) => copyScene(scene, sceneIndex, e)}
                      ></Icon>
                    </Box>
                  </Tooltip>
                  <Tooltip label="删除">
                    <Box cursor={"pointer"} w={5} h={5}>
                      <Icon
                        w={5}
                        h={5}
                        as={IconDelete}
                        onClick={(e) => removeScene(scene, e)}
                      ></Icon>
                    </Box>
                  </Tooltip>
                </Flex>
              </ListItem>
            );
          })}
        </List>
      </CardBody>
    </Card>
  );
}
