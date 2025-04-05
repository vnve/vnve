import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { DirectiveSpeakForm } from "@/components/plate-ui/directive-speak-form";

interface SceneSettings {
  speak: any;
  autoShowBackground: boolean;
}

interface SceneSettingsDialogProps {
  isOpen: boolean;
  speak: any;
  autoShowBackground: boolean;
  onClose: () => void;
  onConfirm: (settings: SceneSettings) => void;
}

export const SceneSettingsDialog: React.FC<SceneSettingsDialogProps> = ({
  isOpen,
  speak,
  autoShowBackground,
  onClose,
  onConfirm,
}) => {
  const [settings, setSettings] = React.useState<SceneSettings>({
    speak,
    autoShowBackground,
  });

  const handleChangeSpeak = (speak: any) => {
    setSettings({ ...settings, speak });
  };

  const handleChangeAutoShowBackground = (autoShowBackground: boolean) => {
    setSettings({ ...settings, autoShowBackground });
  };

  const handleChangeVolume = (value: number[]) => {
    setSettings({
      ...settings,
      speak: {
        ...settings.speak,
        voice: {
          ...(settings.speak.voice || {}),
          volume: value[0],
        },
      },
    });
  };

  const handleConfirm = () => {
    onConfirm(settings);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">场景设置</DialogTitle>
          <DialogDescription>
            场景设置变更会应用到当前场景所有的对白以及后续新增的对白中
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <DirectiveSpeakForm
            speak={settings.speak}
            onChangeSpeak={handleChangeSpeak}
            disableCustomName={true}
          />
          <div className="flex items-center">
            <span className="text-sm font-medium w-[8rem]">自动展示背景</span>
            <Switch
              checked={settings.autoShowBackground}
              onCheckedChange={handleChangeAutoShowBackground}
            />
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium w-[8rem]">配音音量</span>
            <div className="flex-1">
              <Slider
                value={[settings.speak.voice?.volume ?? 1]}
                onValueChange={handleChangeVolume}
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
                showPercentage={true}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="justify-center sm:justify-center">
          <Button onClick={handleConfirm}>确定</Button>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
