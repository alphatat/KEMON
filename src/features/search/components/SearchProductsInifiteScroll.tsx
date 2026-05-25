"use client";

import { OrderByDirection, SearchQueryVariables } from "@/gql/graphql";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import SearchResultPage from "./SearchResultPage";

interface SearchProductsInifiteScrollProps {
  collectionId?: string;
}

function SearchProductsInifiteScroll({
  collectionId,
}: SearchProductsInifiteScrollProps) {
  const searchParmas = useSearchParams();

  const variables = useMemo(
    () => searchParamsVariablesFactory(searchParmas, collectionId),
    [searchParmas, collectionId],
  );

  return (
    <section>
      <SearchResultPage variables={variables} />
    </section>
  );
}

export default SearchProductsInifiteScroll;

const searchParamsVariablesFactory = (
  searchParams: ReadonlyURLSearchParams,
  collectionId?: string,
): SearchQueryVariables => {
  const priceRange = searchParams.get("price_range");
  const range = priceRange ? priceRange.split("-") : undefined;

  let collections: string[] = [];
  const rawCollections = searchParams.get("collections");
  if (rawCollections) {
    try {
      const parsed = JSON.parse(rawCollections);
      if (Array.isArray(parsed)) collections = parsed;
    } catch {
      collections = [];
    }
  }

  const sort = searchParams.get("sort") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  let orderBy: SearchQueryVariables["orderBy"] = undefined;

  switch (sort) {
    case "BEST_MATCH":
      orderBy = [
        { featured: OrderByDirection.DescNullsFirst },
        { created_at: OrderByDirection.DescNullsLast },
      ];
      break;
    case "PRICE_LOW_TO_HIGH":
      orderBy = [{ price: OrderByDirection.AscNullsLast }];
      break;
    case "PRICE_HIGH_TO_LOW":
      orderBy = [{ price: OrderByDirection.DescNullsLast }];
      break;
    case "NEWEST":
      orderBy = [{ created_at: OrderByDirection.DescNullsLast }];
      break;
    case "NAME_ASCE":
      orderBy = [{ name: OrderByDirection.AscNullsLast }];
      break;
    default:
      orderBy = undefined;
  }

  return {
    search: search ? `%${search.trim()}%` : "%%",
    lower: range?.[0] ? `${range[0]}` : undefined,
    upper: range?.[1] ? `${range[1]}` : undefined,
    collections: collectionId
      ? [collectionId]
      : collections.length > 0
        ? collections
        : undefined,
    orderBy,
    first: 28,
    after: undefined,
  };
};
