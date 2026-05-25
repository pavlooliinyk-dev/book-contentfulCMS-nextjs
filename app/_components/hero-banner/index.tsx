import Image from "next/image";
import { ImageWithTextSection, PositionX, PositionY } from "@/lib/types";

interface HeroBannerProps {
  heroBanner: {
    url: string;
  };
  title?: string;
  imageWithTextSection?: ImageWithTextSection;
}

export default function HeroBanner({ 
  heroBanner, 
  title, 
  imageWithTextSection 
}: HeroBannerProps) {
  return (
    <div className="my-8 md:mb-16 relative w-full h-[400px] md:h-[600px]">
      <Image 
        src={heroBanner.url} 
        alt={title || "Hero banner"}
        fill
        fetchPriority="high"
        loading="eager"
        sizes="100vw"
        className="object-cover rounded-lg shadow-lg"
      />
        
      {imageWithTextSection?.text && (
        <div className={`absolute p-8 bg-black/50 backdrop-blur-sm rounded-lg ${
          imageWithTextSection.position === PositionY.TOP 
            ? 'top-8 left-1/2 -translate-x-1/2 w-[90%] md:w-[70%] text-center' :
            imageWithTextSection.position === PositionY.BOTTOM 
              ? 'bottom-8 left-1/2 -translate-x-1/2 w-[90%] md:w-[70%] text-center' :
              imageWithTextSection.position === PositionX.LEFT 
                ? 'top-1/2 -translate-y-1/2 left-8 w-[80%] md:w-[40%] text-left' :
                imageWithTextSection.position === PositionX.RIGHT 
                  ? 'top-1/2 -translate-y-1/2 right-8 w-[80%] md:w-[40%] text-right' :
                  'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[70%] text-center'
        }`}>
          <p className="text-xl md:text-2xl italic text-white font-semibold">
            {imageWithTextSection.text}
          </p>
        </div>
      )}
    </div>
  );
}
