import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/icons";

export function SceneList() {
  const editor = useEditorStore((state) => state.editor);
  const activeScene = useEditorStore((state) => state.activeScene);
  const scenes = useEditorStore((state) => state.scenes);

  const handleRemoveScene = (scene) => {
    if (scene.name === activeScene?.name) {
      editor.setActiveScene(undefined);
    }

    editor.removeSceneByName(scene.name);
  };

  return (
    <Card className="flex-1 h-full rounded-md">
      <CardContent className="h-full p-2">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>场景</TableHead>
                <TableHead className="w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenes.map((scene, sceneIndex) => (
                <TableRow
                  key={scene.name}
                  onClick={() => {
                    editor.setActiveSceneByName(scene.name);
                  }}
                  className={`${
                    activeScene?.name === scene.name ? "bg-muted" : ""
                  } cursor-pointer`}
                >
                  <TableCell>
                    <span className="font-medium mr-2">{sceneIndex + 1}.</span>
                    {scene.label}
                  </TableCell>
                  <TableCell>
                    <Icons.trash2
                      className="w-4 h-4 cursor-pointer hover:text-destructive"
                      onClick={() => handleRemoveScene(scene)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
