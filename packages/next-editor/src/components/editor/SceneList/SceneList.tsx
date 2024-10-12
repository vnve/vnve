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
import { useEditorStore } from "@/store";

export function SceneList() {
  const editor = useEditorStore((state) => state.editor);
  const activeScene = useEditorStore((state) => state.activeScene);
  const scenes = useEditorStore((state) => state.scenes);

  return (
    <>
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
                editor.setActiveSceneByName(scene.name);
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
