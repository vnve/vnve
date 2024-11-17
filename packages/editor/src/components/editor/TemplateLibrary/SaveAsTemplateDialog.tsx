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
import { templateDB } from "@/db";
import { useEditorStore } from "@/store";

const formSchema = z.object({
  templateName: z.string().min(1, "模板名称不能为空"),
});

export function SaveAsTemplateDialog({
  isOpen,
  sceneName,
  onClose,
}: {
  isOpen: boolean;
  sceneName: string;
  onClose: () => void;
}) {
  const editor = useEditorStore((state) => state.editor);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateName: "",
    },
  });

  const handleOpenChange = (value) => {
    if (!value) {
      onClose();
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await templateDB.add({
      name: values.templateName,
      type: "",
      content: JSON.stringify(editor.cloneSceneByName(sceneName)),
    });

    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>保存为模板</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="templateName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>模板名称</FormLabel>
                  <FormControl>
                    <Input placeholder="输入模板名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button type="submit">保存</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
