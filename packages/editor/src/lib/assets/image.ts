// background
import classroom from "../../assets/image/background/classroom.webp";
import restaurant from "../../assets/image/background/restaurant.webp";
import street from "../../assets/image/background/street.webp";
import library from "../../assets/image/background/library.webp";
import school from "../../assets/image/background/school.webp";

// character
import girl1 from "../../assets/image/character/girl1.webp";
import girl2 from "../../assets/image/character/girl2.webp";
import boy1 from "../../assets/image/character/boy1.webp";

// dialog
import dialog1 from "../../assets/image/dialog/dialog1.webp";

import { assetFactory } from "../utils";

// dialog

const backgroundAssets = assetFactory(
  [
    {
      name: "教室",
      source: classroom,
    },
    {
      name: "餐馆",
      source: restaurant,
    },
    {
      name: "街道",
      source: street,
    },
    {
      name: "学校",
      source: school,
    },
    {
      name: "library",
      source: library,
    },
  ],
  ["image", "background"],
);

const characterAssets = assetFactory(
  [
    {
      name: "女1",
      source: girl1,
    },
    {
      name: "女2",
      source: girl2,
    },
    {
      name: "男1",
      source: boy1,
    },
  ],
  ["image", "character"],
);

const dialogAssets = assetFactory(
  [
    {
      name: "对话框1",
      source: dialog1,
    },
  ],
  ["image", "dialog"],
);

export const PRESET_IMAGE_ASSETS = [
  ...backgroundAssets,
  ...characterAssets,
  ...dialogAssets,
];
