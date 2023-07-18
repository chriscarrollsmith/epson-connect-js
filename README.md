# Epson Connect JS

A JavaScript library for interacting with the Epson Connect API. This library provides a set of methods for authentication and various printer and scanner functionalities.

## Installation

Since this library is currently not available through npm, it can be installed locally from a cloned repository:

1. Clone the repository:
   
```bash
git clone https://github.com/chriscarrollsmith/epson-connect-js.git
```

2. Navigate into the project directory where you want to use this library and install it using npm's local path feature:

```bash
cd epson-connect-js
npm install epson-connect-js
```

In your JavaScript files, you can now `require` the library just like any other npm package:

```javascript
const { Client, Printer, Scanner } = require('epson-connect-js');
```

## Usage

This library provides a set of classes that correspond to the different aspects of the Epson Connect API. The `Client` class is the primary interface for interacting with the API, and it manages authentication and provides access to printer and scanner functionality. The `Printer` and `Scanner` classes provide methods for interacting with the printer and scanner functionalities of the API respectively. Please ensure you have a good understanding of the asynchronous nature of JavaScript to effectively use this library, as many operations rely on Promises and should be properly awaited or handled.

### Client

The `initialize()` method is responsible for initiating the authentication process, and it must be awaited, as it's an asynchronous operation.

```javascript
(async () => {
  // printerEmail, clientId, and clientSecret must be obtained from Epson
  // If no baseUrl is provided, the default will be 'https://api.epsonconnect.com'
  const client = new Client(printerEmail, clientId, clientSecret, baseUrl); 

  // Initiate the authentication process
  await client.initialize();

  // Now that we're authenticated, we can scan, print, and deauthenticate here
})();
```

Alternatively, to speed up execution, you can save the returned Promise directly with `.catch()` and await it later in your code. This is useful if you want to authenticate at application startup, but you don't need to use the printer or scanner until later. For example:

```javascript
// Construct the client as part of application startup
const client = new Client(printerEmail, clientId, clientSecret, baseUrl);

// Save the initialization promise for later use
const initializePromise = client.initialize().catch((error) => {
  console.error('Error initializing client:', error);
});

// Later in your code, you might have a function triggered by a user action
async function handlePrintRequest() {
  // Wait for the client to finish initializing before attempting to print
  await initializePromise;

  // Now that we're authenticated, we can scan, print, and deauthenticate here
}
```

Once you've constructed and initialized an object of the `Client` class, you can use its `printer` and `scanner` properties as getters that return instances of the `Printer` and `Scanner` classes, providing various methods to interact with the printing and scanning functionalities of the Epson Connect API.

For example:

```javascript
// Get the printer and scanner from the client
const printer = client.printer;
const scanner = client.scanner;

// Use printer or scanner to perform printing/scanning operations here
```

When the application is about to close or no longer needs the client, you can deauthenticate. The `deauthenticate()` method clears any active authentication sessions, and it also should be awaited or handled with `.catch()`, as it's also asynchronous. For example:

```javascript
// When the application is about to close or no longer needs the client, you can deauthenticate
client.deauthenticate().catch((error) => {
  console.error('Error deauthenticating client:', error);
});
```

### Printer

The `Printer` class offers a suite of methods that enable interactions with an Epson printer. It is typically accessed via the `printer` getter of a `Client` instance.

Before you can utilize the printer methods, make sure you have an initialized `Client` instance.

```javascript
(async () => {
  const client = new Client(printerEmail, clientId, clientSecret, baseUrl); 
  await client.initialize();
})();
```

Then, get the `Printer` instance:

```javascript
const printer = client.printer;
```

You can now interact with the printer. Here are some examples:

#### Handle a Complete Print Operation with a Single Method

The simplest way to execute a complete print operation, including setting up the print job, uploading the file, and executing the print job, is the `print(filePath, settings)` method:

```javascript
printer.print('/path/to/file.pdf', {})
  .then(jobId => console.log(`Print job ${jobId} started`))
  .catch(error => console.error(error));
```

#### Getting Printer Info

To get general information about the printer, use the `info()` method:

```javascript
printer.info()
  .then(info => console.log(info))
  .catch(error => console.error(error));
```

