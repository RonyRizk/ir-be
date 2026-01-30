import axios from 'axios';
class Token {
  private baseUrl = 'https://gateway.igloorooms.com/IRBE';
  private static token: string | null = '';

  private static isInterceptorAdded = false;
  constructor() {
    axios.defaults.baseURL = this.baseUrl;
  }
  private initialize() {
    if (Token.isInterceptorAdded) {
      return;
    }

    axios.interceptors.request.use(config => {
      if (!Token.token) {
        throw new MissingTokenError();
      }
      const prevHeaders = config.headers || {};
      if (!prevHeaders.hasOwnProperty('Authorization') || !prevHeaders['Authorization']) {
        config.headers.Authorization = Token.token;
      }
      // config.params = config.params || {};
      // config.params.Ticket = Token.token;
      return config;
    });

    Token.isInterceptorAdded = true;
  }
  public getToken(): string {
    return Token.token;
  }
  public setToken(token: string) {
    if (token === Token.token) {
      return;
    }
    Token.token = token;

    this.initialize();
  }
}
export default Token;
export class MissingTokenError extends Error {
  constructor(message = 'Missing token!!') {
    super(message);
    this.name = 'MissingTokenError';
  }
}
