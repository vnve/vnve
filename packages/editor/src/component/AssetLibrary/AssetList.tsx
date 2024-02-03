import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";
import { useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import {
  Stack,
  Box,
  Flex,
  Input,
  Button,
  RadioGroup,
  Radio,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  FormControl,
  FormLabel,
  Select,
  useToast,
  Image,
  Text,
  useDisclosure,
  Icon,
} from "@chakra-ui/react";
import {
  PRESET_ASSETS,
  PRESET_IMAGE_TYPE_OPTIONS,
  PRESET_AUDIO_TYPE_OPTIONS,
  AssetItem,
} from "../../lib/assets";
import IconDelete from "~icons/material-symbols/delete-outline-sharp";
import IconEdit from "~icons/material-symbols/edit-square-outline-sharp";
import GlobalLoading from "../GlobalLoading";

const ImageEditor = lazy(() => import("./ImageEditor"));

export default function AssetList({
  type,
  typeFilter,
  onClose,
  onSelect,
}: {
  type: "image" | "audio";
  typeFilter?: "background" | "character" | "dialog";
  onClose: () => void;
  onSelect?: (asset: AssetItem) => void;
}) {
  const { isOpen, onToggle, onClose: onClosePopover } = useDisclosure();
  const toast = useToast();
  const typeOptionMap = {
    image: PRESET_IMAGE_TYPE_OPTIONS,
    audio: PRESET_AUDIO_TYPE_OPTIONS,
    font: [],
  };
  const typeOptions = typeOptionMap[type];
  const filterTypeOptions = [
    {
      name: "全部",
      value: type,
    },
    ...typeOptions,
  ];
  const presetAssets = useMemo(
    () => PRESET_ASSETS.filter((item) => item.type.includes(type)),
    [type],
  );
  const dbAssets = useLiveQuery(() =>
    db.assets.where("type").anyOf(type).reverse().toArray(),
  );
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>(type);
  const assets: AssetItem[] = useMemo(
    () =>
      [
        ...(dbAssets || []).map((item) => {
          const id = item.id!;
          let sourceURL = db.getSourceURL(id);

          if (!sourceURL) {
            sourceURL = `${URL.createObjectURL(item.source)}#id=${item.id!}`;
            db.addSourceURL(id, sourceURL);
          }

          return {
            ...item,
            id,
            source: sourceURL,
          };
        }),
        ...presetAssets,
      ].filter((item) => item.type.includes(assetTypeFilter)),
    [presetAssets, dbAssets, assetTypeFilter],
  );
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetType, setNewAssetType] = useState("");
  const [editAssetItem, setEditAssetItem] = useState<AssetItem>();
  const newAssetFileRef = useRef(null);

  const [isImgEditorShown, setIsImgEditorShown] = useState(false);

  useEffect(() => {
    if (typeFilter) {
      setAssetTypeFilter(typeFilter);
    }
  }, [typeFilter]);

  function openImgEditor(e: React.MouseEvent, asset: AssetItem) {
    e.stopPropagation();
    setEditAssetItem(asset);
    setIsImgEditorShown(true);
  }

  function saveEditAssetItem(editedImageObject) {
    editedImageObject.imageCanvas.toBlob((blob) => {
      db.assets.where("id").equals(editAssetItem.id).modify({
        source: blob,
      });
      db.updateSourceURL(editAssetItem.id, URL.createObjectURL(blob));
      closeImgEditor();
    });
  }

  function closeImgEditor() {
    setIsImgEditorShown(false);
  }

  function resetAddAssetForm() {
    onClosePopover();
    setNewAssetName("");
    setNewAssetType("");
    (newAssetFileRef.current as any).value = "";
  }

  function addAsset() {
    if (!newAssetName) {
      toast({
        description: "请输入素材名称！",
        status: "warning",
        duration: 1000,
      });
      return;
    }

    const sourceFile = (newAssetFileRef.current as any)?.files?.[0];

    if (!sourceFile) {
      toast({
        description: "请选择文件！",
        status: "warning",
        duration: 1000,
      });
      return;
    }

    db.assets.add({
      name: newAssetName,
      type: newAssetType ? [type, newAssetType] : [type],
      tag: [],
      source: sourceFile,
    });
    toast({
      description: "已添加！",
      status: "success",
      duration: 1000,
      isClosable: true,
    });
    onClosePopover();
    resetAddAssetForm();
  }

  function deleteAsset(e: React.MouseEvent, id?: number) {
    e.stopPropagation();
    db.assets.where("id").equals(id!).delete();
    db.removeSourceURL(id);
  }

  function selectAsset(asset: AssetItem) {
    if (onSelect) {
      onSelect(asset);
      onClose();
    }
  }

  function getAssetFileType() {
    const typeMap = {
      image: ".webp, .png, .jpg",
      audio: ".mp3, .wav",
    };

    return typeMap[type];
  }

  return (
    <Box>
      <Flex mb={4} justifyContent={"space-between"} alignItems={"center"}>
        <RadioGroup
          size="sm"
          onChange={setAssetTypeFilter}
          value={assetTypeFilter}
        >
          <Stack direction="row">
            {filterTypeOptions.map((item) => {
              return (
                <Radio key={item.value} value={item.value}>
                  {item.name}
                </Radio>
              );
            })}
          </Stack>
        </RadioGroup>

        <Popover
          isOpen={isOpen}
          onClose={resetAddAssetForm}
          closeOnBlur={false}
        >
          <PopoverTrigger>
            <Button
              colorScheme="teal"
              size={{ base: "xs", md: "sm" }}
              onClick={onToggle}
            >
              新增素材
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader as={"b"}>新增本地素材</PopoverHeader>
            <PopoverBody>
              <Flex direction={"column"} gap={2}>
                {type === "image" && (
                  <Text fontSize={"xs"} color={"orange"}>
                    图片素材请注意，视频画布尺寸为1920*1080px
                  </Text>
                )}
                <FormControl>
                  <FormLabel fontSize={"sm"}>名称</FormLabel>
                  <Input
                    value={newAssetName}
                    onChange={(event) => setNewAssetName(event.target.value)}
                  ></Input>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"}>类别</FormLabel>
                  <Select
                    placeholder="请选择"
                    value={newAssetType}
                    onChange={(event) => setNewAssetType(event.target.value)}
                  >
                    {typeOptions.map((item) => {
                      return (
                        <option key={item.value} value={item.value}>
                          {item.name}
                        </option>
                      );
                    })}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"}>文件</FormLabel>
                  <Input
                    ref={newAssetFileRef}
                    type="file"
                    accept={getAssetFileType()}
                    p={0.5}
                  ></Input>
                </FormControl>
              </Flex>
            </PopoverBody>
            <PopoverFooter display={"flex"} justifyContent={"center"}>
              <Button colorScheme="teal" onClick={addAsset}>
                确定
              </Button>
            </PopoverFooter>
          </PopoverContent>
        </Popover>
      </Flex>

      <Flex gap={4} flexWrap={"wrap"}>
        {assets?.map((asset) => (
          <Flex
            key={asset.id}
            flexDirection={"column"}
            alignItems={"center"}
            cursor={"pointer"}
            onClick={() => selectAsset(asset)}
          >
            {type === "image" && (
              <Image
                w={"240px"}
                h={"135px"}
                src={asset.source}
                objectFit={"scale-down"}
              ></Image>
            )}
            {type === "audio" && <audio src={asset.source} controls></audio>}
            <Flex mt={2} w={"100%"} justifyContent={"space-between"}>
              <Text fontSize={"sm"}>{asset.name}</Text>
              {asset.id < 100000 && (
                <Box>
                  {type === "image" && (
                    <Icon
                      w={5}
                      h={5}
                      cursor={"pointer"}
                      as={IconEdit}
                      onClick={(e) => openImgEditor(e, asset)}
                    >
                      编辑
                    </Icon>
                  )}

                  <Icon
                    w={5}
                    h={5}
                    cursor={"pointer"}
                    as={IconDelete}
                    onClick={(e) => deleteAsset(e, asset.id)}
                    ml={2}
                  >
                    删除
                  </Icon>
                </Box>
              )}
            </Flex>
          </Flex>
        ))}
      </Flex>
      {isImgEditorShown && (
        <Suspense
          fallback={<GlobalLoading text="图片编辑器加载中..."></GlobalLoading>}
        >
          <ImageEditor
            editAssetItem={editAssetItem}
            onSaveEditAssetItem={saveEditAssetItem}
            onCloseImgEditor={closeImgEditor}
          />
        </Suspense>
      )}
    </Box>
  );
}
