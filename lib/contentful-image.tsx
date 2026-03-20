"use client";

import Image from "next/image";

interface ContentfulImageProps {
  src: string;
  width?: number;
  height?: number;
  quality?: number;
  [key: string]: any; // For other props that might be passed
}

export default function ContentfulImage(props: ContentfulImageProps) {
  return <Image alt={props.alt} {...props} />;
}
