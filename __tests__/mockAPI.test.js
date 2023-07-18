// mockAPI.test.js

// Import axios and axios-mock-adapter for mocking axios requests
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

// Import the Client class from Client.js
const { Client } = require('../Client.js');

// This sets the mock adapter on the default instance
var mock = new MockAdapter(axios);

// Here we define a successful response mock
const mockResponse = {
  token_type: 'Bearer',
  access_token: 'testaccesstoken',
  expires_in: 3600,
  refresh_token: 'testrefreshtoken',
  subject_type: '',
  subject_id: 'testsubjectid'
};

// Reset the mock between tests
afterEach(() => {
  mock.reset();
});

mock.onAny().reply(config => {
  console.log(config.url);
  return [404];
});

test('Client Initialization and Authentication', async () => {
  try {
    // Use a regex to match any request URL
    mock.onPost(/.*/).reply((config) => {
      // Verify the URL
      expect(config.url).toBe('https://api.epsonconnect.com/api/1/printing/oauth2/auth/token?subject=printer');
      // Verify the auth property
      expect(config.auth).toEqual({ username: 'testid', password: 'testsecret' });
      // Verify the body data (note that axios transforms the body data to a string)
      expect(config.data).toBe('grant_type=password&username=testemail&password=');
      // Respond with the mock response
      return [200, mockResponse];
    });

    const client = new Client(baseUrl = '', printerEmail = 'testemail', clientId = 'testid', clientSecret = 'testsecret');
    await client.initialize();

    // Assert that these values are not empty or null
    expect(client.authContext.accessToken).toBeTruthy();
    expect(client.authContext.refreshToken).toBeTruthy();
    expect(client.authContext.expiresAt).toBeTruthy();
    expect(client.authContext.subjectId).toBeTruthy();

  } catch (error) {
    console.error("Error creating client: ", error);
    throw error;  // if an error is caught, fail the test by throwing the error
  }
});
