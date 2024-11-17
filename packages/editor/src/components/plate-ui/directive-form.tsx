import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TDirectiveElement, TDirectiveValue } from "../plugin/directive";
import { useEffect, useMemo, useRef } from "react";
import {
  AnimationDirectiveNameList,
  DirectiveNameOptionGroups,
  DirectiveType,
  FilterDirectiveNameList,
  SoundDirectiveNameList,
  UtilDirectiveNameList,
} from "@/config";
import {
  DirectiveAnimationFormFields,
  DirectiveAnimationFormFieldsHandle,
} from "@/components/plate-ui/directive-animation-form-fields";
import { DirectiveName } from "@vnve/core";
import { Switch } from "@/components/ui/switch";
import {
  DirectiveUtilFormFields,
  DirectiveUtilFormFieldsHandle,
} from "./directive-util-form-fields";
import {
  DirectiveSoundFormFields,
  DirectiveSoundFormFieldsHandle,
} from "./directive-sound-form-fields";
import {
  DirectiveFilterFormFields,
  DirectiveFilterFormFieldsHandle,
} from "./directive-filter-form-fields";
import {
  DirectiveTransitionFormFields,
  DirectiveTransitionFormFieldsHandle,
} from "./directive-transition-form-fields";

const formSchema = z.discriminatedUnion("directive", [
  z.object({
    directive: z.literal(AnimationDirectiveNameList[0]),
    params: z.object({
      targetName: z.string({
        message: "请选择动画对象",
      }),
      source: z.string().min(1, {
        message: "请输入目标状态",
      }),
      duration: z.number().optional(),
      sequential: z.boolean().optional(),
    }),
  }),
  ...AnimationDirectiveNameList.slice(1).map((name) => {
    return z.object({
      directive: z.literal(name),
      params: z.object({
        targetName: z.string({
          message: "请选择动画对象",
        }),
        duration: z.number().optional(),
        sequential: z.boolean().optional(),
      }),
    });
  }),
  z.object({
    directive: z.literal(DirectiveName.Wait),
    params: z.object({
      duration: z.number().optional(),
      sequential: z.boolean().optional(),
    }),
  }),
  z.object({
    directive: z.literal(DirectiveName.Play),
    params: z.object({
      targetName: z.string({
        message: "请选择音频对象",
      }),
      start: z.number().optional(),
      volume: z.number().optional(),
      loop: z.boolean().optional(),
      untilEnd: z.boolean().optional(),
      sequential: z.boolean().optional(),
    }),
  }),
  ...[DirectiveName.Pause, DirectiveName.Stop].map((name) => {
    return z.object({
      directive: z.literal(name),
      params: z.object({
        targetName: z.string({
          message: "请选择音频对象",
        }),
        sequential: z.boolean().optional(),
      }),
    });
  }),
  z.object({
    directive: z.literal(DirectiveName.AddFilter),
    params: z.object({
      targetName: z.string({
        message: "请选择滤镜对象",
      }),
      filterName: z.string({
        message: "请选择滤镜",
      }),
      sequential: z.boolean().optional(),
    }),
  }),
  z.object({
    directive: z.literal(DirectiveName.RemoveFilter),
    params: z.object({
      targetName: z.string({
        message: "请选择滤镜对象",
      }),
      sequential: z.boolean().optional(),
    }),
  }),
  z.object({
    directive: z.literal(DirectiveName.FadeInTransition),
    params: z.object({
      duration: z.number().optional(),
      sequential: z.boolean().optional(),
    }),
  }),
]);

export function DirectiveForm({
  editingDirective,
  directiveType,
  onSubmitDirective,
  onCancel,
}: {
  editingDirective: TDirectiveElement | null;
  directiveType: DirectiveType;
  onSubmitDirective: (value: TDirectiveValue) => void;
  onCancel: () => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      directive: undefined,
      params: {},
    },
  });
  const formDirective = useWatch({
    control: form.control,
    name: "directive",
  });
  const animationFieldsRef = useRef<DirectiveAnimationFormFieldsHandle>(null);
  const utilFieldsRef = useRef<DirectiveUtilFormFieldsHandle>(null);
  const soundFieldsRef = useRef<DirectiveSoundFormFieldsHandle>(null);
  const filterFieldsRef = useRef<DirectiveFilterFormFieldsHandle>(null);
  const transitionFieldsRef = useRef<DirectiveTransitionFormFieldsHandle>(null);

  const directiveNameGroup = useMemo(() => {
    return DirectiveNameOptionGroups.find(
      (item) => item.type === directiveType,
    );
  }, [directiveType]);

  useEffect(() => {
    if (editingDirective) {
      form.reset(editingDirective.value as z.infer<typeof formSchema>, {
        keepDefaultValues: true,
      });
    } else {
      form.reset();
    }
  }, [editingDirective, form.reset, form]);

  function onSubmit(value: z.infer<typeof formSchema>) {
    let label = "";

    if (animationFieldsRef.current) {
      label = animationFieldsRef.current.getDirectiveLabel();
    } else if (utilFieldsRef.current) {
      label = utilFieldsRef.current.getDirectiveLabel();
    } else if (soundFieldsRef.current) {
      label = soundFieldsRef.current.getDirectiveLabel();
    } else if (filterFieldsRef.current) {
      label = filterFieldsRef.current.getDirectiveLabel();
    } else if (transitionFieldsRef.current) {
      label = transitionFieldsRef.current.getDirectiveLabel();
    }

    onSubmitDirective({
      ...value,
      label,
    } as TDirectiveValue);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-2 flex flex-col h-full"
      >
        <FormField
          control={form.control}
          name="directive"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>{directiveNameGroup?.name}</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="请选择指令" />
                  </SelectTrigger>
                  <SelectContent>
                    {directiveNameGroup?.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />
        {AnimationDirectiveNameList.includes(
          formDirective as DirectiveName,
        ) && (
          <DirectiveAnimationFormFields form={form} ref={animationFieldsRef} />
        )}
        {UtilDirectiveNameList.includes(formDirective as DirectiveName) && (
          <DirectiveUtilFormFields form={form} ref={utilFieldsRef} />
        )}
        {SoundDirectiveNameList.includes(formDirective as DirectiveName) && (
          <DirectiveSoundFormFields form={form} ref={soundFieldsRef} />
        )}
        {FilterDirectiveNameList.includes(formDirective as DirectiveName) && (
          <DirectiveFilterFormFields form={form} ref={filterFieldsRef} />
        )}
        {formDirective === DirectiveName.FadeInTransition && (
          <DirectiveTransitionFormFields
            form={form}
            ref={transitionFieldsRef}
          />
        )}
        {formDirective && formDirective !== DirectiveName.Wait && (
          <FormField
            control={form.control}
            name="params.sequential"
            render={({ field }) => (
              <FormItem className="space-y-0 flex flex-row items-center !mb-4">
                <FormLabel className="flex flex-col w-[4rem]">
                  串行执行
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
        )}
        <div className="pt-2 !mt-auto sticky left-0 bottom-0 bg-white w-full flex justify-center border-t border-t-border gap-2">
          <Button size="sm" type="submit">
            确定
          </Button>
          <Button size="sm" type="button" onClick={onCancel} variant="outline">
            取消
          </Button>
        </div>
      </form>
    </Form>
  );
}
