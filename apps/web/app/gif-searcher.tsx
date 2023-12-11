import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  useFloating,
  useHover,
  useInteractions,
  FloatingPortal,
  autoPlacement,
} from "@floating-ui/react";
import { useSyncedStore } from "@syncedstore/react";
import { toast } from "react-hot-toast";
import type { GifPartialPayload } from "./api/giphy/route";
import { store } from "./store";

export default function GifSearcher({
  userId,
}: {
  userId: string;
}): React.ReactElement {
  const { gifSubmissions } = useSyncedStore(store);
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [gifResults, setGifResults] = useState<
    GifPartialPayload[] | undefined
  >();

  return (
    <div className="flex flex-col justify-start w-full h-full p-1 gap-1 bg-[#f6ff65]">
      <div className="flex items-center justify-center">
        <input
          type="text"
          className="flex-grow min-w-[50px] h-8 p-1 pl-2"
          placeholder="search for a gif"
          value={searchTerm}
          disabled={searching}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
        />
        <button
          type="button"
          disabled={searching}
          className="h-8 rounded-[0] bg-white border-0"
          onClick={async () => {
            setSearching(true);
            const r = await fetch("/api/giphy", {
              method: "POST",
              body: JSON.stringify({
                search: searchTerm,
              }),
            });
            setSearching(false);
            const { data } = (await r.json()) as { data: GifPartialPayload[] };
            setGifResults(data);
          }}
        >
          <MagnifyingGlassIcon width={18} />
        </button>
      </div>
      {gifResults === undefined || gifResults.length < 1 ? (
        <div className="flex items-center justify-center w-full h-full">
          {searching ? "Searching" : "No results"}
        </div>
      ) : (
        <div className="w-full h-full overflow-scroll grid grid-cols-3 no-scroll gap-1">
          {gifResults.map((result) => (
            <GifResult
              result={result}
              key={result.id}
              onClick={(url) => {
                toast.success("GIF sent!");
                gifSubmissions.push({
                  sender: userId,
                  url,
                });
              }}
            />
          ))}
        </div>
      )}
      <div className="flex justify-end">
        <img
          src="/giphy.png"
          className="h-auto w-28 max-w-[60%]"
          alt="powered by giphy"
        />
      </div>
    </div>
  );
}

function GifResult({
  result,
  onClick,
}: {
  result: GifPartialPayload | undefined;
  onClick: (url: string) => void;
}): React.ReactElement {
  const [isHover, setIsHover] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open: isHover,
    onOpenChange: setIsHover,
    middleware: [autoPlacement()],
  });
  const hover = useHover(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);
  if (result === undefined) {
    return <span />;
  }

  return (
    <button
      key={result.id}
      type="button"
      ref={refs.setReference}
      {...getReferenceProps()}
      className="aspect-square w-full relative [&:hover>span]:flex [&>span]:hidden p-0 border-none"
      onClick={() => {
        onClick(result.images.fixed_height.url);
      }}
    >
      <img
        src={result.images.fixed_height.url}
        alt="thumbnail"
        className="object-cover w-full cursor-pointer aspect-square"
      />

      <span className="absolute top-0 left-0 flex items-center justify-center w-full h-full text-sm text-center cursor-pointer bg-white/70 z-4">
        Click to send GIF
      </span>
      {isHover ? (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="w-[240px] p-2 rounded bg-white z-[41]"
            {...getFloatingProps()}
          >
            <img
              src={result.images.fixed_height.url}
              alt="thumbnail"
              className="w-full"
            />
          </div>
        </FloatingPortal>
      ) : (
        false
      )}
    </button>
  );
}
