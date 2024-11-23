import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { forwardRef, useImperativeHandle } from "react";
import { UseFormReturn } from "react-hook-form";
import { DirectiveNameMap } from "@/config";

export interface DirectiveTransitionFormFieldsHandle {
  getDirectiveLabel: () => string;
}

interface DirectiveTransitionFormFieldsProps {
  form: UseFormReturn;
}

export const DirectiveTransitionFormFields = forwardRef<
  DirectiveTransitionFormFieldsHandle,
  DirectiveTransitionFormFieldsProps
>(({ form }, ref) => {
  useImperativeHandle(ref, () => ({
    getDirectiveLabel: () => {
      const directive = form.getValues("directive");
      return DirectiveNameMap[directive];
    },
  }));

  return (
    <>
      <FormField
        control={form.control}
        name="params.duration"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>转场时长</FormLabel>
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
    </>
  );
});
