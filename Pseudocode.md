# Pseudocode summary

Client.js:

- Import the modules AuthContext from './Authenticate.js', Printer from './Printer.js', Scanner from './Scanner.js'

Define the class Client with:

  - The constructor that takes the parameters: printerEmail, clientId, clientSecret, baseUrl with a default value of 'https://api.epsonconnect.com'
    - If printerEmail is not provided, get it from the environment variables, throw error if not present
    - If clientId is not provided, get it from the environment variables, throw error if not present
    - If clientSecret is not provided, get it from the environment variables, throw error if not present
    - Initialize an instance of AuthContext (authContext) with baseUrl, printerEmail, clientId, clientSecret

  - A method 'initialize' that calls the '_initialize' method of the 'authContext' instance

  - A method 'deauthenticate' that calls the '_deauthenticate' method of the 'authContext' instance

  - A getter 'printer' that creates and returns a new Printer instance using the 'authContext' instance

  - A getter 'scanner' that creates and returns a new Scanner instance using the 'authContext' instance

Define the class ClientError which extends the base Error class:
  - The constructor takes a parameter 'message' and sets its 'name' property to 'ClientError'

Export the classes Client and ClientError

------------------

Authenticate.js:

- Import the axios and moment libraries, and the utility function extractKeyValuePairs from './Utils.js'

Define the class AuthContext with:

  - The constructor that takes the parameters: baseUrl, printerEmail, clientId, clientSecret and initializes several instance variables: baseUrl, printerEmail, clientId, clientSecret, expiresAt, accessToken, refreshToken, and subjectId

  - A private method '_initialize' that calls the '_auth' method

  - A private method '_auth' that:
    - Checks if the current access token expiry time is after the current moment
    - Defines headers and authentication details
    - Prepares a request payload depending on whether an access token already exists or not
    - Sends a POST request to a given endpoint to retrieve an access token
    - If there's an error, it throws an AuthenticationError
    - If it's the first time authenticating, it sets the refresh token
    - Updates the expiry time, access token, and subjectId

  - A private method '_deauthenticate' that sends a DELETE request to a specified endpoint to deauthenticate

  - A method 'send' that:
    - Checks if 'auth' is not provided, if so calls the '_auth' method
    - Defines default headers if 'headers' is not provided
    - Sends an HTTP request with the provided parameters
    - If there's an error in the response, it throws an ApiError
    - Returns the response data

  - A getter 'defaultHeaders' that returns a default headers object with the access token

  - A getter 'deviceId' that returns the subjectId

Define the class AuthenticationError which extends the base Error class:
  - The constructor takes a parameter 'message' and sets its 'name' property to 'AuthenticationError'

Define the class ApiError which extends the base Error class:
  - The constructor takes a parameter 'message' and sets its 'name' property to 'ApiError'

Export the classes AuthContext, AuthenticationError, and ApiError

------------------

Printer.js:

Import required modules: URL, URLSearchParams from 'url', fs from 'fs', AuthContext from 'Authenticate.js', and mergeWithDefaultSettings, validateSettings from 'PrinterSettings'.

Define the Printer class with:

- A constructor that accepts an authContext argument. It throws a PrinterError if the authContext is not an instance of AuthContext. It also initializes the VALID_EXTENSIONS and VALID_OPERATORS sets.

- A getter method 'deviceId' that retrieves the deviceId from the authContext instance.

- The method 'capabilities(mode)' which fetches the capabilities of the printer for a specified mode by sending a GET request to a specific endpoint.

- The method 'printSetting(settings)' that validates and merges provided settings with default settings, sends them to a specific endpoint via a POST request, and adds the settings object to the returned response.

- The method 'uploadFile(uploadUri, filePath, printMode)' that validates the extension of the file, reads the file content, and sends it to the provided upload URI via a POST request.

- The method 'executePrint(jobId)' that sends a POST request to execute a print job.

- The method 'print(filePath, settings = {})' that initiates a print process by calling 'printSetting', 'uploadFile', and 'executePrint' methods sequentially, and finally returns the jobId.

- The method 'cancelPrint(jobId, operatedBy = 'user')' that validates the operator, checks the job status and if it's cancelable, then sends a POST request to cancel the job.

- The method 'jobInfo(jobId)' that retrieves information about a specific job by sending a GET request.

- The method 'info()' that retrieves information about the printer by sending a GET request.

- The method 'notification(callbackUri, enabled = true)' that sets up notifications by sending a POST request with notification settings.

Define the PrinterError class, which extends the built-in Error class.

Finally, export the Printer and PrinterError classes.

------------------

PrinterSettings.js:

