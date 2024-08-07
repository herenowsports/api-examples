// See https://aka.ms/new-console-template for more information
using System.Text.Json;
using IdentityModel.Client;

Console.WriteLine("Usage: dotnet run <client_secret> [optional IDP URL] [optional API Base URL]");

if (args.Length < 1)
{
	Console.WriteLine("Please provide a client secret");
	return;
}
var clientSecret = args[0];

// If the user provides an IDP URL, use that. Otherwise, use the public server
string idpUrl = "https://idp.herenow.com";
if (args.Length > 1)
{
	idpUrl = args[1];
}

var apiBaseUrl = "https://racingapi.herenow.com";
if (args.Length > 2)
{
	apiBaseUrl = args[2];
}

// IdentityModel adds an extension onto the standard HttpClient to read OAUTH discovery documents
var client = new HttpClient();
var disco = await client.GetDiscoveryDocumentAsync(idpUrl);
if(disco.IsError)
{
		Console.WriteLine(disco.Error);
		return;
}

// In the discovery document contains the address for the endpoint to request a token.
// Identity model provides a simple attribute to access to get that address. 
var tokenEndpoint = disco.TokenEndpoint;

var tokenRequest = new ClientCredentialsTokenRequest
{
	Address = tokenEndpoint,
	ClientId = "client",
	ClientSecret = clientSecret,
	Scope = "racingapi"
};
var tokenResponse = await client.RequestClientCredentialsTokenAsync(tokenRequest);
if(tokenResponse.IsError)
{
	Console.WriteLine(tokenResponse.Error);
	Console.WriteLine(tokenResponse.ErrorDescription);
	return;
}

var prettyTokenResponse = JsonSerializer.Serialize(tokenResponse.Json, 
	new JsonSerializerOptions { WriteIndented = true });
Console.WriteLine($"IDP Response:\n{prettyTokenResponse}");

var token = tokenResponse.AccessToken!;
var apiClient = new HttpClient();
apiClient.SetBearerToken(token);

var response = await apiClient.GetAsync($"{apiBaseUrl}/ping/clientcred");
if(!response.IsSuccessStatusCode)
{
	Console.WriteLine(response.StatusCode);
}
else
{
	var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement;
	var prettyApiResponse = JsonSerializer.Serialize(json, 
		new JsonSerializerOptions { WriteIndented = true });
	Console.WriteLine($"API Response:\n{prettyApiResponse}");
}