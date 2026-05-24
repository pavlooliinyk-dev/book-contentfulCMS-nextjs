import Image from "next/image";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, MARKS } from "@contentful/rich-text-types";
import { Asset, RichTextContent } from "@/lib/types";

interface EmbeddedAssetImageNode {
  data?: {
    target?: {
      sys?: {
        id?: string;
      };
    };
  };
}

function RichTextImageAsset({
  id,
  assets,
}: {
  id: string;
  assets: Asset[] | undefined;
}) {
  const asset = assets?.find((asset) => asset.sys.id === id);

  if (asset?.url) {
    return <Image src={asset.url} fill alt={asset.description || "Embedded asset"} />;
  }

  return null;
}

export function Markdown({ content }: { content: RichTextContent }) {
  return documentToReactComponents(content.json, {
    renderMark: {
      [MARKS.BOLD]: (text) => <strong>{text}</strong>,
      [MARKS.ITALIC]: (text) => <em>{text}</em>,
      [MARKS.UNDERLINE]: (text) => <u>{text}</u>,
    },
    renderNode: {
      [BLOCKS.HEADING_1]: (_node, children) => <h1 className="text-4xl font-bold my-6">{children}</h1>,
      [BLOCKS.HEADING_2]: (_node, children) => <h2 className="text-3xl font-bold my-5">{children}</h2>,
      [BLOCKS.HEADING_3]: (_node, children) => <h3 className="text-2xl font-semibold my-4">{children}</h3>,
      [BLOCKS.HEADING_4]: (_node, children) => <h4 className="text-xl font-semibold my-4">{children}</h4>,
      [BLOCKS.HEADING_5]: (_node, children) => <h5 className="text-lg font-medium my-3">{children}</h5>,
      [BLOCKS.HEADING_6]: (_node, children) => <h6 className="text-base font-medium my-3">{children}</h6>,
      [BLOCKS.PARAGRAPH]: (_node, children) => <p className="my-3">{children}</p>,
      [BLOCKS.UL_LIST]: (_node, children) => <ul className="list-disc pl-6 my-4 space-y-1">{children}</ul>,
      [BLOCKS.OL_LIST]: (_node, children) => <ol className="list-decimal pl-6 my-4 space-y-1">{children}</ol>,
      [BLOCKS.LIST_ITEM]: (_node, children) => <li className="leading-7">{children}</li>,
      [BLOCKS.QUOTE]: (_node, children) => (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-5">{children}</blockquote>
      ),
      [BLOCKS.HR]: () => <hr className="my-8 border-gray-300" />,
      [BLOCKS.EMBEDDED_ASSET]: (node: EmbeddedAssetImageNode) => (
        <RichTextImageAsset
          id={node.data?.target?.sys?.id || ""}
          assets={content.links?.assets?.block}
        />
      ),
    },
  });
}
