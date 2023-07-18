# Pseudocode summary

Client.js:

Import the modules AuthContext, Printer, Scanner

Define the class Client with:
    - The constructor that takes the parameters: baseUrl, printerEmail, clientId, clientSecret
        - If no baseUrl is provided, set it to the Epson Connect base URL
        - If no printerEmail is provided, set it to the one from environment variables, throw error if not present
        - If no clientId is provided, set it to the one from environment variables, throw error if not present
        - If no clientSecret is provided, set it to the one from environment variables, throw error if not present
        - Initialize an instance of AuthContext with baseUrl, printerEmail, clientId, clientSecret

    - A method 'deauthenticate' that calls the '_deauthenticate' method of the 'authContext' instance

    - A getter 'printer' that creates a new Printer instance using the 'authContext' instance

    - A getter 'scanner' that creates a new Scanner instance using the 'authContext' instance

Define the class ClientError which extends the base Error class:
    - The constructor takes a parameter 'message' and sets its 'name' property to 'ClientError'

Export the classes Client and ClientError

------------------

Authenticate.js:

Import the axios and moment libraries.

Define the class AuthContext with:

A constructor method that takes baseUrl, printerEmail, clientId, clientSecret as parameters, initializes several instance variables, and calls the _auth method to authenticate.

A method _auth that:

Checks if the current time is after the expiration of the access token.
If so, it defines headers and authentication details, sets up a request payload depending on whether an access token already exists or not.
Sends a POST request to a given endpoint to retrieve an access token.
If there's an error, it throws an AuthenticationError.
If it's the first time authenticating, it sets the refresh token.
Sets the new expiry time, access token, and subjectId.
A method _deauthenticate that sends a DELETE request to a specified endpoint to deauthenticate.

A method send that:

Checks if 'auth' is null, if so calls the _auth method.
Defines default headers if 'headers' is null.
Sends an HTTP request with the provided parameters.
If there's an error in the response, it throws an ApiError.
Returns the response data.
A getter defaultHeaders that returns a default headers object with the access token.

A getter deviceId that returns the subjectId.

Define the class AuthenticationError which extends the base Error class:

A constructor that takes a parameter 'message' and sets its 'name' property to 'AuthenticationError'.
Define the class ApiError which extends the base Error class:

A constructor that takes a parameter 'message' and sets its 'name' property to 'ApiError'.
Export the classes AuthContext, AuthenticationError, and ApiError.

------------------

Printer.js:

Import the modules URL, URLSearchParams, fs, AuthContext, mergeWithDefaultSettings, validateSettings

Define the class Printer with:
- The constructor that takes the parameter: authContext
    - Throws an error if authContext is not an instance of AuthContext
    - Stores authContext into an instance variable
    - Defines a set of VALID_EXTENSIONS and VALID_OPERATORS

- A getter 'deviceId' that returns the deviceId from the 'authContext' instance

- A method 'capabilities' that:
    - Builds a path using the deviceId
    - Sends a GET request to the Epson Connect API using the built path

- A method 'printSetting' that:
    - Validates the settings
    - Builds a path using the deviceId
    - Sends a POST request to the Epson Connect API using the built path and the settings

- A method 'uploadFile' that:
    - Checks if the file extension is valid, throws an error if not
    - Modifies the given URL to include additional query parameters
    - Reads the content of the file into a buffer
    - Sends a POST request to the Epson Connect API using the built path and the file content

- A method 'executePrint' that:
    - Builds a path using the deviceId and the jobId
    - Sends a POST request to the Epson Connect API using the built path

- A method 'print' that:
    - Merges the settings with the default settings
    - Calls the 'printSetting', 'uploadFile', and 'executePrint' methods
    - Returns the jobId

- A method 'cancelPrint' that:
    - Checks if the operator is valid, throws an error if not
    - Retrieves the job info and checks its status, throws an error if not in ['pending', 'pending_held']
    - Builds a path using the deviceId and the jobId
    - Sends a POST request to the Epson Connect API using the built path and the operator

- A method 'jobInfo' that:
    - Builds a path using the deviceId and the jobId
    - Sends a GET request to the Epson Connect API using the built path

- A method 'info' that:
    - Builds a path using the deviceId
    - Sends a GET request to the Epson Connect API using the built path

- A method 'notification' that:
    - Builds a path using the deviceId
    - Sends a POST request to the Epson Connect API using the built path and the notification settings

Define the class PrinterError which extends the base Error class

Export the classes Printer and PrinterError

------------------

PrinterSettings.js:

Define several Set constants: 
    - VALID_PRINT_MODES: 'document', 'photo'
    - VALID_MEDIA_SIZES: 'ms_a3', 'ms_a4', etc.
    - VALID_MEDIA_TYPES: 'mt_plainpaper', 'mt_photopaper', etc.
    - VALID_PRINT_QUALITIES: 'high', 'normal', 'draft'
    - VALID_PAPER_SOURCES: 'auto', 'rear', etc.
    - VALID_COLOR_MODES: 'color', 'mono'
    - VALID_TWO_SIDE: 'none', 'long', 'short'

Define a function generateRandomString(length) that generates a random string of a given length

Define a function mergeWithDefaultSettings(settings = {}) that:
    - Combines user-supplied print settings with default values
    - Returns the merged settings object

Define a function validateSettings(settings = {}) that:
    - Validates the settings based on the valid constants
    - Throws a PrintSettingError if a setting is invalid

Define the class PrintSettingError which extends the base Error class:
    - The constructor takes a parameter 'message' and sets its 'name' property to 'PrintSettingError'

Export the functions mergeWithDefaultSettings, validateSettings and the class PrintSettingError

------------------

Scanner.js:

Import the AuthContext from './authenticate'

Define the class Scanner with methods:
- constructor(authContext): takes in an AuthContext object as a parameter, throws a ScannerError if the provided argument is not an instance of AuthContext. Initializes a _authContext, _path, _destination_cache, and VALID_DESTINATION_TYPES properties on the instance.

- list(): an async method that uses the _authContext to send a get request to the _path

- add(name, destination, type_ = 'mail'): an async method that takes name, destination, and type_ as parameters, validates the destination using the _validateDestination method, prepares a data object, and sends a post request to _path using _authContext. Also, it adds the response to the _destination_cache

- update(id_, name = null, destination = null, type_ = null): an async method that updates a destination in the cache, validates the destination, sends a post request to update the destination and replaces the updated destination in the cache

- remove(id_): an async method that deletes a destination by sending a delete request to the _path and removes it from the _destination_cache

- _validateDestination(name, destination, type_): a private method that validates the name, destination, and type_ parameters according to specific rules. Throws a ScannerError if any validation fails.

Define the class ScannerError that extends the base Error class.

Export the Scanner and ScannerError classes.
