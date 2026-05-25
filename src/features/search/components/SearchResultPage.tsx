"use client";

import { gql } from "@/gql";
import { SearchQuery, SearchQueryVariables } from "@/gql/graphql";
import { useQuery } from "@urql/next";
//import { Button } from "@/components/ui/button";
import { ProductCard } from "@/features/products";
import SearchProductsGridSkeleton from "./SearchProductsGridSkeleton";
import { useEffect, useRef, useMemo, useState } from "react";
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

type ProductEdge = NonNullable<
  NonNullable<SearchQuery["productsCollection"]>["edges"]
>[number];

const PAGE_SIZE = 28

const SearchResultPage = ({
  variables,
  // onLoadMore,
  // isLastPage,
}: {
  variables: SearchQueryVariables;
  // onLoadMore: (cursor: string) => void;
  // isLastPage: boolean;
}) => {

  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const [allEdges, setAllEdges] = useState<ProductEdge[]>([]);
  const[hasNextPage, setHasNextPage] = useState<boolean>(true);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);
  const lastRequestedCursorRef = useRef<string | null>(null);

  const queryVariables = useMemo<SearchQueryVariables>(
    () => ({
      ...variables,
      first: PAGE_SIZE,
      after: cursor,
    }),
    [variables, cursor]
  );

  const [result] = useQuery<SearchQuery, SearchQueryVariables>({
    query: ProductSearch,
    variables: queryVariables,
  });

  const { data, fetching, error } = result;

  const products = data?.productsCollection;

  useEffect(() => {
    setCursor(undefined);
    setAllEdges([]);
    setHasNextPage(true);
    loadingMoreRef.current = false;
    lastRequestedCursorRef.current = null;
  }, [variables]);

  useEffect(() => {
    if (!products) return;

    setAllEdges((prev) => {
      const seen = new Set(prev.map((e) => e.node.id));
      const dedupedIncoming = products.edges.filter((e) => !seen.has(e.node.id));
      return [...prev, ...dedupedIncoming];
    });

    setHasNextPage(Boolean(products.pageInfo?.hasNextPage));
    loadingMoreRef.current = false;
  }, [products]);

  useEffect(() => {
    if (!fetching) loadingMoreRef.current = false;
  }, [fetching]);


  useEffect(() => {

    if (!hasNextPage || fetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (loadingMoreRef.current) return;
        if (!firstEntry?.isIntersecting) return;
        
        const endCursor = products?.pageInfo?.endCursor;
        if (!endCursor) return;
        if (lastRequestedCursorRef.current === endCursor) return;

        loadingMoreRef.current = true;
        lastRequestedCursorRef.current = endCursor;
        setCursor(endCursor);
      },

      { rootMargin: "0px 0px 400px 0px", threshold: 0 }

    );

  
  if (sentinelRef.current) {
    observer.observe(sentinelRef.current);
  }

  return () => observer.disconnect();

  }, [ hasNextPage, fetching, products?.pageInfo?.endCursor]);


  return (
    <div>

      {error && <p>Oh no... {error.message}</p>}

      {allEdges.length > 0 && (
        <section
          className="grid grid-cols-2 lg:grid-cols-4 w-3/4 gap-y-8 gap-x-3 py-5"
          style={{ overflowAnchor: "auto" }}
        >
          {allEdges.map(({ node }) => (
            <ProductCard key={node.id} product={node} />
          ))}
        </section>
      )}

      {!fetching && allEdges.length === 0 && !error && (
        <p>
          {`There is no Products with name `}
          <span className="font-bold">
            {(variables.search || []).slice(1, -1)}
          </span>
          {"."}
        </p>
      )}

{/*          <section 
            className="grid grid-cols-2 lg:grid-cols-4 w-3/4 gap-y-8 gap-x-3 py-5"
            style={{ overflowAnchor: "auto"}}
          >

            {products.edges.map(({ node }) => (
              <ProductCard key={node.id} product={node} />
            ))}
          </section>
        </>*/}

    {fetching && allEdges.length > 0 && (
      <div className="w-full h-24 flex items-center text-sm justify-center text-muted-foreground animate-pulse">
        \.../
      </div>
    )}


      {hasNextPage && (
        <div className="w-full h-10" ref={sentinelRef}
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



