// app/gql/queries/getVariant.ts
import { gql } from 'graphql-request';

// Used when adding to cart: validates stock and returns the data the cart UI shows.
export const getVariantQuery = gql`
  query getVariant($id: ID!, $country: CountryCode, $withInventory: Boolean = true) @inContext(country: $country) {
    node(id: $id) {
      ... on ProductVariant {
        id
        sku
        title
        availableForSale
        currentlyNotInStock
        quantityAvailable @include(if: $withInventory)
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        image {
          url(transform: { maxWidth: 400 })
        }
        selectedOptions {
          name
          value
        }
        product {
          id
          handle
          title
          featuredImage {
            url(transform: { maxWidth: 400 })
          }
        }
      }
    }
  }
`;
