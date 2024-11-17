import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAssetLibrary } from "@/components/hooks/useAssetLibrary";
import { Slider } from "@/components/ui/slider";
import { createSound } from "@/lib/core";
import { DBAssetType } from "@/db";
import { useEditorStore } from "@/store";
import { useEffect } from "react";
import { Icons } from "../icons";

const formSchema = z.object({
  voice: z.object({
    label: z.string(),
    targetName: z.string(),
    volume: z.number().optional(),
  }),
});

export function DirectiveVoiceForm({ speak, onChangeSpeak }) {
  const { selectAsset } = useAssetLibrary();
  const editor = useEditorStore((state) => state.editor);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: speak,
  });
  const formValues = useWatch({
    control: form.control,
  });

  const handleOpenAndAddVoice = async (onChange: (name: string) => void) => {
    const asset = await selectAsset(DBAssetType.Audio);

    if (asset) {
      const sound = createSound(asset);

      editor.addSound(sound);

      form.setValue("voice.label", sound.label);
      onChange(sound.name);
    }
  };

  const handleDeleteVoice = (onChange: (name: string) => void) => {
    editor.removeSoundByName(formValues.voice.targetName);
    form.setValue("voice.label", "");
    onChange("");
  };

  useEffect(() => {
    if (form.formState.isDirty) {
      onChangeSpeak({
        ...speak,
        ...formValues,
      });
    }
  }, [form.formState.isDirty, formValues]);

  return (
    <Form {...form}>
      <form className="space-y-2">
        <FormField
          control={form.control}
          name="voice.targetName"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>配音文件</FormLabel>
              <FormControl>
                <div className="flex gap-1 items-center">
                  {field.value && formValues.voice?.label ? (
                    <>
                      <span>{formValues.voice.label}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="px-1"
                      >
                        <Icons.edit
                          className="size-4 cursor-pointer"
                          onClick={() => handleOpenAndAddVoice(field.onChange)}
                        ></Icons.edit>
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="px-1"
                      >
                        <Icons.delete
                          className="size-4 cursor-pointer"
                          onClick={() => handleDeleteVoice(field.onChange)}
                        ></Icons.delete>
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleOpenAndAddVoice(field.onChange)}
                    >
                      选择素材
                    </Button>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="voice.volume"
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
