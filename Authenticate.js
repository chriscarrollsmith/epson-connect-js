// Authenticate.js

const axios = require('axios');
const moment = require('moment');
const { extractKeyValuePairs } = require('./Utils.js');

class AuthContext {
  constructor(baseUrl, printerEmail, clientId, clientSecret) {
    this.baseUrl = baseUrl;
    this.printerEmail = printerEmail;
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    this.expiresAt = moment();
    this.accessToken = '';
    this.refreshToken = '';
    this.subjectId = '';
  }

  async _initialize() {
    await this._auth();
  }

  async _auth() {
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

    let data;

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
      const body = await this.send(method, path, data, headers, auth);

      const error = body.error;

      if (error) {
        throw new AuthenticationError(error);
      }

      // First time authenticating, set refresh_token
      if (this.accessToken === '') {
        this.refreshToken = body.refresh_token;
      }

      this.expiresAt = moment().add(body.expires_in, 'seconds');
      this.accessToken = body.access_token;
      this.subjectId = body.subject_id;

    } catch (e) {
      throw new AuthenticationError(e);
    }
  }

  async _deauthenticate() {
    const method = 'DELETE';
    const path = `/api/1/printing/printers/${this.subjectId}`;
    await this.send(method, path);
  }

  async send(method, path, data = null, headers = null, auth = null) {
    if (!auth) {
      this._auth();
    }
  
    headers = headers || this.defaultHeaders;
    const request = {
      method: method,
      url: this.baseUrl + path,
      headers: headers,
      data: data,
      auth: auth,
    };
  
    console.log(`${method} ${path} data=${JSON.stringify(data)} headers=${JSON.stringify(headers)} auth=${!!auth}`);
  
    try {
      const resp = await axios(request);
      let respData = resp.data;
  
      // Handle if response is not JSON
      if (resp.headers && resp.headers['content-type'] && resp.headers['content-type'].indexOf('application/json') === -1) {
        respData = { code: resp.data.toString() };
      }
  
      console.log(`resp=${JSON.stringify(respData)}`);
  
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

  get defaultHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  get deviceId() {
    return this.subjectId;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthenticationError";
  }
}

class ApiError extends Error {
  constructor(message) {
    super(message);
    this.name = "ApiError";
  }
}

module.exports = { AuthContext, AuthenticationError, ApiError };
