import { DBAsset, DBAssetState } from "@/db";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AssetStateCard } from "./AssetCard";

export function AssetStateList({
  asset,
  onSelectState,
  onCancel,
}: {
  asset: DBAsset;
  onSelectState: (state: DBAssetState) => void;
  onCancel: () => void;
}) {
  return (
    <div>
      <h3 className="text-base font-bold mb-4 flex justify-between items-center">
        选择默认状态
        <Button variant="outline" size="sm" onClick={onCancel}>
          返回列表
        </Button>
      </h3>
      <ScrollArea>
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
