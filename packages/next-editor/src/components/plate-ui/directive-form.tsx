import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
import { TDirectiveElement, TDirectiveValue } from "../plugin/directive";
import { useEffect } from "react";
import {
  AnimationDirectiveNameList,
  DirectiveNameOptionGroups,
} from "@/config";
import { DirectiveAnimationFormFields } from "@/components/plate-ui/directive-animation-form-fields";
import { DirectiveName } from "@vnve/next-core";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  directive: z.string().min(1, {
    message: "指令必选",
  }),
  params: z.object({
    targetName: z.string().optional(),
    sequential: z.boolean().optional(),
  }),
});

export function DirectiveForm({
  editingDirective,
  onSubmitDirective,
  onCancel,
}: {
  editingDirective: TDirectiveElement | null;
  onSubmitDirective: (value: TDirectiveValue) => void;
  onCancel: () => void;
}) {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      directive: "",
      params: {},
    },
  });

  useEffect(() => {
    console.log("directiveValue", editingDirective);
    if (editingDirective) {
      form.reset(editingDirective.value, { keepDefaultValues: true });
    } else {
      form.reset();
    }
  }, [editingDirective, form.reset, form]);

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log("values", JSON.stringify(values, null, 2));
    onSubmitDirective(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="directive"
          render={({ field }) => (
            <FormItem>
              <FormLabel>指令</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="请选择指令" />
                  </SelectTrigger>
                  <SelectContent>
                    {DirectiveNameOptionGroups.map((group) => (
                      <SelectGroup key={group.name}>
                        <SelectLabel>{group.name}</SelectLabel>
                        {group.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {AnimationDirectiveNameList.includes(
          form.getValues("directive") as DirectiveName,
        ) && (
          <DirectiveAnimationFormFields
            form={form}
          ></DirectiveAnimationFormFields>
        )}
        {form.getValues("directive") && (
          <FormField
            control={form.control}
            name="params.sequential"
            render={({ field }) => (
              <FormItem>
                <FormLabel>串行</FormLabel>
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
        <Button size="sm" type="submit">
          确定
        </Button>
        <Button onClick={onCancel}>取消</Button>
      </form>
    </Form>
  );
}
