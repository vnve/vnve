import { useEditorStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import { useAssetLibrary } from "@/components/hooks/useAssetLibrary";
import { DBAssetType, importAssetToDB, projectDB, templateDB } from "@/db";
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
import { Compositor, Previewer, Director, Scene } from "@vnve/next-core";
import { Card, CardContent } from "@/components/ui/card";
import { TemplateLibrary } from "../TemplateLibrary";
import { ExportVideoDialog } from "./ExportVideoDialog";
import { PreviewVideoDialog } from "./PreviewVideoDialog";
import { CreateProjectDialog, ProjectLibrary } from "../ProjectLibrary";
import { useToast } from "@/components/hooks/use-toast";
import { useTemplates } from "@/components/hooks/useTemplates";
import { ActionProgress } from "./types";

export function SceneEditor() {
  const initEditor = useEditorStore((state) => state.initEditor);
  const project = useEditorStore((state) => state.project);
  const editor = useEditorStore((state) => state.editor);
  const activeScene = useEditorStore((state) => state.activeScene);
  const scenes = useEditorStore((state) => state.scenes);
  const { selectAsset } = useAssetLibrary();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    defaultTemplates,
    customTemplates,
    handleAddDefaultTemplate,
    handleAddCustomTemplate,
  } = useTemplates();
  const [isOpenCreateProjectDialog, setIsOpenCreateProjectDialog] =
    useState(false);
  const [isOpenProjectLibrary, setIsOpenProjectLibrary] = useState(false);
  const [isOpenTemplateLibrary, setIsOpenTemplateLibrary] = useState(false);
  const [isOpenExportVideoDialog, setIsOpenExportVideoDialog] = useState(false);
  const [isOpenPreviewVideoDialog, setIsOpenPreviewVideoDialog] =
    useState(false);
  const previewVideoDialogRef = useRef(null);
  const [previewVideoRange, setPreviewVideoRange] = useState<number[]>([]);
  const [curExportVideoURL, setCurExportVideoURL] = useState<string | null>(
    null,
  );
  const director = useRef(null);
  const [actionProgress, setActionProgress] = useState<ActionProgress>({
    value: 0,
    currentTime: 0,
    duration: 0,
  });
  const { toast } = useToast();

  const resetActionProgress = () => {
    setActionProgress({
      value: 0,
      currentTime: 0,
      duration: 0,
    });
  };

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

  const handleSaveProject = async () => {
    try {
      await projectDB.update(project.id, {
        content: editor.saveAsJSON(),
        time: Date.now(),
      });
      toast({
        title: "保存成功！",
        duration: 1500,
      });
    } catch (error) {
      toast({
        title: "保存失败！",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddSprite = (assetType: DBAssetType) => async () => {
    const asset = await selectAsset(assetType);

    if (asset) {
      const sprite = await createSprite(asset, editor);

      editor.addChild(sprite);
    }
  };

  const handlePreviewScenes = async (start = 0, end?: number) => {
    resetActionProgress();
    setPreviewVideoRange([start, end]);
    setIsOpenPreviewVideoDialog(true);
    const screenplay = await editor.exportScreenplay(start, end);
    const previewer = new Previewer({
      canvas: previewVideoDialogRef.current.getPreviewCanvas(),
      width: 1920,
      height: 1080,
      fps: 30,
      // disableAudio: true,
    });

    director.current.connect(previewer);
    director.current
      .action(screenplay)
      .then(() => {
        console.log("预览完成");
      })
      .catch((error) => {
        setIsOpenPreviewVideoDialog(false);
        toast({
          title: "预览失败！",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  const handleExportScenes = async (start = 0, end?: number) => {
    resetActionProgress();
    setIsOpenExportVideoDialog(true);
    setCurExportVideoURL(null);
    const screenplay = await editor.exportScreenplay(start, end);
    const compositor = new Compositor({
      width: 1920,
      height: 1080,
      fps: 30,
      // disableAudio: true,
    });

    director.current.connect(compositor);
    director.current
      .action(screenplay)
      .then((res) => {
        const videoSrc = URL.createObjectURL(res);

        setCurExportVideoURL(videoSrc);
      })
      .catch((error) => {
        setIsOpenExportVideoDialog(false);
        toast({
          title: "导出失败！",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  const handleCloseExportVideoDialog = () => {
    setIsOpenExportVideoDialog(false);
    if (director.current.hasStarted()) {
      director.current.cut();
    }
    if (curExportVideoURL) {
      URL.revokeObjectURL(curExportVideoURL);
    }
    setCurExportVideoURL(null);
  };

  const handleClosePreviewVideoDialog = () => {
    setIsOpenPreviewVideoDialog(false);

    if (director.current.hasStarted()) {
      director.current.cut();
    }
  };

  const handlePreviewToExport = () => {
    setIsOpenPreviewVideoDialog(false);
    handleExportScenes(...previewVideoRange);
  };

  const handleImportAsset = async () => {
    await importAssetToDB();
    // TODO: loading + 提示
  };

  useEffect(() => {
    window.addEventListener("resize", adjustCanvasWidth);

    adjustCanvasWidth();
    initEditor(canvasRef.current);
    director.current = new Director({
      onProgress(progress, currentTime, duration) {
        setActionProgress({
          value: progress,
          currentTime,
          duration,
        });
      },
    });

    canvasRef.current.onselectstart = function () {
      return false;
    };

    return () => {
      window.removeEventListener("resize", adjustCanvasWidth);
    };
  }, [initEditor]);

  return (
    <div className="flex flex-col gap-2 flex-1">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger className="data-[disabled]:text-gray-400">
            项目
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setIsOpenCreateProjectDialog(true)}>
              创建新项目
            </MenubarItem>
            <MenubarItem onClick={() => setIsOpenProjectLibrary(true)}>
              打开...
            </MenubarItem>
            <MenubarItem disabled={!project} onClick={handleSaveProject}>
              保存
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger
            className="data-[disabled]:text-gray-400"
            disabled={!project}
          >
            场景
          </MenubarTrigger>
          <MenubarContent>
            {defaultTemplates.map((template) => {
              return (
                <MenubarItem
                  onClick={handleAddDefaultTemplate(template.content)}
                  key={template.name}
                >
                  新建{template.name}
                </MenubarItem>
              );
            })}
            {customTemplates.length > 0 && <MenubarSeparator />}
            {customTemplates.map((template) => {
              return (
                <MenubarItem
                  onClick={() => handleAddCustomTemplate(template.content)}
                  key={template.id}
                >
                  新建{template.name}
                </MenubarItem>
              );
            })}
            <MenubarSeparator />
            <MenubarItem onClick={() => setIsOpenTemplateLibrary(true)}>
              管理模版...
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger
            className="data-[disabled]:text-gray-400"
            disabled={!project}
          >
            素材
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem
              disabled={!activeScene}
              onClick={handleAddSprite(DBAssetType.Character)}
            >
              添加角色
            </MenubarItem>
            <MenubarItem
              disabled={!activeScene}
              onClick={handleAddSprite(DBAssetType.Background)}
            >
              添加背景
            </MenubarItem>
            <MenubarItem
              disabled={!activeScene}
              onClick={handleAddSprite(DBAssetType.Thing)}
            >
              添加物品
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={handleImportAsset}>导入素材库...</MenubarItem>
            <MenubarItem onClick={() => selectAsset()}>
              管理素材库...
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger
            disabled={scenes.length === 0}
            className="data-[disabled]:text-gray-400"
          >
            预览
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem
              disabled={!activeScene}
              onClick={() => {
                const activeSceneIndex = editor.getActiveSceneIndex();

                handlePreviewScenes(activeSceneIndex, activeSceneIndex + 1);
              }}
            >
              仅预览当前场景
            </MenubarItem>
            <MenubarItem
              disabled={!activeScene}
              onClick={() => handlePreviewScenes(editor.getActiveSceneIndex())}
            >
              从当前场景开始预览
            </MenubarItem>
            <MenubarItem onClick={() => handlePreviewScenes()}>
              预览全部场景
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger
            disabled={scenes.length === 0}
            className="data-[disabled]:text-gray-400"
          >
            导出
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem
              disabled={!activeScene}
              onClick={() => {
                const activeSceneIndex = editor.getActiveSceneIndex();

                handleExportScenes(activeSceneIndex, activeSceneIndex + 1);
              }}
            >
              仅导出当前场景
            </MenubarItem>
            <MenubarItem
              disabled={!activeScene}
              onClick={() => handleExportScenes(editor.getActiveSceneIndex())}
            >
              从当前场景开始导出
            </MenubarItem>
            <MenubarItem onClick={() => handleExportScenes()}>
              导出全部场景
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <Card className="flex-1 rounded-md relative">
        <CardContent className="relative h-full p-2">
          <div
            className="w-full h-full flex justify-center items-center"
            ref={canvasContainerRef}
          >
            <canvas className="shadow border border-b" ref={canvasRef}></canvas>
          </div>
        </CardContent>
      </Card>
      {/* Dialogs */}
      <ProjectLibrary
        isOpen={isOpenProjectLibrary}
        onClose={() => setIsOpenProjectLibrary(false)}
      ></ProjectLibrary>
      <TemplateLibrary
        isOpen={isOpenTemplateLibrary}
        onClose={() => setIsOpenTemplateLibrary(false)}
      ></TemplateLibrary>
      <ExportVideoDialog
        progress={actionProgress}
        url={curExportVideoURL}
        isOpen={isOpenExportVideoDialog}
        onClose={handleCloseExportVideoDialog}
      ></ExportVideoDialog>
      <PreviewVideoDialog
        progress={actionProgress}
        ref={previewVideoDialogRef}
        isOpen={isOpenPreviewVideoDialog}
        onClose={handleClosePreviewVideoDialog}
        onExport={handlePreviewToExport}
      ></PreviewVideoDialog>
      <CreateProjectDialog
        isOpen={isOpenCreateProjectDialog}
        onClose={() => setIsOpenCreateProjectDialog(false)}
      ></CreateProjectDialog>
    </div>
  );
}