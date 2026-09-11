// app/gql/mutations/checkout.ts
import { gql } from 'graphql-request';

// Creates a Shopify cart with the buyer's details prefilled and returns the hosted checkout URL.
export const checkoutMutation = gql`
  mutation Checkout($input: CartInput!, $country: CountryCode, $language: LanguageCode) @inContext(country: $country, language: $language) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;
