import { useEditorStore } from "@/store";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAssetLibrary } from "@/components/hooks/useAssetLibrary";
import { clearAssetDB, DBAssetType, importAssetToDB, projectDB } from "@/db";
import {
  createSprite,
  createText,
  getDisableAudio,
  text2Scenes,
} from "@/lib/core";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Compositor, Previewer, Director } from "@vnve/core";
import { Card, CardContent } from "@/components/ui/card";
import { TemplateLibrary } from "../TemplateLibrary";
import { ExportVideoDialog } from "./ExportVideoDialog";
import { PreviewVideoDialog } from "./PreviewVideoDialog";
import { CreateProjectDialog, ProjectLibrary } from "../ProjectLibrary";
import { useToast } from "@/components/hooks/use-toast";
import { useTemplates } from "@/components/hooks/useTemplates";
import { ActionProgress } from "./types";
import { ImportAssetLoadingDialog } from "./ImportAssetLoadingDialog";
import { ClearAssetAlertDialog } from "./ClearAssetAlertDialog";
import { Icons } from "@/components/icons";
import { openFilePicker, readTextFile } from "@/lib/utils";

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
  const [importAssetLoading, setImportAssetLoading] = useState(false);
  const [isOpenClearAssetAlertDialog, setIsOpenClearAssetAlertDialog] =
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
  const progressAnimationId = useRef(0);
  const [saveTimeString, setSaveTimeString] = useState("");
  const { toast } = useToast();

  const updateActionProgress = (progress, currentTime, duration) => {
    if (progress >= 100) {
      setActionProgress({
        value: progress,
        currentTime,
        duration,
      });
      if (progressAnimationId.current) {
        clearTimeout(progressAnimationId.current);
      }
      progressAnimationId.current = 0;
      return;
    }

    if (progressAnimationId.current) {
      return;
    }

    progressAnimationId.current = setTimeout(() => {
      setActionProgress({
        value: progress,
        currentTime,
        duration,
      });
      progressAnimationId.current = 0;
    }, 1000 / 30);
  };

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

  const handleSaveProject = useCallback(
    async (silent?: boolean) => {
      try {
        const date = new Date();
        await projectDB.update(project.id, {
          content: editor.saveAsJSON(),
          time: date.getTime(),
        });

        setSaveTimeString(date.toLocaleString());

        if (!silent) {
          toast({
            title: "保存成功！",
            duration: 1500,
          });
        }
      } catch (error) {
        toast({
          title: "保存失败！",
          description: error.message,
          variant: "destructive",
        });
      }
    },
    [toast, editor, project],
  );

  const handleAddSprite = (assetType: DBAssetType) => async () => {
    const asset = await selectAsset(assetType);

    if (asset) {
      const sprite = await createSprite(asset, editor);

      editor.addChild(sprite);
    }
  };

  const handleAddText = () => {
    const text = createText(editor);

    editor.addChild(text);
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
      disableAudio: getDisableAudio(),
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

  const handleReplayPreview = async () => {
    if (director.current.hasStarted()) {
      await director.current.cut();
    }
    handlePreviewScenes(...previewVideoRange);
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
      disableAudio: getDisableAudio(),
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

  const handleImportScreenplay = async () => {
    const files = await openFilePicker({ accept: ".txt" });
    const file = files[0];

    setImportAssetLoading(true);
    try {
      const text = await readTextFile(file);
      await text2Scenes(text, editor);
    } catch (error) {
      toast({
        title: "导入失败！",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImportAssetLoading(false);
    }
  };

  const handleImportAsset = async () => {
    setImportAssetLoading(true);
    try {
      await importAssetToDB();
    } catch (error) {
      toast({
        title: "导入失败！",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImportAssetLoading(false);
    }
  };

  const handleClearAssetDB = async () => {
    await clearAssetDB();
    toast({
      title: "清空成功！",
      duration: 1500,
    });
  };

  useEffect(() => {
    if (project) {
      const interval = setInterval(
        async () => {
          handleSaveProject(true);
        },
        1000 * 60 * 1,
      );

      return () => {
        clearInterval(interval);
      };
    }
  }, [project, handleSaveProject]);

  useEffect(() => {
    window.addEventListener("resize", adjustCanvasWidth);

    adjustCanvasWidth();
    initEditor(canvasRef.current);
    director.current = new Director({
      onProgress(progress, currentTime, duration) {
        updateActionProgress(progress, currentTime, duration);
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
            <Icons.library className="size-4 mr-0.5"></Icons.library>
            作品
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setIsOpenCreateProjectDialog(true)}>
              创建新作品
            </MenubarItem>
            <MenubarItem onClick={() => setIsOpenProjectLibrary(true)}>
              打开...
            </MenubarItem>
            <MenubarItem
              disabled={!project}
              onClick={() => handleSaveProject()}
            >
              保存
            </MenubarItem>
            {saveTimeString && (
              <MenubarItem className="text-muted-foreground">
                自动保存于{saveTimeString}
              </MenubarItem>
            )}
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger
            className="data-[disabled]:text-gray-400"
            disabled={!project}
          >
            <Icons.scene className="size-4 mr-0.5"></Icons.scene>
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
            <MenubarItem onClick={handleImportScreenplay}>
              导入剧本...
            </MenubarItem>
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
            <Icons.images className="size-4 mr-0.5"></Icons.images>
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
            <MenubarItem disabled={!activeScene} onClick={handleAddText}>
              添加文字
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={handleImportAsset}>导入素材库...</MenubarItem>
            <MenubarItem onClick={() => selectAsset(undefined, true)}>
              管理素材库...
            </MenubarItem>
            <MenubarItem
              className="text-destructive"
              onClick={() => setIsOpenClearAssetAlertDialog(true)}
            >
              清空素材库
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger
            disabled={scenes.length === 0}
            className="data-[disabled]:text-gray-400"
          >
            <Icons.preview className="size-4 mr-0.5"></Icons.preview>
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
            <Icons.download className="size-4 mr-0.5"></Icons.download>
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
        onReplay={handleReplayPreview}
        onClose={handleClosePreviewVideoDialog}
        onExport={handlePreviewToExport}
      ></PreviewVideoDialog>
      <CreateProjectDialog
        isOpen={isOpenCreateProjectDialog}
        onClose={() => setIsOpenCreateProjectDialog(false)}
      ></CreateProjectDialog>
      <ImportAssetLoadingDialog
        isOpen={importAssetLoading}
      ></ImportAssetLoadingDialog>
      <ClearAssetAlertDialog
        isOpen={isOpenClearAssetAlertDialog}
        onConfirm={handleClearAssetDB}
        onClose={() => setIsOpenClearAssetAlertDialog(false)}
      ></ClearAssetAlertDialog>
    </div>
  );
}
