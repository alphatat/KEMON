"use client";

import { gql } from "@/gql";
import { SearchQuery, SearchQueryVariables } from "@/gql/graphql";
import { useQuery } from "@urql/next";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/features/products";
import SearchProductsGridSkeleton from "./SearchProductsGridSkeleton";
import { useEffect, useRef } from "react";
const ProductSearch = gql(/* GraphQL */ `
  query Search(
    $search: String
    $lower: BigFloat
    $upper: BigFloat
    $collections: [String!]
    $first: Int!
    $after: Cursor
    $orderBy: [productsOrderBy!]
  ) {
    productsCollection(
      filter: {
        and: [
          { name: { ilike: $search } }
          { price: { gt: $lower, lt: $upper } }
          { collection_id: { in: $collections } }
        ]
      }
      first: $first
      after: $after
      orderBy: $orderBy
    ) {
      edges {
        node {
          id
          name
          slug
          rating
          badge
          price
          brand
          images
          totalComments
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

const SearchResultPage = ({
  variables,
  onLoadMore,
  isLastPage,
}: {
  variables: SearchQueryVariables;
  onLoadMore: (cursor: string) => void;
  isLastPage: boolean;
}) => {
  const [result] = useQuery<SearchQuery, SearchQueryVariables>({
    query: ProductSearch,
    variables,
  });

  const { data, fetching, error } = result;

  const products = data?.productsCollection;


  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isLastPage || !products?.pageInfo.hasNextPage || fetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting) {
          onLoadMore(products.pageInfo.endCursor)
        }
      },
      { rootMargin: "0px 0px 2000px 0px", threshold: 0.1 }
    );
  
  if (sentinelRef.current) {
    observer.observe(sentinelRef.current);
  }

  return () => observer.disconnect();

  }, [isLastPage, products?.pageInfo.hasNextPage, products?.pageInfo.endCursor, fetching, onLoadMore]);


  return (
    <div>

      {error && <p>Oh no... {error.message}</p>}


      {products && (
        <>
          {products.edges.length === 0 && (
            <p>
              {`There is no Products with name `}
              <span className="font-bold">
                {(variables.search || []).slice(1, -1)}
              </span>
              {"."}
            </p>
          )}

          <section 
            className="grid grid-cols-2 lg:grid-cols-4 w-3/4 gap-y-8 gap-x-3 py-5"
            style={{ overflowAnchor: "auto"}}
          >

            {products.edges.map(({ node }) => (
              <ProductCard key={node.id} product={node} />
            ))}
          </section>
        </>
      )}

    {fetching && (
      <div className="w-full h-24 flex items-center text-sm justify-center text-muted-foreground animate-pulse">
        \.../
      </div>
    )}


      {isLastPage && products?.pageInfo?.hasNextPage && (
        <div
          className="w-full h-10"
          ref={sentinelRef}
        >
          {/*<Button onClick={() => onLoadMore(products.pageInfo.endCursor)}>
            load more
          </Button>*/}
        </div>
      )}

    </div>
  );
};

export default SearchResultPage;



