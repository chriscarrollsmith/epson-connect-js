// Client.ts

import { AuthContext } from './Authenticate';
import { Printer } from './Printer';
import { Scanner } from './Scanner';

export class Client {
  private authContext: AuthContext;

  constructor(printerEmail = '', clientId = '', clientSecret = '', baseUrl = 'https://api.epsonconnect.com') {
    printerEmail = printerEmail || process.env.EPSON_CONNECT_API_PRINTER_EMAIL || '';
    if (!printerEmail) {
      throw new ClientError('Printer Email can not be empty');
    }

    clientId = clientId || process.env.EPSON_CONNECT_API_CLIENT_ID || '';
    if (!clientId) {
      throw new ClientError('Client ID can not be empty');
    }

    clientSecret = clientSecret || process.env.EPSON_CONNECT_API_CLIENT_SECRET || '';
    if (!clientSecret) {
      throw new ClientError('Client Secret can not be empty');
    }

    this.authContext = new AuthContext(baseUrl, printerEmail, clientId, clientSecret);
  }

  async initialize(): Promise<void> {
    await this.authContext._initialize();
  }

  async deauthenticate(): Promise<void> {
    await this.authContext._deauthenticate();
  }

  get printer(): Printer {
    return new Printer(this.authContext);
  }

  get scanner(): Scanner {
    return new Scanner(this.authContext);
  }
}

export class ClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClientError';
  }
}
