import {
  FormControl,
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
import { DBAssetType } from "@/db";
import { useEditorStore } from "@/store";
import { DirectiveName } from "@vnve/core";
import { useEffect, useImperativeHandle, useState, forwardRef } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { Input } from "../ui/input";
import { DirectiveNameMap } from "@/config";
import { useAssetLibrary } from "@/components/hooks/useAssetLibrary";
import { createSound } from "@/lib/core";
import { Slider } from "@/components/ui/slider";

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

  const handleOpenAndAddSound = async (
    onChangeSound: (name: string) => void,
  ) => {
    setTargetNameSelectOpen(false);
    const asset = await selectAsset(DBAssetType.Audio);

    if (asset) {
      if (formTargetName) {
        // 如果已经选择了音频，先删除
        editor.removeSoundByName(formTargetName);
      }

      const sound = createSound(asset);

      editor.addSound(sound);
      // 需延迟到options更新完，才能去更新form的值，否则无法生效
      setTimeout(() => {
        onChangeSound(sound.name);
      }, 150);
    }
  };

  useEffect(() => {
    if (activeScene) {
      const voices = activeScene.dialogues.map(
        (item) => item.speak?.voice?.targetName,
      );
      const options = activeScene.sounds
        .map((item) => {
          return {
            label: item.label,
            value: item.name,
          };
        })
        .filter((item) => !voices.includes(item.value)); // 过滤掉配音文件

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
          <FormItem className="space-y-1">
            <FormLabel>目标音频</FormLabel>
            <FormControl>
              <Select
                open={targetNameSelectOpen}
                onOpenChange={setTargetNameSelectOpen}
                onValueChange={field.onChange}
                value={field.value}
              >
                <SelectTrigger className="h-8">
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
                  <div
                    onClick={() => handleOpenAndAddSound(field.onChange)}
                    className="cursor-pointer select-none py-1.5 pl-2 pr-8 text-sm hover:bg-slate-100 rounded-sm"
                    data-disable-click-outside
                  >
                    添加并选择音频...
                  </div>
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
              <FormItem className="space-y-1">
                <FormLabel>开始时间(秒)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="默认从0秒开始"
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = Number(e.target.value);

                      field.onChange(value);
                    }}
                    className="h-8"
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
              <FormItem className="space-y-1">
                <FormLabel>音量</FormLabel>
                <FormControl>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={[field.value ?? 1]}
                    onValueChange={(value) => field.onChange(value[0])}
                    showPercentage={true}
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
              <FormItem className="space-y-0 flex flex-row items-center">
                <FormLabel className="flex flex-col w-[4rem]">循环</FormLabel>
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
              <FormItem className="space-y-0 flex flex-row items-center">
                <FormLabel className="flex flex-col w-[4rem]">跨场景</FormLabel>
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
