// Client.js

const { AuthContext } = require('./Authenticate.js');
const { Printer } = require('./Printer.js');
const { Scanner } = require('./Scanner.js');

class Client {
  constructor(printerEmail = '', clientId = '', clientSecret = '', baseUrl = 'https://api.epsonconnect.com') {
    printerEmail = printerEmail || process.env.EPSON_CONNECT_API_PRINTER_EMAIL;
    if (!printerEmail) {
      throw new ClientError('Printer Email can not be empty');
    }

    clientId = clientId || process.env.EPSON_CONNECT_API_CLIENT_ID;
    if (!clientId) {
      throw new ClientError('Client ID can not be empty');
    }

    clientSecret = clientSecret || process.env.EPSON_CONNECT_API_CLIENT_SECRET;
    if (!clientSecret) {
      throw new ClientError('Client Secret can not be empty');
    }

    this.authContext = new AuthContext(baseUrl, printerEmail, clientId, clientSecret);
  }

  async initialize() {
    await this.authContext._initialize();
  }

  async deauthenticate() {
    await this.authContext._deauthenticate();
  }

  get printer() {
    return new Printer(this.authContext);
  }

  get scanner() {
    return new Scanner(this.authContext);
  }
}

class ClientError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ClientError';
  }
}

module.exports = { Client, ClientError };
