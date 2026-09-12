import { gql } from 'graphql-request';

const filterValues = gql`
  fragment FilterValues on Filter {
    id
    label
    type
    values {
      id
      label
      count
      input
    }
  }
`;

export const getCollectionFiltersQuery = gql`
  query getCollectionFilters($handle: String!, $filters: [ProductFilter!], $country: CountryCode) @inContext(country: $country) {
    collection(handle: $handle) {
      products(first: 1, filters: $filters) {
        filters {
          ...FilterValues
        }
      }
    }
  }
  ${filterValues}
`;

export const getSearchFiltersQuery = gql`
  query getSearchFilters($query: String!, $productFilters: [ProductFilter!], $country: CountryCode) @inContext(country: $country) {
    search(query: $query, first: 1, types: PRODUCT, productFilters: $productFilters) {
      productFilters {
        ...FilterValues
      }
    }
  }
  ${filterValues}
`;
