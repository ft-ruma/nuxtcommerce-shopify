// app/gql/queries/getProduct.ts
import { gql } from 'graphql-request';
import { productCardFragment } from '~/gql/fragments/productCard';

export const getProductQuery = gql`
  query getProduct($id: ID, $handle: String, $country: CountryCode, $withInventory: Boolean = true) @inContext(country: $country) {
    product(id: $id, handle: $handle) {
      id
      handle
      title
      productType
      vendor
      descriptionHtml
      featuredImage {
        url(transform: { maxWidth: 1200 })
      }
      images(first: 20) {
        nodes {
          url(transform: { maxWidth: 1200 })
        }
      }
      options {
        name
        optionValues {
          name
        }
      }
      variants(first: 250) {
        nodes {
          id
          sku
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
            url(transform: { maxWidth: 1200 })
            thumb: url(transform: { maxWidth: 200 })
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
`;

export const getProductRecommendationsQuery = gql`
  query getProductRecommendations($productId: ID!, $country: CountryCode) @inContext(country: $country) {
    productRecommendations(productId: $productId) {
      ...ProductCard
    }
  }
  ${productCardFragment}
`;
