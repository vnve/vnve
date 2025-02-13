import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

const formSchema = z.object({
  wordsPerMin: z.number().optional(),
  interval: z.number().optional(),
  effect: z.string().optional(),
  effectDuration: z.number().optional(),
  speaker: z.object({
    name: z.string().optional(),
    autoShowSpeaker: z
      .object({
        inEffect: z.string(),
      })
      .optional(),
    autoMaskOtherSpeakers: z
      .object({
        alpha: z.number(),
      })
      .optional(),
  }),
});

export function DirectiveSpeakForm({
  speak,
  onChangeSpeak,
  disableCustomName = false,
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: speak,
  });
  const formValues = useWatch({
    control: form.control,
  });

  useEffect(() => {
    if (form.formState.isDirty) {
      onChangeSpeak({
        ...speak,
        ...formValues,
        speaker: {
          ...speak.speaker,
          ...formValues.speaker,
        },
      });
    }
  }, [form.formState.isDirty, formValues]);

  return (
    <Form {...form}>
      <form className="space-y-2">
        {!disableCustomName && (
          <FormField
            control={form.control}
            name="speaker.name"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>自定义角色名</FormLabel>
                <FormDescription>用于自定义对话中显示的角色名</FormDescription>
                <FormControl>
                  <Input
                    className="h-8"
                    placeholder="请输入自定义角色名"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="wordsPerMin"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>语速（字/分钟）</FormLabel>
              <FormDescription>
                角色发言的速度，默认值参考平均阅读速度
              </FormDescription>
              <FormControl>
                <Input
                  className="h-8"
                  type="number"
                  min={0}
                  step={100}
                  placeholder="请输入语速"
                  value={String(field.value)}
                  onChange={(e) => {
                    const value = Number(e.target.value);

                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="interval"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>停顿时长（秒）</FormLabel>
              <FormDescription>角色发言后的停顿时长</FormDescription>
              <FormControl>
                <Input
                  className="h-8"
                  type="number"
                  min={0}
                  step={0.1}
                  placeholder="请输入停顿时长"
                  value={String(field.value)}
                  onChange={(e) => {
                    const value = Number(e.target.value);

                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="effect"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>台词效果</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="请选择台词效果" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="typewriter">打字机</SelectItem>
                    <SelectItem value="fadeIn">渐入</SelectItem>
                    <SelectItem value="none">无</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {formValues.effect === "fadeIn" && (
          <FormField
            control={form.control}
            name="effectDuration"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>台词效果时长（秒）</FormLabel>
                <FormControl>
                  <Input
                    className="h-8"
                    type="number"
                    min={0}
                    step={0.1}
                    placeholder="请输入台词输出时长"
                    value={String(field.value)}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="speaker.autoShowSpeaker"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-y-0">
              <FormLabel className="w-[8rem]">自动显示发言角色</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value ? true : false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="speaker.autoMaskOtherSpeakers"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-y-0">
              <FormLabel className="w-[8rem]">自动阴影其他角色</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value ? true : false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