#### Retrieve Printer Capabilities

To retrieve the printer capabilities, use the `capabilities(mode)` method, where the `mode` argument is either 'document' or 'photo':

```javascript
printer.capabilities('document')
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

#### Setting Up Print Job

To set up a print job, you need to define a `settings` object which contains your printer settings. Each setting has default values that are automatically applied if not explicitly set. We also have validation in place to ensure your settings are correct and will be accepted by the printer. 

Here's how to set up a print job:

```javascript
// Define your settings
let settings = {
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

// Use the printer instance to set up a print job and capture the jobData object
let jobData;
printer.printSetting(settings)
  .then(response => {
    console.log(response);
    jobData = response.id; // Save the jobData for future use
  })
  .catch(error => console.error(error));

```

Note that calling printSetting before printing is mandatory, and that you must capture the `jobData` returned by the printSetting call for use in other functions. `jobData` is an object that contains `id` and `upload_uri` properties. The `id` property is a unique job ID, and the `upload_uri` property is the URI to which you will upload the file to be printed for this job.

The `settings` object can contain the following parameters:

- `job_name`: The name of the print job. If not set, a default name will be generated.
- `print_mode`: The print mode which can be either 'document' or 'photo'. Defaults to 'document'.
- `print_setting`: An object containing specific settings for the print job.

The `print_setting` object can contain:

- `media_size`: The size of the paper. Default is 'ms_a4'.
- `media_type`: The type of paper. Default is 'mt_plainpaper'.
- `borderless`: Whether or not the print should be borderless. Default is false.
- `print_quality`: The quality of the print. Can be 'high', 'normal', or 'draft'. Default is 'normal'.
- `source`: The paper source. Default is 'auto'.
- `color_mode`: The color mode. Can be 'color' or 'mono'. Default is 'color'.
- `two_sided`: The two-sided mode. Can be 'none', 'long', or 'short'. Default is 'none'.
- `reverse_order`: Whether or not to print in reverse order. Default is false.
- `copies`: The number of copies to print. Default is 1.
- `collate`: Whether or not to collate when printing multiple copies. Default is true. Must be true when using two-sided printing.

The validation process ensures that all settings are in acceptable formats and values. If the validation fails, a `PrintSettingError` will be thrown. Handle this error appropriately in your implementation.

#### Uploading File to Print

To upload a file to be printed, use the `uploadFile(uploadUri, filePath, printMode)` method, where printMode is 'document' or 'photo':

```javascript
printer.uploadFile(uploadUri = jobData.upload_uri, '/path/to/file.pdf', 'document')
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

#### Executing Print Job

To execute a print job, use the `executePrint(jobId)` method:

```javascript
printer.executePrint(jobData.id)
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

#### Getting Print Job Info

To get the information about a print job, use the `jobInfo(jobId)` method:

```javascript
printer.jobInfo(jobData.id)
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

#### Cancelling Print Job

To cancel a print job, use the `cancelPrint(jobId, operatedBy)` method:

```javascript
printer.cancelPrint(jobData.upload_uri, 'user')
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

#### Setting Up Notifications

To set up notifications for the printer events, use the `notification(callbackUri, enabled)` method:

```javascript
printer.notification(callbackUri, true)
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

Remember, each method returns a promise which should be properly handled to ensure error situations are adequately addressed. Use `then-catch` or `async-await` with a try-catch block to handle the promises.

In all methods, replace the parameters like `mode`, `settings`, `uploadUri`, `filePath`, `printMode`, `jobId`, `operatedBy`, and `callbackUri` with actual values based on your context.

### Scanner

The `Scanner` class provides methods for interacting with an Epson scanner:

```javascript
const scanner = new Scanner(authContext);
scanner.list();
scanner.add(name, destination, type);
scanner.update(id, name, destination, type);
scanner.remove(id);
```

## Error Handling

The library defines a set of custom error types (`ClientError`, `AuthenticationError`, `ApiError`, `PrinterError`, `PrintSettingError`, `ScannerError`) to provide detailed error information.

## Testing

You can run the test suite using the following command:

```bash
npm run test
```
