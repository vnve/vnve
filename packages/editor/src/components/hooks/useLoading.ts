import { useLoadingStore } from "@/store";

export function useLoading() {
  const setOpen = useLoadingStore((state) => state.setOpen);
  const setLoadingText = useLoadingStore((state) => state.setLoadingText);

  const showLoading = (text: string) => {
    setOpen(true);
    setLoadingText(text);
  };
  const updateLoadingText = (text: string) => {
    setLoadingText(text);
  };
  const hideLoading = () => {
    setOpen(false);
    setLoadingText("");
  };

  return {
    showLoading,
    updateLoadingText,
    hideLoading,
  };
}
