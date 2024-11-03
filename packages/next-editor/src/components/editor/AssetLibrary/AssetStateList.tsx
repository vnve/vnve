import { DBAsset, DBAssetState } from "@/db";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AssetStateCard } from "./AssetCard";

export function AssetStateList({
  asset,
  onEdit,
  onSelectState,
  onCancel,
}: {
  asset: DBAsset;
  onEdit: (asset: DBAsset) => void;
  onSelectState: (state: DBAssetState) => void;
  onCancel: () => void;
}) {
  return (
    <div className="h-[calc(100%-2.5rem)] flex flex-col">
      <h3 className="text-base font-bold mb-4 flex justify-between items-center">
        选择默认状态
        <Button
          className="ml-2 mr-auto"
          variant="outline"
          size="sm"
          onClick={() => onEdit(asset)}
        >
          编辑状态
        </Button>
        <Button variant="outline" size="sm" onClick={onCancel}>
          返回列表
        </Button>
      </h3>
      <ScrollArea className="flex-1">
        <div className="flex gap-2 flex-wrap">
          {asset.states?.map((state) => {
            return (
              <AssetStateCard
                key={state.id}
                type={asset.type}
                state={state}
                onSelect={() => onSelectState(state)}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
