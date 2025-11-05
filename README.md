# Epson Connect JS

A TypeScript/JavaScript library for interacting with the Epson Connect API. This library provides a set of methods for authentication and various printer and scanner functionalities, with full TypeScript type definitions.

## Installation

### From npm

To install using the `npm` package manager, use:

```bash
npm install epson-connect-js
```

### From the Github repo

To install from Github, use:

```bash
npm install https://github.com/chriscarrollsmith/epson-connect-js.git#main
```

Here's what it will look like as a dependency in `package.json`:

```json
{
  "dependencies": {
    "epson-connect-js": "github:chriscarrollsmith/epson-connect-js#main",
  }
}
```

## Quick Start

Here are complete examples to get you started quickly:

### JavaScript Example

```javascript
const { Client } = require('epson-connect-js');

async function main() {
  // Create and initialize the client
  const client = new Client(
    'printer@example.com',  // Your printer email
    'your-client-id',        // Your client ID
    'your-client-secret'     // Your client secret
  );

  await client.initialize();

  // Print a document
  const printer = client.printer;
  const jobId = await printer.print('./document.pdf', {
    print_mode: 'document',
    print_setting: {
      media_size: 'ms_a4',
      print_quality: 'normal',
      copies: 1
    }
  });

  console.log('Print job started:', jobId);

  // Clean up
  await client.deauthenticate();
}

main().catch(console.error);
```

### TypeScript Example

```typescript
import { Client, PrintSettings } from 'epson-connect-js';

async function main(): Promise<void> {
  // Create and initialize the client
  const client = new Client(
    'printer@example.com',  // Your printer email
    'your-client-id',        // Your client ID
    'your-client-secret'     // Your client secret
  );

  await client.initialize();

  // Print a document with type-safe settings
  const printer = client.printer;
  const settings: PrintSettings = {
    print_mode: 'document',
    print_setting: {
      media_size: 'ms_a4',
      print_quality: 'normal',
      copies: 1
    }
  };

  const jobId: string = await printer.print('./document.pdf', settings);
  console.log('Print job started:', jobId);

  // Clean up
  await client.deauthenticate();
}

main().catch(console.error);
```

## Language Support

This library is written in TypeScript and compiled to JavaScript, making it fully compatible with both:

### JavaScript Users
- Works with CommonJS (`require`) and ES Modules (`import`)
- No additional setup required - install and use immediately
- Compatible with Node.js projects

### TypeScript Users
- Full type definitions included out of the box
- No need for separate `@types` packages
- **Type safety**: Catch errors at compile time instead of runtime
- **IntelliSense**: Auto-completion and inline documentation in your IDE
- **Type inference**: Automatic type detection for better code navigation

All exported types, interfaces, and enums are available for import:

```typescript
import {
  Client,
  Printer,
  Scanner,
  PrintSettings,
  PrintSetting,
  PrintMode,
  MediaSize,
  MediaType,
  PrintQuality,
  PaperSource,
  ColorMode,
  TwoSided,
  ClientError,
  PrinterError,
  ScannerError,
  AuthenticationError,
  ApiError,
} from 'epson-connect-js';
```

## Usage

This library provides a set of classes that correspond to the different aspects of the Epson Connect API. The `Client` class is the primary interface for interacting with the API, and it manages authentication and provides access to printer and scanner functionality. The `Printer` and `Scanner` classes provide methods for interacting with the printer and scanner functionalities of the API respectively. Please ensure you have a good understanding of the asynchronous nature of JavaScript to effectively use this library, as many operations rely on Promises and should be properly awaited or handled.

### Client

#### Importing the Client

**JavaScript (CommonJS):**
```javascript
const { Client } = require('epson-connect-js');
```

**TypeScript or ES Modules:**
```typescript
import { Client } from 'epson-connect-js';
```

#### Creating a Client Instance

