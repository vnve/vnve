import React, { useEffect, useMemo } from "react";
import { focusEditor, useEditorRef } from "@udecode/plate-common/react";
import { Icons } from "@/components/icons";
import { InsertDropdownMenu } from "./insert-dropdown-menu";
import { ToolbarGroup } from "./toolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditorStore } from "@/store";
import { Sprite } from "@vnve/next-core";
import { DBAssetType } from "@/db";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Button } from "@/components/ui/button";
import { DirectiveType } from "@/config";
import { triggerFloatingDirective } from "../plugin/directive";

const formSchema = z.object({
  wordsPerMin: z.number().optional(),
  interval: z.number().optional(),
  effect: z.string().optional(),
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

export function FixedToolbarButtons({ speak, onChangeSpeak, children }) {
  const activeScene = useEditorStore((state) => state.activeScene);
  const characters = useMemo(() => {
    if (!activeScene) {
      return [];
    }

    return activeScene.children.filter(
      (child: Sprite) => child.assetType === DBAssetType.Character,
    );
  }, [activeScene]);
  const editor = useEditorRef();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: speak,
  });
  const formValues = useWatch({
    control: form.control,
  });

  const handleSelectCharacter = (name: string) => {
    const hitCharacter = characters.find(
      (character) => character.name === name,
    );

    onChangeSpeak({
      ...speak,
      speaker: {
        ...speak.speaker,
        speakerTargetName: hitCharacter?.name,
        name: hitCharacter?.label || "",
      },
    });
  };

  const handleSelectDirectiveType = (type: DirectiveType) => {
    triggerFloatingDirective(editor, {
      directiveType: type,
    });

    focusEditor(editor);
  };

  useEffect(() => {
    form.reset({
      ...speak,
    });
  }, [speak, form]);

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
    <div className="w-full flex flex-wrap gap-1">
      <ToolbarGroup noSeparator>
        <Select
          value={speak.speaker.speakerTargetName}
          onValueChange={handleSelectCharacter}
        >
          <SelectTrigger className="w-[130px] h-8">
            <SelectValue placeholder="选择角色" />
          </SelectTrigger>
          <SelectContent>
            {characters.map((character) => (
              <SelectItem key={character.name} value={character.name}>
                {character.label}
              </SelectItem>
            ))}
            {characters.length === 0 && (
              <div className="select-none py-1.5 pl-2 pr-8 text-sm opacity-50">
                请先在画布中添加角色
              </div>
            )}
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger>
            <Icons.settings className="size-4 cursor-pointer" />
          </PopoverTrigger>
          <PopoverContent>
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="speaker.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>自定义角色名</FormLabel>
                      <FormDescription>
                        用于自定义在对话中显示的角色名
                      </FormDescription>
                      <FormControl>
                        <Input placeholder="请输入自定义角色名" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wordsPerMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>语速（字/分钟）</FormLabel>
                      <FormDescription>
                        角色发言的速度，默认值参考阅读速度xxx
                      </FormDescription>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={100}
                          placeholder="请输入语速"
                          value={field.value}
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
                    <FormItem>
                      <FormLabel>停顿时长（秒）</FormLabel>
                      <FormDescription>
                        角色发言完成后的停顿时长
                      </FormDescription>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={0.1}
                          placeholder="请输入停顿时长"
                          value={field.value}
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
                    <FormItem>
                      <FormLabel>台词效果</FormLabel>
                      <FormDescription>台词的输出效果</FormDescription>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="请选择台词效果" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="typewriter">打字机</SelectItem>
                            <SelectItem value="fadeIn">渐入</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="speaker.autoShowSpeaker"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center">
                      <FormLabel className="mr-4 mt-2 flex flex-col space-y-1">
                        自动显示发言角色
                      </FormLabel>
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
                    <FormItem className="flex flex-row items-center">
                      <FormLabel className="mr-4 mt-2 flex flex-col space-y-1">
                        自动阴影其他角色
                      </FormLabel>
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
          </PopoverContent>
        </Popover>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleSelectDirectiveType(DirectiveType.Animation)}
        >
          <Icons.squarePlus className="size-4 mr-1" /> 动画
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleSelectDirectiveType(DirectiveType.Sound)}
        >
          <Icons.squarePlus className="size-4 mr-1" />
          声音
        </Button>
        <InsertDropdownMenu />
      </ToolbarGroup>

      <ToolbarGroup className="ml-auto">{children}</ToolbarGroup>
    </div>
  );
}
