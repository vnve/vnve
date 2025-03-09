import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  speak,
  autoShowBackground,
  isOpen,
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
      speak: { ...settings.speak, voice: { volume: value[0] } },
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
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <DirectiveSpeakForm
            speak={settings.speak}
            onChangeSpeak={handleChangeSpeak}
            disableCustomName={true}
          />
          <div className="flex items-center mt-2">
            <span className="text-sm font-medium w-[8rem]">配音音量</span>
            <Slider
              value={[settings.speak.voice?.volume]}
              onValueChange={handleChangeVolume}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>
          <div className="flex items-center mt-2">
            <span className="text-sm font-medium w-[8rem]">自动展示背景</span>
            <Switch
              checked={settings.autoShowBackground}
              onCheckedChange={handleChangeAutoShowBackground}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleConfirm}>确认</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
