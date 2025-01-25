import { useState } from "react";

export function useText2Scene() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"formatter" | "ai">();

  const handleOpenImportText2Scene = () => {
    setIsOpen(true);
    setType("formatter");
  };

  const handleOpenAiText2Scene = () => {
    setIsOpen(true);
    setType("ai");
  };

  const handleCloseText2Scene = () => {
    setIsOpen(false);
  };

  return {
    isOpenText2Scene: isOpen,
    text2SceneType: type,
    handleOpenImportText2Scene,
    handleOpenAiText2Scene,
    handleCloseText2Scene,
  };
}
