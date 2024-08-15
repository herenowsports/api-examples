// See https://aka.ms/new-console-template for more information
using System.Text.Json;
using IdentityModel.Client;

Console.WriteLine("Usage: dotnet run <client_id> <client_secret> [optional IDP URL] [optional API Base URL]");

if (args.Length < 1)
{
	Console.WriteLine("Please provide a client ID");
	return;
}
var clientId = args[0];

if (args.Length < 2)
{
	Console.WriteLine("Please provide a client secret");
	return;
}
var clientSecret = args[1];

// If the user provides an IDP URL, use that. Otherwise, use the public server
string idpUrl = "https://idp.herenow.com";
if (args.Length > 2)
{
	idpUrl = args[2];
}

var apiBaseUrl = "https://racingapi.herenow.com";
if (args.Length > 3)
{
	apiBaseUrl = args[3];
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
	ClientId = clientId,
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

var pingResponse = await apiClient.GetAsync($"{apiBaseUrl}/ping/authenticated");
if(!pingResponse.IsSuccessStatusCode)
{
	Console.WriteLine($"API Ping Error Response: {pingResponse.StatusCode}");
}
else
{
	var json = JsonDocument.Parse(await pingResponse.Content.ReadAsStringAsync()).RootElement;
	var prettyApiResponse = JsonSerializer.Serialize(json, 
		new JsonSerializerOptions { WriteIndented = true });
	Console.WriteLine($"API Ping Response:\n{prettyApiResponse}");
}

var permissionsResponse = await apiClient.GetAsync($"{apiBaseUrl}/clientpermissions/myclientpermissions");
if(!permissionsResponse.IsSuccessStatusCode)
{
	Console.WriteLine($"API Permissions Error Response: {permissionsResponse.StatusCode}");
}
else
{
	var json = JsonDocument.Parse(await permissionsResponse.Content.ReadAsStringAsync()).RootElement;
	var prettyApiResponse = JsonSerializer.Serialize(json, 
		new JsonSerializerOptions { WriteIndented = true });
	Console.WriteLine($"API Permissions Response:\n{prettyApiResponse}");
}