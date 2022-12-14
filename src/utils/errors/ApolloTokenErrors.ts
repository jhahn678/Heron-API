import { ApolloError } from 'apollo-server-errors';

export class TokenExpiredError extends ApolloError {
  constructor(message: string = 'Access token expired') {
    super(message, 'ACCESS_TOKEN_EXPIRED');
    Object.defineProperty(this, 'name', { value: 'TokenExpiredError' });
  }
}

export class TokenInvalidError extends ApolloError {
  constructor(message: string = 'Access token invalid') {
    super(message, 'ACCESS_TOKEN_INVALID');
    Object.defineProperty(this, 'name', { value: 'TokenInvalidError' });
  }
}
