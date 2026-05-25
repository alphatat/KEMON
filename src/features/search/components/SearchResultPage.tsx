"use client";

import { gql } from "@/gql";
import { SearchQuery, SearchQueryVariables } from "@/gql/graphql";
import { useQuery } from "@urql/next";
import { ProductCard } from "@/features/products";
import { useEffect, useMemo, useRef, useState } from "react";

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

const PAGE_SIZE = 28;

const SearchResultPage = ({ variables }: { variables: SearchQueryVariables }) => {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allEdges, setAllEdges] = useState<ProductEdge[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);
  const lastRequestedCursorRef = useRef<string | null>(null);

  const queryVariables = useMemo<SearchQueryVariables>(
    () => ({
      ...variables,
      first: PAGE_SIZE,
      after: cursor,
    }),
    [variables, cursor],
  );

  const [result] = useQuery<SearchQuery, SearchQueryVariables>({
    query: ProductSearch,
    variables: queryVariables,
  });

  const { data, fetching, error } = result;
  const products = data?.productsCollection;

  const queryKey = useMemo(
    () =>
      JSON.stringify({
        search: variables.search ?? "",
        lower: variables.lower ?? "",
        upper: variables.upper ?? "",
        collections: variables.collections ?? [],
        orderBy: variables.orderBy ?? [],
      }),
    [
      variables.search,
      variables.lower,
      variables.upper,
      variables.collections,
      variables.orderBy,
    ],
  );

  useEffect(() => {
    setCursor(undefined);
    setAllEdges([]);
    setHasNextPage(true);
    loadingMoreRef.current = false;
    lastRequestedCursorRef.current = null;
  }, [queryKey]);

  useEffect(() => {
    if (!products) return;

    setAllEdges((prev) => {
      const seen = new Set(prev.map((e) => e.node.id));
      const incoming = products.edges ?? [];
      const dedupedIncoming = incoming.filter(
        (e) => e?.node?.id && !seen.has(e.node.id),
      );
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
        if (!firstEntry?.isIntersecting) return;
        if (loadingMoreRef.current) return;

        const endCursor = products?.pageInfo?.endCursor;
        if (!endCursor || typeof endCursor !== "string") return;
        if (lastRequestedCursorRef.current === endCursor) return;

        loadingMoreRef.current = true;
        lastRequestedCursorRef.current = endCursor;
        setCursor(endCursor);
      },
      { rootMargin: "0px 0px 150px 0px", threshold: 0 },
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, fetching, products?.pageInfo?.endCursor]);

  return (
    <div>
      {error && <p>Oh no... {error.message}</p>}

      {allEdges.length > 0 && (
        <section
          className="grid grid-cols-2 lg:grid-cols-4 w-3/4 gap-y-8 gap-x-3 py-5"
          style={{ overflowAnchor: "auto" }}
        >
          {allEdges.map((edge) => {
            if (!edge?.node) return null;
            return <ProductCard key={edge.node.id} product={edge.node} />;
          })}
          {hasNextPage && <div ref={sentinelRef} className="col-span-full h-px" />}
        </section>
      )}

      {!fetching && allEdges.length === 0 && !error && (
        <p>
          {`There is no Products with name `}
          <span className="font-bold">{(variables.search || "").slice(1, -1)}</span>
          {"."}
        </p>
      )}

      <div className="w-full h-8 flex justify-center items-center">
        {fetching && allEdges.length > 0 ? (
          <p className="text-sm text-muted-foreground">Loading more...</p>
        ) : null}
      </div>
    </div>
  );
};

export default SearchResultPage;
