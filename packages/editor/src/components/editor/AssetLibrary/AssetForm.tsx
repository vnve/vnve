import {
  DBAsset,
  DBAssetTypeNameMap,
  DBAssetType,
  getAssetSourceURL,
  DBAssetState,
  NARRATOR_ASSET_ID,
} from "@/db";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState, useRef } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import FileSelector from "./FileSelector";
import { AssetStateCard } from "./AssetCard";
import { getFileInfo } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { longTextSynthesis, NONE_VOICE, VOICE_OPTIONS } from "@/lib/tts";
import { useSettingsStore } from "@/store/settings";
import { useToast } from "@/components/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { CirclePlay } from "lucide-react";

const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, {
    message: "名称必填",
  }),
  type: z.string().min(1, {
    message: "类型必选",
  }),
  voice: z.string().optional(),
  states: z.array(
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
  ),
});

export function AssetForm({
  asset,
  onSubmit,
  onCancel,
}: {
  asset: DBAsset;
  onSubmit: (asset: DBAsset) => void;
  onCancel: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<{ voice: string; audio: HTMLAudioElement }>();
  const assetTypeName = useMemo(
    () => DBAssetTypeNameMap[asset.type],
    [asset.type],
  );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      voice: "",
      states: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "states",
    keyName: "_id",
  });
  const ttsSettings = useSettingsStore((state) => state.tts);
  const { toast } = useToast();

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values as DBAsset);
  };

  const handleChangeFile = (file: File, index: number) => {
    form.setValue(`states.${index}.file`, file);
    if (!form.getValues(`states.${index}.name`)) {
      form.setValue(`states.${index}.name`, getFileInfo(file).name);
    }
  };

  const handlePreviewVoice = async (voiceType: string) => {
    if (!ttsSettings || !ttsSettings.appid || !ttsSettings.token) {
      toast({
        title: "请先完成语音合成设置",
        variant: "destructive",
      });
      return;
    }
    if (voiceType === NONE_VOICE) return;

    try {
      setIsPlaying(true);

      // 如果是相同音色且已有音频，直接播放
      if (audioRef.current?.voice === voiceType) {
        audioRef.current.audio.play();
        return;
      }

      const result = await longTextSynthesis({
        text: "你好，这是一句试听",
        voiceType,
        token: ttsSettings.token,
        appid: ttsSettings.appid,
      });

      const audio = new Audio(result.audio_url);
      audio.onended = () => {
        setIsPlaying(false);
      };
      audio.play();

      // 保存新的音频对象和对应的音色
      audioRef.current = {
        voice: voiceType,
        audio,
      };
    } catch (error) {
      console.error(error);
      setIsPlaying(false);
    }
  };

  // 组件卸载时清理音频资源
  useEffect(() => {
    return () => {
      if (audioRef.current?.audio) {
        audioRef.current.audio.pause();
        audioRef.current = undefined;
      }
    };
  }, []);

  useEffect(() => {
    form.reset({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      voice: asset.voice,
      states: asset.states,
    });
  }, [asset, form]);

  return (
    <div>
      <h3 className="text-base font-bold mb-2">
        {asset.id ? "编辑" : "新增"}
        {assetTypeName}
        <Alert className="p-2 mt-1">
          <AlertDescription className="text-muted-foreground font-normal flex gap-1 items-center">
            <Icons.tip className="size-4" />
            {[
              DBAssetType.Background,
              DBAssetType.Character,
              DBAssetType.Thing,
              DBAssetType.Dialog,
            ].includes(asset.type) && <span>画布的尺寸为1920*1080</span>}
            {asset.type === DBAssetType.Audio && (
              <span>音频采样率建议&gt;=44100Hz</span>
            )}
            {asset.type === DBAssetType.Font && (
              <span>请使用woff/woff2/ttf字体格式</span>
            )}
          </AlertDescription>
        </Alert>
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
                  <Input
                    placeholder={`请输入${assetTypeName}名`}
                    disabled={asset.id === NARRATOR_ASSET_ID}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {asset.type === DBAssetType.Character && (
            <FormField
              control={form.control}
              name="voice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>角色音色</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="请选择音色" />
                        </SelectTrigger>
                        <SelectContent>
                          {VOICE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              disabled={
                                !field.value ||
                                field.value === NONE_VOICE ||
                                isPlaying
                              }
                              onClick={() => handlePreviewVoice(field.value)}
                            >
                              {isPlaying ? (
                                <Loader className="size-4"></Loader>
                              ) : (
                                <CirclePlay className="size-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>试听角色音色</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {asset.id !== NARRATOR_ASSET_ID && (
            <FormItem>
              <FormLabel className="flex items-center">
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
                                  ext={field.ext}
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
          )}

          <div className="flex gap-2">
            <Button type="submit">确定</Button>
            <Button
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
