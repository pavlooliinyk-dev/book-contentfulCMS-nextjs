"use client";

import Image from "next/image";

interface ContentfulImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  fill?: boolean;
  sizes?: string;
  [key: string]: any;
}

/**
 * Optimizes Contentful images by adding URL parameters for resizing and format conversion
 */
function getOptimizedContentfulUrl(
  src: string, 
  width?: number, 
  quality: number = 80
): string {
  if (!src.includes('ctfassets.net') && !src.includes('contentful.com')) {
    return src; // Not a Contentful image
  }

  const url = new URL(src);
  const params = new URLSearchParams(url.search);
  
  // Add WebP format for better compression
  params.set('fm', 'webp');
  
  // Add quality parameter (1-100, default 80)
  params.set('q', quality.toString());
  
  // Add width if provided (for responsive sizing)
  if (width) {
    params.set('w', width.toString());
  }
  
  url.search = params.toString();
  return url.toString();
}

export default function ContentfulImage({ 
  src, 
  width, 
  height, 
  quality = 80,
  fill,
  alt,
  sizes,
  ...props 
}: ContentfulImageProps) {
  // For fill images, dynamically calculate width based on sizes prop
  const optimizationWidth = fill && sizes ? parseInt(sizes.match(/\d+/)?.[0] || '1920') : width;
  const optimizedSrc = getOptimizedContentfulUrl(src, optimizationWidth, quality);
  
  return (
    <Image 
      alt={alt}
      src={optimizedSrc}
      width={width}
      height={height}
      fill={fill}
      quality={quality}
      sizes={sizes}
      {...props}
    />
  );
}
