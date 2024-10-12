import { DBAsset, DBAssetState, getAssetSourceURL } from "@/db";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

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
      <h3 className="text-base font-bold mb-4">选择展示的状态</h3>
      <ScrollArea>
        {asset.states.map((state) => {
          return (
            <div key={state.id} onClick={() => onSelectState(state)}>
              <div
                className="aspect-[9/16] h-[160px] w-[90px] bg-[length:20px_20px]"
                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><rect width="10" height="10" fill="%23ccc"/><rect x="10" y="10" width="10" height="10" fill="%23ccc"/></svg>')`,
                }}
              >
                <img
                  src={getAssetSourceURL(state)}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>{state.name}</div>
            </div>
          );
        })}
      </ScrollArea>
      <Button onClick={onCancel}>返回列表</Button>
    </div>
  );
}
