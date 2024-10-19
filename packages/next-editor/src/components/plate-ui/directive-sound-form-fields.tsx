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
import { Switch } from "@/components/ui/switch";
import { assetDB, DBAssetType, getAssetSourceURL } from "@/db";
import { useEditorStore } from "@/store";
import { DirectiveName, Sound } from "@vnve/next-core";
import { useEffect, useImperativeHandle, useState, forwardRef } from "react";
import { set, UseFormReturn, useWatch } from "react-hook-form";
import { Input } from "../ui/input";
import { DirectiveNameMap } from "@/config";
import { useAssetLibrary } from "@/components/hooks/useAssetLibrary";
import { createSound } from "@/lib/core";

export interface DirectiveSoundFormFieldsHandle {
  getDirectiveLabel: () => string;
}

interface DirectiveSoundFormFieldsProps {
  form: UseFormReturn;
}

export const DirectiveSoundFormFields = forwardRef<
  DirectiveSoundFormFieldsHandle,
  DirectiveSoundFormFieldsProps
>(({ form }, ref) => {
  const activeScene = useEditorStore((state) => state.activeScene);
  const editor = useEditorStore((state) => state.editor);
  const [optionGroups, setOptionGroups] = useState([]);
  const formDirective = useWatch({
    control: form.control,
    name: "directive",
  });
  const formTargetName = useWatch({
    control: form.control,
    name: "params.targetName",
  });
  const { selectAsset } = useAssetLibrary();
  const [targetNameSelectOpen, setTargetNameSelectOpen] = useState(false);

  const handleOpenAndAddSound = async () => {
    setTargetNameSelectOpen(false);
    const asset = await selectAsset(DBAssetType.Audio);

    if (asset) {
      const sound = createSound(asset);

      editor.addSound(sound);
      // 需延迟到options更新完，才能去更新form的值，否则无法生效
      setTimeout(() => {
        form.setValue("params.targetName", sound.name);
      }, 150);
    }
  };

  useEffect(() => {
    if (activeScene) {
      const options = activeScene.sounds.map((item) => {
        return {
          label: item.label,
          value: item.name,
        };
      });

      setOptionGroups([
        {
          label: "音频",
          options,
        },
      ]);
    }
  }, [activeScene]);

  useImperativeHandle(
    ref,
    () => ({
      getDirectiveLabel: () => {
        if (activeScene && formDirective && formTargetName) {
          const directiveName = DirectiveNameMap[formDirective];
          const targetName =
            activeScene.sounds.find((item) => item.name === formTargetName)
              ?.label || "";
          const nameList = [directiveName, targetName];

          return nameList.join(":");
        }

        return "";
      },
    }),
    [activeScene, formDirective, formTargetName],
  );

  return (
    <>
      <FormField
        control={form.control}
        name="params.targetName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>目标音频</FormLabel>
            <FormControl>
              <Select
                open={targetNameSelectOpen}
                onOpenChange={setTargetNameSelectOpen}
                onValueChange={field.onChange}
                value={field.value}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="请选择目标音频" />
                </SelectTrigger>
                <SelectContent>
                  {optionGroups.map(
                    (group) =>
                      group.options.length > 0 && (
                        <SelectGroup key={group.label}>
                          <SelectLabel>{group.label}</SelectLabel>
                          {group.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ),
                  )}
                  {optionGroups.every(
                    (group) => group.options.length === 0,
                  ) && (
                    <div
                      onClick={handleOpenAndAddSound}
                      className="cursor-pointer select-none py-1.5 pl-2 pr-8 text-sm hover:bg-slate-100 rounded-sm"
                      data-disable-click-outside
                    >
                      +从素材库中选择并添加到当前场景
                    </div>
                  )}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {formDirective === DirectiveName.Play && (
        <>
          <FormField
            control={form.control}
            name="params.start"
            render={({ field }) => (
              <FormItem>
                <FormLabel>开始时间(秒)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="请输入开始时间"
                    value={field.value ?? ""}
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
            name="params.volume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>音量</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={1}
                    step={0.01}
                    placeholder="请输入音量"
                    value={field.value ?? ""}
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
            name="params.loop"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center">
                <FormLabel className="mr-4 mt-2 flex flex-col space-y-1">
                  循环播放
                </FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="params.untilEnd"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center">
                <FormLabel className="mr-4 mt-2 flex flex-col space-y-1">
                  跨场景播放
                </FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </>
  );
});
