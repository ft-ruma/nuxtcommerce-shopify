// app/gql/queries/getProducts.ts
import { gql } from 'graphql-request';
import { productCardFragment } from '~/gql/fragments/productCard';

export const getProductsQuery = gql`
  query getProducts($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys!, $reverse: Boolean!, $country: CountryCode) @inContext(country: $country) {
    products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${productCardFragment}
`;

export const getCollectionProductsQuery = gql`
  query getCollectionProducts(
    $handle: String!
    $first: Int!
    $after: String
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean!
    $country: CountryCode
  ) @inContext(country: $country) {
    collection(handle: $handle) {
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, filters: [{ available: true }]) {
        nodes {
          ...ProductCard
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
  ${productCardFragment}
`;
