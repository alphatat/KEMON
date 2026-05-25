"use client";

import { OrderByDirection, SearchQueryVariables } from "@/gql/graphql";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import SearchResultPage from "./SearchResultPage";

interface SearchProductsInifiteScrollProps {
  collectionId?: string;
}

function SearchProductsInifiteScroll({
  collectionId,
}: SearchProductsInifiteScrollProps) {

  const searchParmas = useSearchParams();

  const varaibles = useMemo(
    () => searchParamsVariablesFactory(searchParmas, collectionId),
    [searchParmas, collectionId]
  );

  // const [pageVariables, setPageVariables] = useState([varaibles]);

  // useEffect(() => {
  //   setPageVariables([
  //     searchParamsVariablesFactory(searchParmas, collectionId),
  //   ]);
  // }, [searchParmas]);

  // const loadMoreHandler = (after: string) => {
  //   setPageVariables([...pageVariables, { ...varaibles, after, first: 4 }]);
  // };

  // const loadMoreHandler = (after: string) => {
  //   setPageVariables((prev) => {
  //     if (prev.some((v) => v.after === after)) return prev;
  //     return [...prev, { ...varaibles, after, first: 28 }];
  //   });
  // };

//overflow-anchor:none
  return (
    <section style={{ overflowAnchor: "none" }}>
{/*      {pageVariables.map((variable, i) => (
        <SearchResultPage
        //  key={"" + variable.after}
          key={`seach-page${i}`}
          variables={variable}
          isLastPage={i === pageVariables.length - 1}
          onLoadMore={loadMoreHandler}
        />
      ))}*/}
      <SearchResultPage variables={varaibles} />
    </section>
  );
}

export default SearchProductsInifiteScroll;

const searchParamsVariablesFactory = (
  searchParams: ReadonlyURLSearchParams,
  collectionId?: string,
) => {
  const priceRange = searchParams.get("price_range");
  const range = priceRange ? priceRange.split("-") : undefined;

  const collectionParam = searchParams.get("collections")
  const collections =
  collectionParam && collectionParam !== "undefined"
    ? (JSON.parse(searchParams.get("collections")) as string[])
    : [];

  const sort = searchParams.get("sort") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  let orderBy: SearchQueryVariables["orderBy"] = undefined;

  switch (sort) {
    case "BEST_MATCH":
      orderBy = [
        { featured: OrderByDirection["DescNullsFirst"] },
        { created_at: OrderByDirection["DescNullsLast"] },
      ];
      break;
    case "PRICE_LOW_TO_HIGH":
      orderBy = [{ price: OrderByDirection["AscNullsLast"] }];
      break;
    case "PRICE_HIGH_TO_LOW":
      orderBy = [{ price: OrderByDirection["DescNullsLast"] }];
      break;
    case "NEWEST":
      orderBy = [{ created_at: OrderByDirection["DescNullsLast"] }];
      break;
    case "NAME_ASCE":
      orderBy = [{ name: OrderByDirection["AscNullsLast"] }];

      break;
    default:
      orderBy = undefined;
  }

//  console.log("collections", collections);

  const varaibles: SearchQueryVariables = {
    search: search ? `%${search.trim()}%` : "%%",
    lower: range && range[0] ? `${range[0]}` : undefined,
    upper: range && range[1] ? `${range[1]}` : undefined,
    collections: collectionId
      ? [collectionId]
      : collections && collections.length > 0
        ? collections
        : undefined,
    orderBy,
    first: 28,
    after: undefined,
  };
  return varaibles;
};
