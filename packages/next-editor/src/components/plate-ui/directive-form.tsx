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
import { Input } from "@/components/ui/input";
import { TDirectiveElement, TDirectiveValue } from "../plugin/directive";
import { useEffect } from "react";

const formSchema = z.object({
  directive: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  params: z.object({}),
});

export function DirectiveForm({
  editingDirective,
  onSubmitDirective,
}: {
  editingDirective: TDirectiveElement | null;
  onSubmitDirective: (value: TDirectiveValue) => void;
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
    console.log(values);
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
              <FormLabel>Directive</FormLabel>
              <FormControl>
                <Input placeholder="directive" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