1. Define several Set constants for different printer settings:
    - VALID_PRINT_MODES: contains 'document', 'photo'
    - VALID_MEDIA_SIZES: contains 'ms_a3', 'ms_a4', 'ms_a5', etc.
    - VALID_MEDIA_TYPES: contains 'mt_plainpaper', 'mt_photopaper', 'mt_hagaki', etc.
    - VALID_PRINT_QUALITIES: contains 'high', 'normal', 'draft'
    - VALID_PAPER_SOURCES: contains 'auto', 'rear', 'front1', etc.
    - VALID_COLOR_MODES: contains 'color', 'mono'
    - VALID_TWO_SIDE: contains 'none', 'long', 'short'

2. Define a function called `generateRandomString(length)`:
    - The function generates a random string of a specified length.

3. Define a function `mergeWithDefaultSettings(settings = {})`:
    - The function combines user-supplied print settings with default values.
    - If the user does not supply a certain setting, the function uses a default value.
    - The function returns the combined settings object.

4. Define a function `validateSettings(settings = {})`:
    - The function validates the user-supplied settings based on the valid constants defined at the start of the module.
    - If a setting is invalid, the function throws a `PrintSettingError`.
    - It checks for valid keys, length of job name, print mode, media size, media type, boolean checks for borderless and reverse order, and the rest of the print settings.
    - It has specific checks for print mode with reverse order, and two-sided printing with collation.

5. Define a class `PrintSettingError` which extends the built-in JavaScript `Error` class:
    - The constructor of this class accepts a `message` parameter.
    - It sets its own `name` property to 'PrintSettingError'.

6. The module exports the following: `mergeWithDefaultSettings` function, `validateSettings` function, and the `PrintSettingError` class.

------------------

Scanner.js:

1. Import `AuthContext` from './Authenticate'

2. Define a class `Scanner` with the following methods and properties:

   - `constructor(authContext)`: Takes in an `AuthContext` object as a parameter. Throws a `ScannerError` if the provided argument is not an instance of `AuthContext`. Initializes a `_authContext`, `_path`, `_destination_cache`, and `VALID_DESTINATION_TYPES` properties on the instance.

   - `VALID_DESTINATION_TYPES`: A Set that contains 'mail' and 'url' as valid types of scan destinations.

   - `list()`: An asynchronous method that uses the `_authContext` to send a 'GET' request to the `_path`.

   - `add(name, destination, type_ = 'mail')`: An asynchronous method that adds a new scan destination. It takes `name`, `destination`, and `type_` as parameters, validates these using the `_validateDestination` method, prepares a data object, and sends a 'POST' request to `_path` using `_authContext`. It then adds the response to the `_destination_cache`.

   - `update(id_, name = null, destination = null, type_ = null)`: An asynchronous method that updates a scan destination. It retrieves the scan destination from the `_destination_cache` based on the `id_`, validates the `name`, `destination`, and `type_`, prepares a data object, and sends a 'POST' request to update the scan destination. It then replaces the updated scan destination in the `_destination_cache`.

   - `remove(id_)`: An asynchronous method that deletes a scan destination. It sends a 'DELETE' request to the `_path` and removes the scan destination from the `_destination_cache`.

   - `_validateDestination(name, destination, type_)`: A private method that validates the `name`, `destination`, and `type_` parameters according to specific rules. If any of the validations fails, it throws a `ScannerError`.

3. Define a class `ScannerError` that extends the base `Error` class.

4. Export the `Scanner` and `ScannerError` classes.

------------------

Utils.js:

1. Define a function `extractKeyValuePairs(obj, keysToExtract)`, which extracts key-value pairs from a nested object where the key is in `keysToExtract`. It takes two arguments, `obj` and `keysToExtract`.

   - Create an empty array `result` to store the final key-value pairs, and a `seenObjects` WeakSet to avoid circular references.

   - Define a nested function `extractPairsRecursive(obj, path = '')` that takes `obj` and `path` as arguments. This function iterates through each key-value pair of the object:

       - If `obj` is already in `seenObjects`, the function returns early to avoid infinite loops due to circular references. Otherwise, it adds `obj` to `seenObjects`.

       - It constructs the `currentPath` by concatenating the `path` and the `key`. If `path` is empty, `currentPath` equals `key`.

       - If `currentPath` is in `keysToExtract`, it pushes an object with `key` and `value` into `result`.

       - If the `value` is a non-null object, it recursively calls `extractPairsRecursive` on `value` with `currentPath`.

   - Call `extractPairsRecursive` on the input `obj`.

   - After finishing the recursive traversal, return `result`.

2. Export the `extractKeyValuePairs` function.