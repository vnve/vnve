import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSettingsStore } from "@/store/settings";

const llmFormSchema = z.object({
  platform: z.string().min(1, "平台必选"),
  key: z.string().min(1, "API KEY不能为空"),
  model: z.string().min(1, "模型不能为空"),
});

const ttsFormSchema = z.object({
  token: z.string().min(1, "Token不能为空"),
  appid: z.string().min(1, "AppID不能为空"),
});

export function EditorSettingsDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState("llm");
  const ai = useSettingsStore((state) => state.ai);
  const tts = useSettingsStore((state) => state.tts);
  const updateAI = useSettingsStore((state) => state.updateAI);
  const updateTTS = useSettingsStore((state) => state.updateTTS);

  const handleOpenChange = (value) => {
    if (!value) {
      onClose();
    }
  };

  const llmForm = useForm<z.infer<typeof llmFormSchema>>({
    resolver: zodResolver(llmFormSchema),
    defaultValues: {
      platform: "deepseek",
      key: "",
      model: "deepseek-chat",
    },
  });

  const ttsForm = useForm<z.infer<typeof ttsFormSchema>>({
    resolver: zodResolver(ttsFormSchema),
    defaultValues: {
      appid: "",
      token: "",
    },
  });

  function onSubmitLLM(values: Required<z.infer<typeof llmFormSchema>>) {
    updateAI(values);
    onClose();
  }

  function onSubmitTTS(values: Required<z.infer<typeof ttsFormSchema>>) {
    updateTTS(values);
    onClose();
  }

  useEffect(() => {
    if (ai) {
      llmForm.reset(ai);
    }
  }, [ai, llmForm]);

  useEffect(() => {
    if (tts) {
      ttsForm.reset(tts);
    }
  }, [tts, ttsForm]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="min-w-[400px]"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="llm">大模型</TabsTrigger>
            <TabsTrigger value="tts">语音合成</TabsTrigger>
          </TabsList>

          <TabsContent value="llm">
            <Form {...llmForm}>
              <form
                onSubmit={llmForm.handleSubmit(onSubmitLLM)}
                className="space-y-4"
              >
                <FormField
                  control={llmForm.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI平台</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="请选择AI平台" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="deepseek">DeepSeek</SelectItem>
                            <SelectItem value="ark">火山方舟</SelectItem>
                            <SelectItem value="openai">OpenAI</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={llmForm.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API KEY</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="请输入API KEY"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={llmForm.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入模型名称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-center gap-2">
                  <Button type="submit">确定</Button>
                  <Button variant="ghost" onClick={onClose}>
                    取消
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="tts">
            <Form {...ttsForm}>
              <form
                onSubmit={ttsForm.handleSubmit(onSubmitTTS)}
                className="space-y-4"
              >
                <FormField
                  control={ttsForm.control}
                  name="appid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AppID</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入AppID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={ttsForm.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="请输入Token"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-center gap-2">
                  <Button type="submit">确定</Button>
                  <Button variant="ghost" onClick={onClose}>
                    取消
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
