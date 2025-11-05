// Authenticate.ts

import axios, { AxiosRequestConfig } from 'axios';
import moment, { Moment } from 'moment';

interface AuthResponse {
  token_type?: string;
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  subject_type?: string;
  subject_id: string;
  error?: string;
}

interface AuthRequestData {
  grant_type: string;
  username?: string;
  password?: string;
  refresh_token?: string;
}

export class AuthContext {
  private baseUrl: string;
  private printerEmail: string;
  private clientId: string;
  private clientSecret: string;
  private expiresAt: Moment;
  private accessToken: string;
  private refreshToken: string;
  private subjectId: string;

  constructor(baseUrl: string, printerEmail: string, clientId: string, clientSecret: string) {
    this.baseUrl = baseUrl;
    this.printerEmail = printerEmail;
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    this.expiresAt = moment();
    this.accessToken = '';
    this.refreshToken = '';
    this.subjectId = '';
  }

  async _initialize(): Promise<void> {
    await this._auth();
  }

  async _auth(): Promise<void> {
    const method = 'POST';
    const path = '/api/1/printing/oauth2/auth/token?subject=printer';

    if (this.expiresAt.isAfter(moment())) {
      return;
    }

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    const auth = {
      username: this.clientId,
      password: this.clientSecret
    };

    let data: AuthRequestData;

    if (this.accessToken === '') {
      data = {
        grant_type: 'password',
        username: this.printerEmail,
        password: '',
      };
    } else {
      data = {
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
      };
    }

    try {
      const body = await this.send(method, path, data, headers, auth) as AuthResponse;

      const error = body.error;

      if (error) {
        throw new AuthenticationError(error);
      }

      // First time authenticating, set refresh_token
      if (this.accessToken === '' && body.refresh_token) {
        this.refreshToken = body.refresh_token;
      }

      this.expiresAt = moment().add(body.expires_in, 'seconds');
      this.accessToken = body.access_token;
      this.subjectId = body.subject_id;

    } catch (e) {
      throw new AuthenticationError(String(e));
    }
  }

  async _deauthenticate(): Promise<void> {
    const method = 'DELETE';
    const path = `/api/1/printing/printers/${this.subjectId}`;
    await this.send(method, path);
  }

  async send(
    method: string,
    path: string,
    data: any = null,
    headers: Record<string, string> | null = null,
    auth: { username: string; password: string } | null = null
  ): Promise<any> {
    if (!auth) {
      this._auth();
    }

    headers = headers || this.defaultHeaders;
    const request: AxiosRequestConfig = {
      method: method as any,
      url: this.baseUrl + path,
      headers: headers,
      data: data,
      auth: auth || undefined,
    };

    // Uncomment to debug requests
    // console.log(`${method} ${path} data=${JSON.stringify(data)} headers=${JSON.stringify(headers)} auth=${!!auth}`);

    try {
      const resp = await axios(request);
      let respData = resp.data;

      // Handle if response is not JSON
      if (resp.headers && resp.headers['content-type'] && resp.headers['content-type'].indexOf('application/json') === -1) {
        respData = { code: resp.data.toString() };
      }

      // Uncomment to debug requests
      // console.log(`resp=${JSON.stringify(respData)}`);

      if (!resp) {
        throw new ApiError('No response received from server');
      }

      if (respData && respData.code) {
        throw new ApiError(respData.code);
      }

      if (!respData || Object.keys(respData).length === 0) {
        return { message: 'Request was successful, but no data was returned.' };
      }

      return respData;

    } catch (error) {
      // Re-throw the error to be handled in higher scopes
      throw error;
    }
  }

  get defaultHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  get deviceId(): string {
    return this.subjectId;
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}
