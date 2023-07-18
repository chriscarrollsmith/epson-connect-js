require('dotenv').config();
const { Client } = require('../Client.js');

// Set the timeout for each test to 30 seconds
jest.setTimeout(30000);

// Create variables to hold the client, printer, scanner, and jobData
let client;
let printer;
let scanner;

// Define default printer settings
let settings = {
    job_name: "MyFirstPrintJob",
    print_mode: "document",
    print_setting: {
        media_size: "ms_a4",
        media_type: "mt_plainpaper",
        color_mode: "mono",
        two_sided: "none"
    }
};

// Create a client, printer, and scanner, to be used in all tests
beforeAll(async () => {
    try {
        client = new Client();
        await client.initialize();

        // Get the printer and scanner
        printer = client.printer;
        scanner = client.scanner;
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

test('Define Print Job Settings', async () => {
    try {
        // Use the printer instance to set up a print job and capture the jobData object
        constjobData = await printer.printSetting(settings);
        expect(jobData.id).toBeTruthy();
        expect(jobData.upload_uri).toBeTruthy();
    } catch (error) {
        console.error("Error defining print job settings: ", error);
        throw error;  // if an error is caught, fail the test by throwing the error
    }
});

test('Upload File for Print Job', async () => {
    try {
        // Set print job settings
        const jobData = await printer.printSetting(settings);
        
        // Use the printer instance to upload a file for printing
        const response = await printer.uploadFile(uploadUri = jobData.upload_uri, './testpage.docx', 'document')
        expect(response).toBeTruthy();
    } catch (error) {
        console.error("Error uploading file: ", error);
        throw error;  // if an error is caught, fail the test by throwing the error
    }
});