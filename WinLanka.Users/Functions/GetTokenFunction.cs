using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;
using WinLanka.Users.DTOs;
using WinLanka.Users.Security.Interfaces;
using WinLanka.Users.Services.Interfaces;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace WinLanka.Users.Functions;

public class GetTokenFunction
{
    private readonly ILogger<GetTokenFunction> _logger;
    private readonly IUserService _userService;
    private readonly ITokenService _tokenService;

    public GetTokenFunction(ILogger<GetTokenFunction> logger, IUserService userService, ITokenService tokenService)
    {
        _logger = logger;
        _userService = userService;
        _tokenService = tokenService;
    }

    [Function("GetTokenFunction")]
    public async Task<HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Anonymous,"post",Route = "oauth/Token")] HttpRequestData req)
    {
        _logger.LogInformation("Processing to Generate Token");

        string requestBody;
        
        using (var reader = new StreamReader(req.Body))
        {
            requestBody = await reader.ReadToEndAsync();
        }

        LoginRequestDTO? loginRequest;

        try
        {
            loginRequest = JsonSerializer.Deserialize<LoginRequestDTO>(requestBody, 
                new JsonSerializerOptions {PropertyNameCaseInsensitive = true});
        }
        catch (JsonException)
        {
            var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);

            await badRequest.WriteStringAsync(
                "Invalid request body.");

            return badRequest;
        }

        if (loginRequest == null || string.IsNullOrEmpty(loginRequest.UserName) || string.IsNullOrEmpty(loginRequest.Password))
        {
            var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequest.WriteStringAsync( "Invalid request body. UserName and Password are required.");
            return badRequest;
        }

        var user = await _userService.AuthenticateUserAsync(loginRequest.UserName, loginRequest.Password);

        if (user == null)
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteStringAsync("Invalid username or password.");
            return unauthorizedResponse;
        }

        var jwtToken = _tokenService.GenerateToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        var refreshTokenExpiry = DateTime.UtcNow.AddDays(7);

        
        await _userService.UpdateRefreshTokenAsync(user,refreshToken,refreshTokenExpiry);

        var responsePayload = new TokenResponseDTO
        {
            AccessToken = jwtToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddHours(2)
        };

        var response = req.CreateResponse( HttpStatusCode.OK);

        await response.WriteAsJsonAsync(responsePayload);

        return response;
    }
}