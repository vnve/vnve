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
  SoundDirectiveNameList,
  UtilDirectiveNameList,
} from "@/config";
import {
  DirectiveAnimationFormFields,
  DirectiveAnimationFormFieldsHandle,
} from "@/components/plate-ui/directive-animation-form-fields";
import { DirectiveName } from "@vnve/next-core";
import { Switch } from "@/components/ui/switch";
import {
  DirectiveUtilFormFields,
  DirectiveUtilFormFieldsHandle,
} from "./directive-util-form-fields";
import {
  DirectiveSoundFormFields,
  DirectiveSoundFormFieldsHandle,
} from "./directive-sound-form-fields";

const formSchema = z.discriminatedUnion("directive", [
  z.object({
    directive: z.literal(AnimationDirectiveNameList[0]),
    params: z.object({
      targetName: z.string({
        message: "请选择动画对象",
      }),
      source: z.string({
        message: "请选择目标状态",
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
    }),
  }),
  ...[DirectiveName.Pause, DirectiveName.Stop].map((name) => {
    return z.object({
      directive: z.literal(name),
      params: z.object({
        targetName: z.string({
          message: "请选择音频对象",
        }),
      }),
    });
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
    }

    onSubmitDirective({
      ...value,
      label,
    } as TDirectiveValue);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="directive"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{directiveNameGroup?.name}</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-[180px]">
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
              <FormMessage />
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
        {formDirective && (
          <FormField
            control={form.control}
            name="params.sequential"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center">
                <FormLabel className="mr-4 mt-1.5 flex flex-col space-y-1">
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
        <div className="mt-4">
          <Button size="sm" type="submit" className="mr-2">
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
