import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { forwardRef, useImperativeHandle } from "react";
import { Input } from "../ui/input";
import { UseFormReturn, useWatch } from "react-hook-form";
import { DirectiveNameMap } from "@/config";

export interface DirectiveUtilFormFieldsHandle {
  getDirectiveLabel: () => string;
}

interface DirectiveUtilFormFieldsProps {
  form: UseFormReturn;
}

export const DirectiveUtilFormFields = forwardRef<
  DirectiveUtilFormFieldsHandle,
  DirectiveUtilFormFieldsProps
>(({ form }, ref) => {
  const formDirective = useWatch({
    control: form.control,
    name: "directive",
  });
  const formWaitDuration = useWatch({
    control: form.control,
    name: "params.duration",
  });

  useImperativeHandle(
    ref,
    () => ({
      getDirectiveLabel: () => {
        return `${DirectiveNameMap[formDirective]}:${formWaitDuration ?? 0}秒`;
      },
    }),
    [formWaitDuration, formDirective],
  );

  return (
    <FormField
      control={form.control}
      name="params.duration"
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel>停顿时间(秒)</FormLabel>
          <FormControl>
            <Input
              type="number"
              min={0}
              step={0.1}
              placeholder="请输入停顿时间"
              value={String(field.value)}
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
  );
});
