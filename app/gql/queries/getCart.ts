// app/gql/queries/getCart.ts
import { gql } from 'graphql-request';

// A cart returns null once its checkout has been completed.
export const getCartQuery = gql`
  query getCart($id: ID!) {
    cart(id: $id) {
      id
    }
  }
`;
