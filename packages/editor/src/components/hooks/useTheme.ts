import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // 从localStorage获取保存的主题设置，如果没有则根据系统偏好设置默认值
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as Theme;
      if (savedTheme) {
        return savedTheme;
      }
      // 首次访问时根据系统偏好设置默认主题
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // 移除之前的主题类
    root.classList.remove("light", "dark");

    // 设置当前主题类
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    // 保存主题设置到localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  return {
    theme,
    setTheme,
  };
}
