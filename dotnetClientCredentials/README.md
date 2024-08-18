# Command Line With Credentials

The **dotnetClientCredentials** .net project is an example of how to create a command line app that accesses a protected HereNow API. 

The client uses the OAUTH 2.0 **client credentials** flow to access the API. A client supplies a client ID and secret to authenticate access to an API. 

The client credentials act as *authentication* for the client, so this flow should only be used in places where general users do not have access to the client credentials. This flow is particularly appropriate for server-to-server communications, but may also be used in certain instances where an application is not distributed to the public. Client credentials may be used in AWS Lambda or Azure Functions (see other examples in this repo).  Client credentials are **NOT** appropriate should not be used in an app that makes requests from a browser such as React, Angular, or Vue single page apps. For those types of apps, use the Authorization Code flow. See other examples in this repo for building browser apps. 

On the backend, the credentials *authenticate* the client app, but then the client requires *authorization* to work with protected resources. Without authorization, a client has no innate ability to access any protected resources. Client authorization similarly to how user's are authorized to access a protected resource like a race, venue information, or a set of records. If a client has not authorization, it is like a user that does not yet have any access to a race. 

To request a client ID and secret for client credentials access to APIs, please send a request to support@herenow.com. 

