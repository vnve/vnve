import {
  assetDB,
  assetSourceDB,
  DBAsset,
  DBAssetTypeNameMap,
  DBAssetType,
  getAssetSourceURL,
  DBAssetState,
} from "@/db";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import FileSelector from "./FileSelector";
import { AssetStateCard } from "./AssetCard";
import { getFileInfo } from "@/lib/utils";

const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, {
    message: "名称必填",
  }),
  type: z.string().min(1, {
    message: "类型必选",
  }),
  states: z
    .array(
      z
        .object({
          id: z.number().optional(),
          name: z.string().min(1, {
            message: "状态名称必填",
          }),
          ext: z.string().optional(),
          file: z.instanceof(File).optional(),
        })
        .refine((data) => data.id || data.file, {
          message: "状态文件必选",
        }),
    )
    .min(1, {
      message: "至少需要一个状态",
    }),
});

export function AssetForm({
  asset,
  onSubmit,
  onCancel,
}: {
  asset: DBAsset;
  onSubmit: (asset: any) => void;
  onCancel: () => void;
}) {
  const assetTypeName = useMemo(
    () => DBAssetTypeNameMap[asset.type],
    [asset.type],
  );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      states: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "states",
    keyName: "_id",
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  const handleChangeFile = (file: File, index: number) => {
    form.setValue(`states.${index}.file`, file);
    if (!form.getValues(`states.${index}.name`)) {
      form.setValue(`states.${index}.name`, getFileInfo(file).name);
    }
  };

  useEffect(() => {
    form.reset({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      states: asset.states,
    });
  }, [asset, form]);

  return (
    <div>
      <h3 className="text-base font-bold mb-4">
        {asset.id ? "编辑" : "新增"}
        {assetTypeName}
      </h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{assetTypeName}名</FormLabel>
                <FormControl>
                  <Input placeholder={`请输入${assetTypeName}名`} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>
              {assetTypeName}状态
              <Button
                size="sm"
                variant="outline"
                onClick={() => append({ name: "" })}
                className="ml-2"
              >
                <Icons.squarePlus className="size-4 mr-1"></Icons.squarePlus>
                新增状态
              </Button>
            </FormLabel>
            <FormControl>
              <div>
                {fields.length > 0 && (
                  <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                    <div className="flex w-full gap-2 p-2">
                      {fields.map((field, index) => (
                        <AssetStateCard
                          key={index}
                          type={asset.type}
                          state={field as DBAssetState}
                        >
                          <>
                            <CardContent className="p-2 flex justify-center">
                              <FileSelector
                                className="w-full h-full"
                                type={asset.type}
                                url={
                                  field.id &&
                                  getAssetSourceURL(field as DBAssetState)
                                }
                                onChange={(file) =>
                                  handleChangeFile(file, index)
                                }
                              ></FileSelector>
                            </CardContent>
                            <CardFooter className="font-medium p-2 pt-0 flex flex-col gap-1">
                              <div className="flex w-full justify-between">
                                <FormField
                                  control={form.control}
                                  name={`states.${index}.name`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          className="h-6 text-sm"
                                          placeholder="请输入状态名"
                                          {...field}
                                        />
                                      </FormControl>
                                      {/* <FormMessage /> */}
                                    </FormItem>
                                  )}
                                />
                                <Icons.delete
                                  className="size-4 ml-1 mt-1 flex-shrink-0 cursor-pointer hover:text-destructive"
                                  onClick={() => remove(index)}
                                ></Icons.delete>
                              </div>
                            </CardFooter>
                          </>
                        </AssetStateCard>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
          <div className="flex gap-2">
            <Button size="sm" type="submit">
              确定
            </Button>
            <Button
              size="sm"
              type="button"
              className="mr-2"
              variant="outline"
              onClick={onCancel}
            >
              取消
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
