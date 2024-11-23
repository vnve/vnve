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
import { assetDB, DBAssetType, getAssetSourceURL } from "@/db";
import { useEditorStore } from "@/store";
import { DirectiveName, Sprite } from "@vnve/core";
import { useEffect, useImperativeHandle, useState, forwardRef } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { Input } from "../ui/input";
import { DirectiveNameMap } from "@/config";

export interface DirectiveAnimationFormFieldsHandle {
  getDirectiveLabel: () => string;
}

interface DirectiveAnimationFormFieldsProps {
  form: UseFormReturn;
}

export const DirectiveAnimationFormFields = forwardRef<
  DirectiveAnimationFormFieldsHandle,
  DirectiveAnimationFormFieldsProps
>(({ form }, ref) => {
  const activeScene = useEditorStore((state) => state.activeScene);
  const [optionGroups, setOptionGroups] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const formDirective = useWatch({
    control: form.control,
    name: "directive",
  });
  const formTargetName = useWatch({
    control: form.control,
    name: "params.targetName",
  });
  const formSource = useWatch({
    control: form.control,
    name: "params.source",
  });

  useEffect(() => {
    if (activeScene) {
      const newCharacterOptions = [];
      const newThingsOptions = [];
      const newBackgroundOptions = [];
      let newOtherOptions = [];

      for (const child of activeScene.children) {
        const newOption = { value: child.name, label: child.label };
        if ((child as Sprite).assetType === DBAssetType.Character) {
          newCharacterOptions.push(newOption);
        } else if ((child as Sprite).assetType === DBAssetType.Background) {
          newBackgroundOptions.push(newOption);
        } else if ((child as Sprite).assetType === DBAssetType.Thing) {
          newThingsOptions.push(newOption);
        } else if (child.name) {
          newOtherOptions.push(newOption);
        }
      }

      if (formDirective === DirectiveName.ChangeSource) {
        newOtherOptions = newOtherOptions.filter((item) => item.assetID);
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
          label: "物品",
          options: newThingsOptions,
        },
        {
          label: "其他",
          options: newOtherOptions,
        },
      ]);
    }
  }, [activeScene, formDirective]);

  useEffect(() => {
    if (
      activeScene &&
      formDirective === DirectiveName.ChangeSource &&
      formTargetName
    ) {
      const targetChild = activeScene.children.find(
        (item) => item.name === formTargetName,
      ) as Sprite;

      if (targetChild?.assetID) {
        assetDB.get(targetChild.assetID).then((asset) => {
          const options = asset.states.map((state) => {
            return {
              value: getAssetSourceURL(state),
              label: state.name,
            };
          });
          setStateOptions(options);
        });
      } else {
        setStateOptions([]);
      }
    }
  }, [activeScene, formDirective, formTargetName, form]);

  useImperativeHandle(
    ref,
    () => ({
      getDirectiveLabel: () => {
        if (activeScene && formDirective && formTargetName) {
          const directiveName = DirectiveNameMap[formDirective];
          const targetName =
            activeScene.children.find((item) => item.name === formTargetName)
              ?.label || "";
          const nameList = [directiveName, targetName];

          if (formDirective === DirectiveName.ChangeSource && formSource) {
            const stateName =
              stateOptions.find((item) => item.value === formSource)?.label ||
              "";

            nameList.push(stateName);
          }

          return nameList.join(":");
        }

        return "";
      },
    }),
    [activeScene, formDirective, formTargetName, formSource, stateOptions],
  );

  return (
    <>
      <FormField
        control={form.control}
        name="params.targetName"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>动画对象</FormLabel>
            <FormControl>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue("params.source", ""); // 切换对象需要清空目标状态
                }}
                value={field.value}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="请选择动画对象" />
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
                    <div className="select-none py-1.5 pl-2 pr-8 text-sm opacity-50">
                      请先在画布中添加角色、背景等素材
                    </div>
                  )}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {formDirective === DirectiveName.ChangeSource &&
        stateOptions.length > 0 && (
          <FormField
            control={form.control}
            name="params.source"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>目标状态</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-8">
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
      {formDirective !== DirectiveName.ChangeSource && (
        <FormField
          control={form.control}
          name="params.duration"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>动画时长(秒)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  placeholder="不填则使用默认值"
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
      )}
    </>
  );
});
