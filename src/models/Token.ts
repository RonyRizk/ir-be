export class Token {
  private token: string | null;

  public getToken() {
    return this.token;
  }
  public setToken(token: string) {
    this.token = token;
  }
}
export class MissingTokenError extends Error {
  constructor(message = 'Missing token!!') {
    super(message);
    this.name = 'MissingTokenError';
  }
}
