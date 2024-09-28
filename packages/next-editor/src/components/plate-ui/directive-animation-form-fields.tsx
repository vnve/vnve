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
import { assetDB, DBAssetType, getAssetSourceURL } from "@/db";
import { useEditorStore } from "@/store";
import { Sprite } from "@vnve/next-core";
import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";

export function DirectiveAnimationFormFields({ form }) {
  const activeScene = useEditorStore((state) => state.activeScene);
  const [optionGroups, setOptionGroups] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const directive = useWatch({
    control: form.control,
    name: "directive",
  });
  const targetName = useWatch({
    control: form.control,
    name: "params.targetName",
  });

  useEffect(() => {
    if (activeScene) {
      const newCharacterOptions = [];
      const newBackgroundOptions = [];
      const newOtherOptions = [];

      for (const child of activeScene.children) {
        const newOption = { value: child.name, label: child.label };
        if ((child as Sprite).assetType === DBAssetType.Character) {
          newCharacterOptions.push(newOption);
        } else if ((child as Sprite).assetType === DBAssetType.Background) {
          newBackgroundOptions.push(newOption);
        } else if (child.name) {
          newOtherOptions.push(newOption);
        }
      }

      setOptionGroups([
        {
          label: "角色",
          options: newCharacterOptions,
        },
        {
          label: "背景",
          options: newBackgroundOptions,
        },
        {
          label: "其他",
          options: newOtherOptions,
        },
      ]);
    }
  }, [activeScene]);

  useEffect(() => {
    if (activeScene && directive === "ChangeSource" && targetName) {
      const targetChild: Sprite = activeScene.children.find(
        (item) => item.name === targetName,
      ) as Sprite;

      if (targetChild.assetID) {
        assetDB.get(targetChild.assetID).then((asset) => {
          const options = asset.states.map((state) => {
            return {
              value: getAssetSourceURL(state.id, state.ext),
              label: state.name,
            };
          });
          setStateOptions(options);
        });
      }
    }
  }, [activeScene, directive, targetName]);

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
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {form.getValues("directive") === "ChangeSource" && (
        <FormField
          control={form.control}
          name="params.source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>目标状态</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="请选择目标状态" />
                  </SelectTrigger>
                  <SelectContent>
                    {stateOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}
