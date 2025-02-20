import { Listing } from "@thehoracle/cowrie-marketplace-types/dist/CowrieMarketplace.types";
import Image from "next/image";

const ProductCard = ({
  title,
  price,
  image_url,
  token_denom,
  description,
}: Listing) => {
  return (
    <div className="flex flex-col md:flex-row rounded-t-lg md:rounded-none md:rounded-tl-lg md:rounded-bl-lg  bg-stone-100 dark:bg-stone-900 dark:text-stone-200 shadow-lg">
      <div className="w-full relative aspect-square overflow-hidden rounded-lg border-y border-l border-slate-950">
        {/* 
            image
              TODO: fix desc being image and image being desc
            */}
        <Image
          fill
          alt={description.slice(0, 20)}
          src={image_url}
          className="object-cover object-center"
        />
      </div>
      <div className="flex flex-col justify-between p-2">
        <h3>{title}</h3>
        <div className="flex flex-col items-start">
          <span className="text-[8px]">{token_denom}</span>
          <span className="font-bold text-lg">{price}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

