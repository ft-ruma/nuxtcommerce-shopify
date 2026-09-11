// app/gql/queries/getCategories.ts
import { gql } from 'graphql-request';

// Shopify collections are used as categories.
export const getCategoriesQuery = gql`
  query getCategories($country: CountryCode) @inContext(country: $country) {
    collections(first: 100) {
      nodes {
        id
        handle
        title
        image {
          url(transform: { maxWidth: 900 })
        }
        products(first: 1, filters: [{ available: true }]) {
          nodes {
            id
          }
        }
      }
    }
  }
`;
