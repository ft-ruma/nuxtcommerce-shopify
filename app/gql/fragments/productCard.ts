// app/gql/fragments/productCard.ts
import { gql } from 'graphql-request';

// Fields needed to render a product card (grid, search dropdown, related products).
export const productCardFragment = gql`
  fragment ProductCard on Product {
    id
    handle
    title
    productType
    vendor
    availableForSale
    options {
      name
      optionValues {
        name
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      url(transform: { maxWidth: 600 })
    }
    images(first: 2) {
      nodes {
        url(transform: { maxWidth: 600 })
      }
    }
    selectedOrFirstAvailableVariant {
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
    }
  }
`;
