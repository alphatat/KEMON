

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

    // cartsCollection(filter: { user_id: { eq: $user_id } }) {
    //   edges {
    //     node {
    //       product_id
    //       quantity
    //     }
    //   }
    // }


const LandingRouteQuery = gql(/* GraphQL */ `
  query LandingRouteQuery($user_id: UUID) {
    products: productsCollection(
      filter: { featured: { eq: true } }
      first: 50
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


    collectionScrollCards: collectionsCollection(
      first: 50
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
      <Shell>
        {data?.collectionScrollCards?.edges && (
          <ProductSubCollectionsCircles
            collections={data.collectionScrollCards.edges}
          />
        )}

        {data?.products?.edges && data.products.edges.length > 0 && (
          <FeaturedProductsCards products={data.products.edges} />
        )}

        {/* <CollectionGrid /> 
{/* 
        <DifferentFeatureCards />

        <LessIsMoreCard /> */}
      </Shell>
    </main>
  );
}

interface CollectionsCardProps {
  collections: { node: DocumentType<typeof CollectionCardFragment> }[];
}

function ProductSubCollectionsCircles({ collections }: CollectionsCardProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <section className="flex justify-start items-center gap-x-6 py-6">
        {collections.map(( { node }) => (
          <Link 
            href={`/collections/${node.slug}`}
            key={`collection_circle_${node.id}`}
            className="flex flex-col items-center gap-2 min-w-[80px]"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-primary font-bold text-lg">
              {node.label[0]}
            </div>
            <p className="text-xs text-center">{node.label}</p>
          </Link>
          ))}
      </section>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
    );
}

interface FeaturedProductCardsProps {
  products: { node: DocumentType<typeof ProductCardFragment> }[];
}

function FeaturedProductCards({ products }: FeaturedProductCardsProps) {
  return (
    <section className="mt-8">
      <h2 className="font-semibold text-2xl mb-4"> Featured Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
        <Suspense fallback={[...Array(4)].map((_, i) => <ProductCardSkeleton key ={i} />)}>
          {products.map(({ node }) => (
            <ProductCard key={`product-card-${node.id}`} product={node} />  
          ))}
        </Suspense>
      </div>
    </section>
    );
}