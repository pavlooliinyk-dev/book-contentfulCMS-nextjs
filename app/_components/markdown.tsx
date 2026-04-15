import Image from "next/image";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS,  Block, Inline } from "@contentful/rich-text-types";

interface Asset {
  sys: {
    id: string;
  };
  url: string;
  description: string;
}

interface AssetLink {
  block: Asset[];
}

interface Content {
  json: any;
  links?: {
    assets: AssetLink;
  };
}

function RichTextAsset({
  id,
  assets,
}: {
  id: string;
  assets: Asset[] | undefined;
}) {
  const asset = assets?.find((asset) => asset.sys.id === id);

  if (asset?.url) {
    return <Image src={asset.url} fill alt={asset.description} />;
  }

  return null;
}

export function Markdown({ content }: { content: Content }) {
  return documentToReactComponents(content.json, {
    renderNode: {
      [BLOCKS.EMBEDDED_ASSET]: (node:  Block | Inline) => (
        <RichTextAsset
          id={node.data.target.sys.id}
          assets={content.links?.assets?.block}
        />
      ),
    },
  });
}
