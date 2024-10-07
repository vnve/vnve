import React, { useEffect, useMemo } from "react";

import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from "@udecode/plate-basic-marks/react";
import { focusEditor, useEditorRef } from "@udecode/plate-common/react";

import { Icons } from "@/components/icons";

import { InsertDropdownMenu } from "./insert-dropdown-menu";
import { MarkToolbarButton } from "./mark-toolbar-button";
import { ModeDropdownMenu } from "./mode-dropdown-menu";
import { ToolbarGroup } from "./toolbar";
import { TurnIntoDropdownMenu } from "./turn-into-dropdown-menu";
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
import { Directive, Sprite } from "@vnve/next-core";
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
  label: z.string().optional(),
  wordsPerMin: z.number().optional(),
  interval: z.number().optional(),
  effect: z.string().optional(),
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
});

const defaultValues = {
  wordsPerMin: 600,
  interval: 0.2,
  effect: "typewriter",
  autoShowSpeaker: {
    inEffect: "Show",
  },
  autoMaskOtherSpeakers: {
    alpha: 0.5,
  },
};

export function FixedToolbarButtons({ speaker, onChangeSpeaker }) {
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
    defaultValues: {
      ...defaultValues,
      ...speaker,
    },
  });
  const formValues = useWatch({
    control: form.control,
  });

  const handleSelectCharacter = (name: string) => {
    const hitCharacter = characters.find(
      (character) => character.name === name,
    );

    onChangeSpeaker({
      ...speaker,
      name,
      label: hitCharacter?.label || "",
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
      ...defaultValues,
      ...speaker,
    });
  }, [speaker, form]);

  useEffect(() => {
    if (form.formState.isDirty) {
      onChangeSpeaker({
        ...speaker,
        ...formValues,
      });
    }
  }, [form.formState.isDirty, formValues]);

  return (
    <div className="w-full overflow-hidden">
      <div
        className="flex flex-wrap"
        style={{
          transform: "translateX(calc(-1px))",
        }}
      >
        {
          <>
            <ToolbarGroup noSeparator>
              <Select
                value={speaker.name}
                onValueChange={handleSelectCharacter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="请选择角色" />
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
            </ToolbarGroup>

            <ToolbarGroup noSeparator>
              <Popover>
                <PopoverTrigger>配置</PopoverTrigger>
                <PopoverContent>
                  <Form {...form}>
                    <form className="space-y-4">
                      <FormField
                        control={form.control}
                        name="label"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>自定义角色名</FormLabel>
                            <FormDescription>
                              用于自定义在对话中显示的角色名
                            </FormDescription>
                            <FormControl>
                              <Input
                                placeholder="请输入自定义角色名"
                                {...field}
                              />
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
                                  <SelectItem value="typewriter">
                                    打字机
                                  </SelectItem>
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
                        name="autoShowSpeaker"
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
                        name="autoMaskOtherSpeakers"
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
            </ToolbarGroup>

            <ToolbarGroup noSeparator>
              <Button
                size="sm"
                onClick={() =>
                  handleSelectDirectiveType(DirectiveType.Animation)
                }
              >
                +动画
              </Button>
              <Button
                size="sm"
                onClick={() => handleSelectDirectiveType(DirectiveType.Sound)}
              >
                +声音
              </Button>
              <InsertDropdownMenu />
            </ToolbarGroup>

            {/* <ToolbarGroup>
              <MarkToolbarButton nodeType={BoldPlugin.key} tooltip="Bold (⌘+B)">
                <Icons.bold />
              </MarkToolbarButton>
              <MarkToolbarButton
                nodeType={ItalicPlugin.key}
                tooltip="Italic (⌘+I)"
              >
                <Icons.italic />
              </MarkToolbarButton>
              <MarkToolbarButton
                nodeType={UnderlinePlugin.key}
                tooltip="Underline (⌘+U)"
              >
                <Icons.underline />
              </MarkToolbarButton>

              <MarkToolbarButton
                nodeType={StrikethroughPlugin.key}
                tooltip="Strikethrough (⌘+⇧+M)"
              >
                <Icons.strikethrough />
              </MarkToolbarButton>
              <MarkToolbarButton nodeType={CodePlugin.key} tooltip="Code (⌘+E)">
                <Icons.code />
              </MarkToolbarButton>
            </ToolbarGroup> */}
          </>
        }

        {/* <div className="grow" />

        <ToolbarGroup noSeparator>
          <ModeDropdownMenu />
        </ToolbarGroup> */}
      </div>
    </div>
  );
}