You will need to construct an object of the `Client` class with the arguments `printerEmail`, `clientId`, `clientSecret`. Alternatively, you can set the environment variables `EPSON_CONNECT_API_PRINTER_EMAIL`,`EPSON_CONNECT_API_CLIENT_ID`, and `EPSON_CONNECT_API_CLIENT_SECRET`. Note that you will have to register for a license with the [Epson Connect API](https://www.epsondevelopers.com/api/epson-connect/) in order to obtain these credentials. (The `baseUrl` argument of the `Client` class is optional, and if not provided, the default value of `https://api.epsonconnect.com` will be used.)

**JavaScript:**
```javascript
// printerEmail, clientId, and clientSecret must be obtained from Epson
const printerEmail = 'printerid@someemail.com';
const clientId = 'someclientid';
const clientSecret = 'someclientsecret';
const baseUrl = 'https://api.epsonconnect.com';

// If no baseUrl is provided, the default will be 'https://api.epsonconnect.com'
const client = new Client(printerEmail, clientId, clientSecret, baseUrl);
```

**TypeScript:**
```typescript
// printerEmail, clientId, and clientSecret must be obtained from Epson
const printerEmail: string = 'printerid@someemail.com';
const clientId: string = 'someclientid';
const clientSecret: string = 'someclientsecret';
const baseUrl: string = 'https://api.epsonconnect.com';

// If no baseUrl is provided, the default will be 'https://api.epsonconnect.com'
const client = new Client(printerEmail, clientId, clientSecret, baseUrl);
```

#### Initializing the Client

The `initialize()` method of the `Client` class is responsible for initiating the authentication process, and it must be awaited, as it's an asynchronous operation.

**JavaScript:**
```javascript
(async () => {
  // Initiate the authentication process
  await client.initialize();

  // Now that we're authenticated, we can scan, print, and deauthenticate here
})();
```

**TypeScript:**
```typescript
(async (): Promise<void> => {
  // Initiate the authentication process
  await client.initialize();

  // Now that we're authenticated, we can scan, print, and deauthenticate here
})();
```

Alternatively, to speed up execution, you can save the returned Promise directly with `.catch()` and await it later in your code. This is useful if you want to authenticate at application startup but you don't need to use the printer or scanner until later:

**JavaScript:**
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

**TypeScript:**
```typescript
// Construct the client as part of application startup
const client = new Client(printerEmail, clientId, clientSecret, baseUrl);

// Save the initialization promise for later use
const initializePromise = client.initialize().catch((error: Error) => {
  console.error('Error initializing client:', error);
});

// Later in your code, you might have a function triggered by a user action
async function handlePrintRequest(): Promise<void> {
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

When the application is about to close or no longer needs the client, you can deauthenticate. The `deauthenticate()` method clears any active authentication sessions, and it also should be awaited, as it's also asynchronous.

```javascript
// When the application is about to close or no longer needs the client, you can deauthenticate
await client.deauthenticate()
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

You can now interact with the printer. Remember, each `printer` method returns a promise which should be properly handled to ensure error situations are adequately addressed. Use `then-catch` or `async-await` with a try-catch block to handle the promises. Here are some examples:

#### Handle a Complete Print Operation with a Single Method

The simplest way to execute a complete print operation, including setting up the print job, uploading the file, and executing the print job, is the `print(filePath, settings)` method:

**JavaScript:**
```javascript
// Set the path of the file to print
const filePath = './path/to/file.pdf';

// Define your print job settings
const settings = {
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

// Execute the print operation
const jobId = await printer.print(filePath, settings);
```

**TypeScript:**
```typescript
import { PrintSettings } from 'epson-connect-js';

// Set the path of the file to print
const filePath: string = './path/to/file.pdf';

// Define your print job settings with type safety
const settings: PrintSettings = {
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

// Execute the print operation
const jobId: string = await printer.print(filePath, settings);
```

This method returns a `jobId` which can be used to get information about the print job or cancel the print job (see below).

**TypeScript Type Information:**
If you're using TypeScript, the library provides type definitions for all settings. The available types include:
- `PrintMode`: `'document' | 'photo'`
- `MediaSize`: `'ms_a3' | 'ms_a4' | 'ms_a5' | 'ms_a6'` and more
- `MediaType`: `'mt_plainpaper' | 'mt_photopaper' | 'mt_hagaki'` and more
- `PrintQuality`: `'high' | 'normal' | 'draft'`
- `ColorMode`: `'color' | 'mono'`
- `TwoSided`: `'none' | 'long' | 'short'`
- `PaperSource`: `'auto' | 'rear' | 'front1' | 'front2'` and more

#### Getting Printer Info

To get general information about the printer, use the `info()` method:

```javascript
const response = await printer.info()
```

#### Retrieve Printer Capabilities

To retrieve the printer capabilities, use the `capabilities(mode)` method, where the `mode` argument is either 'document' or 'photo':

```javascript
const response = printer.capabilities(mode='document')
```

#### Setting Up Print Job

To set up a print job, you need to define a `settings` object which contains your printer settings, as shown in the section above titled 'Handle a Complete Print Operation with a Single Method'. Each setting has default values that are automatically applied if not explicitly set. We also have validation in place to ensure your settings are correct and will be accepted by the printer. 

Then call the printSetting method and capture the response.

```javascript
// Use the printer instance to set up a print job and capture the jobData object
const jobData = await printer.printSetting(settings)
```

Note that calling printSetting before printing is mandatory, and that you must capture the `jobData` returned by the printSetting call for use in other functions. `jobData` is an object that contains `id`, `upload_uri`, and `settings` properties. The `id` property is a unique job ID, and the `upload_uri` property is the URI to which you will upload the file to be printed for this job. The `settings` property is the `settings` object you passed in, but with any default values applied.

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
const uploadUri = jobData.upload_uri
const filePath = '/path/to/file.jpg'
const printMode = 'photo'

await printer.uploadFile(uploadUri, filePath, printMode)
```

#### Executing Print Job

To execute a print job, use the `executePrint(jobId)` method

```javascript
const response = await printer.executePrint(jobId=jobData.id)
```

#### Getting Print Job Info

To get the information about a print job you've executed, use the `jobInfo(jobId)` method. Note that this endpoint will only work *after* you've executed a print job.

```javascript
const response = await printer.jobInfo(jobData.id)
```

#### Cancelling Print Job

To cancel a print job, use the `cancelPrint(jobId, operatedBy)` method:

```javascript
await printer.cancelPrint(jobId=jobData.upload_uri, operatedBy='user')
```

#### Setting Up Notifications

To set up notifications for printer events, use the `notification(callbackUri, enabled)` method:

```javascript
const callbackUri = 'http://example.com/webhook'
const enabled = true

await printer.notification(callbackUri, enabled)
```

The notification HTTP body will look like this:

```json
{ 
 "Param": { 
  "JobId": "d318caa88966442faaee090f858aef35", 
  "JobStatus": { 
    "Status": "Pending", 
    "StatusReason": "JobQueued", 
    "UpdateDate": "2021/08/06 06:42:13" 
  } 
 } 
}
```

This functionality has not yet been tested. We welcome your contributions to improve it or to add unit tests.

### Scanner

Documents scanned with the Epson Connect API can be either uploaded to a url (such as a cloud storage bucket) or delivered to an email. The `Scanner` class provides methods for adding, updating, removing, and fetching a list of scanner destinations:

```javascript
const scanner = client.scanner;
scanner.list();
scanner.add(name, destination, type);
scanner.update(id, name, destination, type);
scanner.remove(id);
```

Once you have added at least one destination, the destination will be available to select from the control panel of the physical scanner. If you select a destination and scan a document, the scanned document will be delivered to the selected destination.

## Error Handling

The library defines a set of custom error types to provide detailed error information:
- `ClientError` - Errors related to client initialization
- `AuthenticationError` - Errors during authentication
- `ApiError` - Errors from API responses
- `PrinterError` - Errors related to printer operations
- `PrintSettingError` - Errors in print settings validation
- `ScannerError` - Errors related to scanner operations

**JavaScript:**
```javascript
const { Client, ClientError, PrinterError } = require('epson-connect-js');

try {
  const client = new Client(printerEmail, clientId, clientSecret);
  await client.initialize();

  const printer = client.printer;
  const jobId = await printer.print('./document.pdf');

} catch (error) {
  if (error instanceof ClientError) {
    console.error('Client initialization error:', error.message);
  } else if (error instanceof PrinterError) {
    console.error('Printer error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

**TypeScript:**
```typescript
import {
  Client,
  ClientError,
  PrinterError,
  AuthenticationError,
  ApiError
} from 'epson-connect-js';

try {
  const client = new Client(printerEmail, clientId, clientSecret);
  await client.initialize();

  const printer = client.printer;
  const jobId: string = await printer.print('./document.pdf');

} catch (error) {
  if (error instanceof ClientError) {
    console.error('Client initialization error:', error.message);
  } else if (error instanceof AuthenticationError) {
    console.error('Authentication error:', error.message);
  } else if (error instanceof PrinterError) {
    console.error('Printer error:', error.message);
  } else if (error instanceof ApiError) {
    console.error('API error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Development

This library is written in TypeScript and compiled to JavaScript. If you want to contribute or build from source, follow these steps:

### Prerequisites

- Node.js (version 16 or higher recommended)
- npm or yarn

### Building from Source

1. Clone the repository:
```bash
git clone https://github.com/chriscarrollsmith/epson-connect-js.git
cd epson-connect-js
```

2. Install dependencies:
```bash
npm install
```

3. Build the TypeScript source:
```bash
npm run build
```

This will compile the TypeScript files in `src/` to JavaScript in `dist/`, including type definition files (`.d.ts`).

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run clean` - Remove the compiled `dist/` directory
- `npm test` - Run the test suite
- `npm run prepare` - Automatically runs before publishing (builds the project)

### Project Structure

```
epson-connect-js/
├── src/              # TypeScript source files
│   ├── Client.ts
│   ├── Printer.ts
│   ├── Scanner.ts
│   ├── Authenticate.ts
│   ├── PrinterSettings.ts
│   └── index.ts
├── dist/             # Compiled JavaScript (generated)
├── __tests__/        # Test files
├── tsconfig.json     # TypeScript configuration
├── jest.config.js    # Jest test configuration
└── package.json
```

### TypeScript Configuration

The project uses strict TypeScript settings for better type safety:
- Strict mode enabled
- Declaration files generated automatically
- Source maps included for debugging
- Target: ES2020
- Module: CommonJS

### Contributing

Contributions are welcome! When contributing:

1. Write your code in TypeScript (in the `src/` directory)
2. Ensure the build passes: `npm run build`
3. Run tests: `npm test`
4. Follow the existing code style
5. Update documentation as needed

## License

ISC

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/chriscarrollsmith/epson-connect-js).
