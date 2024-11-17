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
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { DirectiveNameMap, FilterOptions } from "@/config";
import { useEditorStore } from "@/store";
import { DBAssetType } from "@/db";
import { DirectiveName, Sprite } from "@vnve/core";

export interface DirectiveFilterFormFieldsHandle {
  getDirectiveLabel: () => string;
}

interface DirectiveFilterFormFieldsProps {
  form: UseFormReturn;
}

export const DirectiveFilterFormFields = forwardRef<
  DirectiveFilterFormFieldsHandle,
  DirectiveFilterFormFieldsProps
>(({ form }, ref) => {
  const activeScene = useEditorStore((state) => state.activeScene);
  const [targetOptionGroups, setTargetOptionGroups] = useState([]);
  const formDirective = useWatch({
    control: form.control,
    name: "directive",
  });

  useEffect(() => {
    if (activeScene) {
      const newCharacterOptions = [];
      const newThingsOptions = [];
      const newBackgroundOptions = [];
      const newOtherOptions = [];

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

      setTargetOptionGroups([
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
  }, [activeScene]);

  useImperativeHandle(
    ref,
    () => ({
      getDirectiveLabel: () => {
        const labels = [DirectiveNameMap[formDirective]];
        const formTargetName = form.getValues("params.targetName");
        const target = targetOptionGroups
          .flatMap((group) => group.options)
          .find((option) => option.value === formTargetName);
        const targetLabel = target ? target.label : "全场景";
        labels.push(targetLabel);

        const formFilterName = form.getValues("params.filterName");

        if (formFilterName) {
          const filter = FilterOptions.find(
            (option) => option.value === formFilterName,
          );
          const filterLabel = filter ? filter.name : "";
          labels.push(filterLabel);
        }

        return labels.join(":");
      },
    }),
    [form, formDirective, targetOptionGroups],
  );

  return (
    <>
      <FormField
        control={form.control}
        name="params.targetName"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>滤镜对象</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="为空则默认全场景滤镜" />
                </SelectTrigger>
                <SelectContent>
                  {targetOptionGroups.map(
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
      {formDirective === DirectiveName.AddFilter && (
        <FormField
          control={form.control}
          name="params.filterName"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>滤镜效果</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="请选择滤镜效果" />
                  </SelectTrigger>
                  <SelectContent>
                    {FilterOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.name}
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
});
