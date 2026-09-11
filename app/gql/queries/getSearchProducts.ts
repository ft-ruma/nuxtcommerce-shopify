// app/gql/queries/getSearchProducts.ts
import { gql } from 'graphql-request';
import { productCardFragment } from '~/gql/fragments/productCard';

export const getSearchProductsQuery = gql`
  query getSearchProducts($query: String, $sortKey: ProductSortKeys!, $reverse: Boolean!, $country: CountryCode) @inContext(country: $country) {
    products(first: 6, query: $query, sortKey: $sortKey, reverse: $reverse) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${productCardFragment}
`;
