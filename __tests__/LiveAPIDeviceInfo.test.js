require('dotenv').config();
const { Client } = require('epson-connect-js');

// Create variables to hold the client and printer
let client;
let printer;

// Create a client and printer to be used in all tests
beforeAll(async () => {
    try {
        client = new Client();
        await client.initialize();

        // Get the printer
        printer = client.printer;
    } catch (error) {
        console.error("Error creating client: ", error);
        throw error;
    }
});

afterAll(async () => {
    try {
        // After initialization, deauthenticate
        await client.deauthenticate();
    } catch (error) {
        console.error("Error during client deauthentication: ", error);
        throw error;  // if an error is caught, fail the test by throwing the error
    }
  });

test('Get Printer Capabilities', async () => {
    try {
        // Get the printer capabilities
        const response = await printer.capabilities('document');
        expect(response).toBeTruthy();
    } catch (error) {
        console.error("Error getting printer capabilities: ", error);
        throw error;  // if an error is caught, fail the test by throwing the error
    }
});

test('Get Printer Info', async () => {
    try {
        // Get the printer status
        const response = await printer.info();
        expect(response).toBeTruthy();
    } catch (error) {
        console.error("Error getting printer status: ", error);
        throw error;  // if an error is caught, fail the test by throwing the error
    }
});
