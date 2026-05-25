import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { DocumentType, gql } from "@/gql";
import { cn, keytoUrl } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddToWishListButton } from "@/features/wishlists";
import { Rating } from "@/components/ui/rating";
import { BadgeType } from "@/lib/supabase/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/layouts/icons";

type CardProps = React.ComponentProps<typeof Card>;

export type ProductCardProps = CardProps & {
  product: DocumentType<typeof ProductCardFragment>;
};

export const ProductCardFragment = gql(/* GraphQL */ `
  fragment ProductCardFragment on products {
    id
    name
    rating
    slug
    badge
    price
    brand
    images
    collections {
      id
      label
      slug
    }
  }
`);

export function ProductCard({
  className,
  product,
  ...props
}: ProductCardProps) {
  const { id, name, slug, badge, price, images, brand, rating } = product;
  const parsedImages = typeof images === "string" ? JSON.parse(images) : images;
  console.log(parsedImages)
  const imageUrl = parsedImages.length > 0 ? parsedImages[0] : null;
  console.log(imageUrl)
  return (
    <Card
      className={cn("w-full border-0 rounded-lg py-3 ", className)}
      {...props}
    >
      <CardContent className="relative p-0 mb-5 overflow-hidden">
        <Link href={`/shop/${slug}`}>
        {imageUrl? (
            <Image
              src={imageUrl}
              alt={name}
              width={400}
              height={400}
              className="aspect-[1/1] object-cover object-center hover:scale-[1.02] hover:opacity-70 transition-all duration-500"
            />
          ) : (
            <div className="aspect-[1/1] w-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
        </Link>

        {badge && (
          <Badge className="absolute top-0 left-0" variant={badge as BadgeType}>
            {badge.replace("_", " ")}
          </Badge>
        )}
      </CardContent>

      <CardHeader className="p-0 mb-3 md:mb-5">
        <CardTitle>
          <Link href={`/products/${slug}`} className="hover:underline">
            {name}
          </Link>
        </CardTitle>
        {brand && (
          <p className="text-xm text-muted-foreground">{brand}</p>
        )}

        <div className="">৳{price}</div>

{/*        <div className="hidden md:block">
          <CardDescription className="max-w-[240px] line-clamp-2">
            {product.description}
          </CardDescription>
        </div>
*/}

        <div className="hidden md:block">
          <Rating value={Number(rating || 0)} precision={0.5} readOnly />
        </div>
      </CardHeader>

      <CardFooter className="gap-x-2 md:gap-x-5 p-0 ">
{/*        <Suspense
          fallback={
            <Button className="rounded-full p-0 h-8 w-8" disabled>
              <Icons.basket className="h-5 w-5 md:h-4 md:w-4" />
            </Button>
          }
        >
          <AddToWishListButton productId={id} />
        </Suspense>*/}

        <Suspense
          fallback={
            <Button className="rounded-full p-3" variant="ghost" disabled>
              <Icons.heart className={"w-4 h-4 fill-none"} />
            </Button>
          }
        >
          <AddToWishListButton productId={id} />
        </Suspense>
      </CardFooter>
    </Card>
  );
}

export default ProductCard;
