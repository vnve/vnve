import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Compositor, Director, createDialogueScene } from "@vnve/next-core";
import { useEditorStore } from "@/store";
import { useAssetLibrary } from "@/hooks";

export function SceneList() {
  const editor = useEditorStore((state) => state.editor);
  const activeScene = useEditorStore((state) => state.activeScene);
  const scenes = useEditorStore((state) => state.scenes);

  function addScene() {
    editor.addScene(createDialogueScene());
  }

  function previewScenes() {
    //
  }

  async function exportScenes() {
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
  }

  const { selectAsset } = useAssetLibrary();

  return (
    <>
      <Button
        onClick={() => {
          selectAsset().then((res) => {
            console.log("res", res);
          });
        }}
      >
        打开
      </Button>
      <Button variant="outline" onClick={addScene}>
        新增场景
      </Button>
      <Button onClick={previewScenes}>预览</Button>
      <Button onClick={exportScenes}>导出</Button>
      <Table>
        <TableCaption>场景列表</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">场景序号</TableHead>
            <TableHead>场景名称</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scenes.map((scene, sceneIndex) => (
            <TableRow
              key={scene.name}
              onClick={() => {
                editor.setActiveScene(scene);
              }}
              className={activeScene?.name === scene.name ? "bg-gray-100" : ""}
            >
              <TableCell className="font-medium">{sceneIndex}</TableCell>
              <TableCell>{scene.label}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  onClick={() => {
                    editor.removeScene(scene);
                  }}
                >
                  删除
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
