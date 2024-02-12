require('dotenv').config();
const { Client } = require('epson-connect-js');

// Set the timeout for each test to 30 seconds
jest.setTimeout(30000);

// Create variables to hold the client, printer, scanner, and jobData
let client;
let printer;

// Define default printer settings
let settings = {};

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

test('Execute Print Job and Get Job Info', async () => {
    try {
        // Set print job settings
        const jobData = await printer.printSetting(settings);
        
        // Upload file for printing
        await printer.uploadFile(uploadUri = jobData.upload_uri, './testpage.docx', 'document')
        
        // Use the printer instance to execute a print job
        const response = await printer.executePrint(jobId = jobData.id)
        expect(response).toBeTruthy();

        // Use the printer instance to get job info
        const inforesponse = await printer.jobInfo(jobId = jobData.id)
        expect(inforesponse).toBeTruthy();
    } catch (error) {
        console.error("Error executing print job: ", error);
        throw error;  // if an error is caught, fail the test by throwing the error
    }
});

test('Execute Complete Print Job', async () => {
    try {
        const response = await printer.print('./testpage.docx', settings)
        expect(response).toBeTruthy();
    } catch (error) {
        console.error("Error executing print job: ", error);
        throw error;  // if an error is caught, fail the test by throwing the error
    }
});