require('dotenv').config();
const { Client } = require('../Client.js');

// Set the timeout for each test to 30 seconds
jest.setTimeout(30000);

// Create variables to hold the client, printer, and scanner
let client;
let printer;
let scanner;

// Define default printer settings
let defaultSettings = {
    job_name: "MyFirstPrintJob",
    print_mode: "document",
    print_setting: {
        media_size: "ms_a4",
        media_type: "mt_plainpaper",
        borderless: false,
        print_quality: "normal",
        source: "auto",
        color_mode: "color",
        two_sided: "none",
        reverse_order: false,
        copies: 1,
        collate: true
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

test('Client Authentication', () => {
    // Assert that client auth values are not empty or null
    expect(client.authContext.accessToken).toBeTruthy();
    expect(client.authContext.refreshToken).toBeTruthy();
    expect(client.authContext.expiresAt).toBeTruthy();
    expect(client.authContext.subjectId).toBeTruthy();
});

test('Get Printer Capabilities', async () => {
    try {
        // Get the printer capabilities
        const response = await printer.capabilities('document');
        console.log(response);
        expect(response).toBeTruthy();
    } catch (error) {
        console.error("Error getting printer capabilities: ", error);
        throw error;  // if an error is caught, fail the test by throwing the error
    }
});

test('Define Partial Print Job Settings', async () => {
    try {
        // Define your partial settings
        let partialsettings = {
            job_name: "MyFirstPrintJob",
            print_setting: {
                two_sided: "long",
            }
        };

        // Use the printer instance to set up a print job and capture the jobData object
        const response = await printer.printSetting(partialsettings);
        console.log(response);
        expect(response.id).toBeTruthy();
        expect(response.upload_uri).toBeTruthy();
    } catch (error) {
        console.error("Error defining print job settings: ", error);
        throw error;  // if an error is caught, fail the test by throwing the error
    }
});

test('Upload File for Print Job', async () => {
    try {
        // Set print job settings
        const jobData = await printer.printSetting(defaultSettings);
        
        // Use the printer instance to upload a file for printing
        const response = await printer.uploadFile(uploadUri = jobData.upload_uri, './testpage.docx', 'document')
        console.log(response)
        expect(response).toBeTruthy();
    } catch (error) {
        console.error("Error uploading file: ", error);
        throw error;  // if an error is caught, fail the test by throwing the error
    }
});

test('Get Job Info', async () => {
    try {
        // Set print job settings
        const jobData = await printer.printSetting(defaultSettings);
        console.log(jobData)

        // Upload file for printing
        await printer.uploadFile(uploadUri = jobData.upload_uri, './testpage.docx', 'document')
        
        // Use the printer instance to execute a print job
        const response = await printer.jobInfo(jobId = jobData.id)
        console.log(response)
        expect(response).toBeTruthy();
    } catch (error) {
        console.error("Error executing print job: ", error);
        throw error;  // if an error is caught, fail the test by throwing the error
    }
});

test('Execute Print Job', async () => {
    try {
        // Set print job settings
        const jobData = await printer.printSetting(defaultSettings);
        console.log(jobData)
        
        // Upload file for printing
        await printer.uploadFile(uploadUri = jobData.upload_uri, './testpage.docx', 'document')
        
        // Use the printer instance to execute a print job
        const response = await printer.executePrint(jobId = jobData.id)
        console.log(response)
        expect(response).toBeTruthy();
    } catch (error) {
        console.error("Error executing print job: ", error);
        throw error;  // if an error is caught, fail the test by throwing the error
    }
});

test('Client Deauthentication', async () => {
    try {
        // After initialization, deauthenticate
        await client.deauthenticate();

        // If the deauthentication process has no issues, no errors should be thrown
        // So, the test will pass if no errors are thrown till this point
    } catch (error) {
        console.error("Error during client deauthentication: ", error);
        throw error;  // if an error is caught, fail the test by throwing the error
    }
});
