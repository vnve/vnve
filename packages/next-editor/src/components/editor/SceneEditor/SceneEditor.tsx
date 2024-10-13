import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store";
import { useEffect, useRef } from "react";
import { useAssetLibrary } from "@/hooks";
import { DBAssetType } from "@/db";
import { createSprite } from "@/lib/core";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Compositor,
  Director,
  createDialogueScene,
  createTitleScene,
  createMonologueScene,
  Scene,
} from "@vnve/next-core";
import { Card, CardContent } from "@/components/ui/card";

const DEFAULT_SCENE_TEMPLATES = [
  {
    label: "对话",
    value: createDialogueScene,
  },
  {
    label: "独白",
    value: createMonologueScene,
  },
  {
    label: "标题",
    value: createTitleScene,
  },
];

export function SceneEditor() {
  const initEditor = useEditorStore((state) => state.initEditor);
  const editor = useEditorStore((state) => state.editor);
  const activeChild = useEditorStore((state) => state.activeChild);
  const activeScene = useEditorStore((state) => state.activeScene);
  const { selectAsset } = useAssetLibrary();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const adjustCanvasWidth = () => {
    const container = canvasContainerRef.current;
    const canvas = canvasRef.current;

    if (container && canvas) {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const aspectRatio = 16 / 9;

      let width = containerWidth;
      let height = containerWidth / aspectRatio;

      if (height > containerHeight) {
        height = containerHeight;
        width = containerHeight * aspectRatio;
      }

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }
  };

  const handleAddScene = (createTemplateScene: () => Scene) => () => {
    const newScene = createTemplateScene();

    editor.addScene(newScene);
    editor.setActiveScene(newScene);
  };

  const handleAddSprite = (assetType: DBAssetType) => async () => {
    const asset = await selectAsset(assetType);

    if (asset) {
      const sprite = await createSprite(asset, editor);

      editor.addChild(sprite);
    }
  };

  const handlePreviewScenes = async () => {
    //
  };

  const handleExportScenes = async () => {
    const director = new Director({
      background: 0xcccccc,
    });
    const screenplay = await editor.exportScreenplay();
    const compositor = new Compositor({
      width: 1920,
      height: 1080,
      fps: 30,
      // disableAudio: true,
    });

    director.connect(compositor);
    director.action(screenplay).then((res) => {
      const videoSrc = URL.createObjectURL(res);
      console.log("finish", videoSrc);
      const video = document.createElement("video");
      video.src = videoSrc;
      video.width = 1920 / 2;
      video.height = 1080 / 2;
      video.controls = true;
      document.body.append(video);
    });
  };

  useEffect(() => {
    window.addEventListener("resize", adjustCanvasWidth);

    adjustCanvasWidth();
    initEditor(canvasRef.current);

    return () => {
      window.removeEventListener("resize", adjustCanvasWidth);
    };
  }, [initEditor]);

  return (
    <div className="flex flex-col gap-2 flex-1">
      {/* <Button
            onClick={() => {
              selectAsset().then((res) => {
                console.log("res", res);
              });
            }}
          >
            素材
          </Button> */}
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>场景</MenubarTrigger>
          <MenubarContent>
            {DEFAULT_SCENE_TEMPLATES.map((template) => {
              return (
                <MenubarItem
                  onClick={handleAddScene(template.value)}
                  key={template.label}
                >
                  新建{template.label}场景
                </MenubarItem>
              );
            })}
            <MenubarSeparator />
            <MenubarItem>自定义模版</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>管理模版...</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>元素</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={handleAddSprite(DBAssetType.Character)}>
              添加角色
            </MenubarItem>
            <MenubarItem onClick={handleAddSprite(DBAssetType.Background)}>
              添加背景
            </MenubarItem>
            <MenubarItem onClick={handleAddSprite(DBAssetType.Thing)}>
              添加物品
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>预览</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>仅预览当前场景</MenubarItem>
            <MenubarItem>从当前场景开始预览</MenubarItem>
            <MenubarItem>从头开始预览</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>导出</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>仅导出当前场景</MenubarItem>
            <MenubarItem onClick={handleExportScenes}>导出所有场景</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <Card className="flex-1 rounded-md">
        <CardContent className="relative h-full p-2">
          <div
            className="w-full h-full flex justify-center items-center"
            ref={canvasContainerRef}
          >
            <canvas id="editor" ref={canvasRef}></canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
