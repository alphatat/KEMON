

import { getCurrentUser } from "@/features/users/actions";
import { Icons } from "@/components/layouts/icons";

import { Shell } from "@/components/layouts/Shell";
import { createClient } from "@/lib/supabase/server";



import { buttonVariants } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  CollectionCardFragment,
  CollectionsCard,
  CollectionsCardSkeleton,
} from "@/features/collections";
import {
  ProductCard,
  ProductCardFragment,
  ProductCardSkeleton,
} from "@/features/products";
import { DocumentType, gql } from "@/gql";
import { getClient } from "@/lib/urql";
import { cn, keytoUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const LandingRouteQuery = gql(/* GraphQL */ `
  query LandingRouteQuery($user_id: UUID) {
    products: productsCollection(
      filter: { featured: { eq: true } }
      first: 4
      orderBy: [{ created_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          ...ProductCardFragment
        }
      }
    }

    wishlistCollection(filter: { user_id: { eq: $user_id } }) {
      edges {
        node {
          product_id
        }
      }
    }

    cartsCollection(filter: { user_id: { eq: $user_id } }) {
      edges {
        node {
          product_id
          quantity
        }
      }
    }

    collectionScrollCards: collectionsCollection(
      first: 6
      orderBy: [{ order: DescNullsLast }]
    ) {
      edges {
        node {
          id
          ...CollectionCardFragment
        }
      }
    }
  }
`);

export default async function Home() {
  const currentUser = await getCurrentUser();

  const { data } = await getClient().query(LandingRouteQuery, {
    user_id: currentUser?.id,
  });

  if (data === null) return notFound();

  return (
    <main>
      {/* <HeroSection /> */}

      <Shell>
{/*        {data?.products && data.products.edges ? (
          <ProductSubCollectionsCircles
            collections={data.collectionScrollCards.edges}
          />
        ) : null}

        {data?.products && data.products.edges ? (
          <FeaturedProductsCards products={data.products.edges} />
        ) : null}

        {/* <CollectionGrid /> */}
{/* 
        <DifferentFeatureCards />

        <LessIsMoreCard /> */}
      </Shell>
    </main>
  );
}

