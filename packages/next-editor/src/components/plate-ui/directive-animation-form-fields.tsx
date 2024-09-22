import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditorStore } from "@/store";
import { useMemo } from "react";

export function DirectiveAnimationFormFields({ form }) {
  const activeScene = useEditorStore((state) => state.activeScene);
  const targets = useMemo(() => {
    if (!activeScene) {
      return [];
    }
    console.log("activeScene", activeScene.children);

    return activeScene.children
      .filter((child) => child.name)
      .map((child) => {
        return {
          value: child.name,
          label: child.label,
        };
      });
  }, [activeScene]);

  return (
    <>
      <FormField
        control={form.control}
        name="params.targetName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>目标元素</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="请选择目标元素" />
                </SelectTrigger>
                <SelectContent>
                  {targets.map((target) => {
                    return (
                      <SelectItem key={target.value} value={target.value}>
                        {target.label} {target.value}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
