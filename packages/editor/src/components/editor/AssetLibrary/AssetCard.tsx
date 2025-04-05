import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DBAssetType,
  DBAssetState,
  DBAsset,
  getAssetSourceURL,
  NARRATOR_ASSET_ID,
} from "@/db";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/icons";
import AudioPlayer from "./AudioPlayer";
import { ImageViewer } from "./ImageViewer";
import { FontViewer } from "./FontViewer";
import { useMemo } from "react";
import { VideoViewer } from "./VideoViewer";

const AssetStateCardWidthMap = {
  [DBAssetType.Background]: "240px",
  [DBAssetType.Character]: "135px",
  [DBAssetType.Thing]: "200px",
  [DBAssetType.Dialog]: "240px",
  [DBAssetType.Audio]: "150px",
  [DBAssetType.Font]: "150px",
};

const ImgAssetClassNameMap = {
  [DBAssetType.Background]: "aspect-[16/9]",
  [DBAssetType.Character]: "aspect-[9/16]",
  [DBAssetType.Thing]: "aspect-[1/1]",
  [DBAssetType.Dialog]: "aspect-[16/3]",
};

export function AssetStatePreviewer({
  type,
  url,
  ext,
  state,
}: {
  type: DBAssetType;
  url?: string;
  ext?: string;
  state?: DBAssetState;
}) {
  const sourceUrl = useMemo(() => {
    if (url) {
      return url;
    }

    if (state && state.id) {
      return getAssetSourceURL(state);
    }

    return "";
  }, [url, state]);

  const sourceExt = useMemo(() => {
    if (ext) {
      return ext;
    }

    if (state) {
      return state.ext;
    }

    return "";
  }, [ext, state]);

  if (Object.keys(ImgAssetClassNameMap).includes(type)) {
    if (sourceExt === "mp4") {
      return (
        <VideoViewer url={sourceUrl} className={ImgAssetClassNameMap[type]} />
      );
    }

    return (
      <ImageViewer url={sourceUrl} className={ImgAssetClassNameMap[type]} />
    );
  }

  if (type === DBAssetType.Audio) {
    return <AudioPlayer url={sourceUrl} />;
  }

  if (type === DBAssetType.Font) {
    return <FontViewer fontName={state?.name} fontUrl={sourceUrl} />;
  }

  return null;
}

export function AssetStateCard({
  type,
  state,
  children,
  onSelect,
}: {
  type: DBAssetType;
  state: DBAssetState;
  children?: React.ReactNode;
  onSelect?: () => void;
}) {
  return (
    <Card
      className="rounded-md cursor-pointer"
      style={{
        width: AssetStateCardWidthMap[type],
      }}
      onClick={onSelect}
    >
      {children ? (
        children
      ) : (
        <>
          <CardContent className="p-2 flex justify-center">
            <AssetStatePreviewer
              type={type}
              state={state}
            ></AssetStatePreviewer>
          </CardContent>
          <CardFooter className="font-medium p-2 pt-0 flex justify-center text-sm break-all">
            {state.name}
          </CardFooter>
        </>
      )}
    </Card>
  );
}

export function AssetCard({
  asset,
  onSelect,
  onEdit,
  onDelete,
}: {
  asset: DBAsset;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <Card className="rounded-md">
      <CardContent
        className="p-0 flex justify-center cursor-pointer"
        onClick={onSelect}
      >
        <Icons.folder className="w-[120px] h-[120px] text-neutral-600 p-2"></Icons.folder>
      </CardContent>
      <CardFooter className="w-[120px] font-medium p-2 pt-0 flex justify-between text-sm">
        <div
          className="max-w-[100px] overflow-hidden text-ellipsis cursor-pointer"
          onClick={onSelect}
        >
          {asset.name}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Icons.more className="w-4 h-4 pointer" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onEdit}>编辑</DropdownMenuItem>
            {asset.id !== NARRATOR_ASSET_ID && (
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                删除
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
