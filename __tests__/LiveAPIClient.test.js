require('dotenv').config();
const { Client } = require('../Client.js');

// Create variables to hold the client, printer, and scanner
let client;

// Create a client to be used in all tests
beforeAll(async () => {
    try {
        client = new Client();
        await client.initialize();
    } catch (error) {
        console.error("Error creating client: ", error);
        throw error;
    }
});

test('Client Authentication', () => {
    // Assert that client auth values are not empty or null
    expect(client.authContext.accessToken).toBeTruthy();
    expect(client.authContext.refreshToken).toBeTruthy();
    expect(client.authContext.expiresAt).toBeTruthy();
    expect(client.authContext.subjectId).toBeTruthy();
});

test('Client Deauthentication', async () => {
    try {
        // After initialization, deauthenticate
        await client.deauthenticate();
    } catch (error) {
        console.error("Error during client deauthentication: ", error);
        throw error;  // if an error is caught, fail the test by throwing the error
    }
});
