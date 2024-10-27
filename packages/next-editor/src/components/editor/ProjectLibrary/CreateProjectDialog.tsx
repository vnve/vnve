import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { projectDB } from "@/db";
import { useEditorStore } from "@/store";

const formSchema = z.object({
  projectName: z.string().min(1, "项目名称不能为空"),
});

export function CreateProjectDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const editor = useEditorStore((state) => state.editor);
  const setProject = useEditorStore((state) => state.setProject);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
    },
  });

  const handleOpenChange = (value) => {
    if (!value) {
      onClose();
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const newProject = {
      name: values.projectName,
      content: "",
      time: Date.now(),
    };
    const id = await projectDB.add(newProject);

    editor.clear();
    setProject({
      id,
      ...newProject,
    });
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>创建新项目</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>项目名称</FormLabel>
                  <FormControl>
                    <Input placeholder="输入项目名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button type="submit">创建</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
