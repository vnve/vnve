import { create } from "zustand";
import { Game } from "@vnve/core";
import { immer } from "zustand/middleware/immer";

export const useGameStore = create<{
  game: Game;
  initGame(view: HTMLCanvasElement): void;
}>()(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  immer<any>((set) => {
    let game: Game;

    return {
      game: null, // editor仅提供方法调用，内部属性不用作状态同步
      initGame(view: HTMLCanvasElement) {
        game = new Game({
          view,
        });

        set((state) => {
          state.game = game;
        });
      },
    };
  }),
);
