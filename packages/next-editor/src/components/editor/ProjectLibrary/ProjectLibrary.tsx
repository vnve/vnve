import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { projectDB } from "@/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Icons } from "@/components/icons";
import { useEditorStore } from "@/store";

export function ProjectLibrary({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const editor = useEditorStore((state) => state.editor);
  const setProject = useEditorStore((state) => state.setProject);
  const projectList = useLiveQuery(() => projectDB.reverse().toArray());

  const handleOpenChange = (value) => {
    if (!value) {
      onClose();
    }
  };

  const handleOpenProject = async (id: number) => {
    const project = await projectDB.get(id);

    editor.clear();

    if (project.content) {
      await editor.loadFromJSON(project.content);
      editor.setActiveSceneByIndex(0);
    }
    setProject(project);
    onClose();
  };

  const handleDelete = async (id: number) => {
    await projectDB.delete(id);
  };

  const handleCopy = async (id: number) => {
    const project = await projectDB.get(id);
    await projectDB.add({
      name: `${project.name} - 副本`,
      content: project.content,
      time: Date.now(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>作品列表</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>作品名称</TableHead>
              <TableHead className="w-[80px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectList?.map((project) => (
              <TableRow key={project.id}>
                <TableCell onClick={() => handleOpenProject(project.id)}>
                  <span className="cursor-pointer">{project.name}</span>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Icons.copy
                    className="h-4 w-4 cursor-pointer"
                    onClick={() => handleCopy(project.id)}
                  />
                  <Icons.delete
                    className="h-4 w-4 cursor-pointer"
                    onClick={() => handleDelete(project.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
