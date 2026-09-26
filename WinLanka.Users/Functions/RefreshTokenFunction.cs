using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;
using WinLanka.Users.DTOs;
using WinLanka.Users.Security;
using WinLanka.Users.Security.Interfaces;
using WinLanka.Users.Services.Interfaces;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace WinLanka.Users.Functions;

public class RefreshTokenFunction
{
    private readonly ILogger<RefreshTokenFunction> _logger;
    private readonly IUserService _userService;
    private readonly ITokenService _tokenService;

    public RefreshTokenFunction(ILogger<RefreshTokenFunction> logger, IUserService userService, ITokenService tokenService)
    {
        _logger = logger;
        _userService = userService;
        _tokenService = tokenService;
    }

    [Function("RefreshTokenFunction")]
    public async Task<HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Function,"post", Route ="oauth/refresh")] HttpRequestData req)
    {
        string requestBody;

        using (var reader = new StreamReader(req.Body))
        {
           requestBody = reader.ReadToEnd();
        }

        RefreshTokenDTO? refreshTokenDTO;

        try
        {
            refreshTokenDTO = JsonSerializer.Deserialize<RefreshTokenDTO>(requestBody, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch (JsonException)
        {
            var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequest.WriteStringAsync("Invalid request body.");
            return badRequest;

        }

        if (refreshTokenDTO == null || string.IsNullOrWhiteSpace(refreshTokenDTO.refreshToken))
        {
            var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequest.WriteStringAsync("Refresh token is required.");
            return badRequest;
        }

        var user = await _userService.ValidateRefreshTokenAsync(refreshTokenDTO.refreshToken);

        if (user == null)
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteStringAsync("Invalid or expired refresh token.");
            return unauthorizedResponse;
        }

        var newAccessToken = _tokenService.GenerateToken(user);

        var responsePayLoad = new TokenResponseDTO
        {
            AccessToken = newAccessToken,
            RefreshToken = refreshTokenDTO.refreshToken,
            ExpiresAt = DateTime.UtcNow.AddHours(1)
        };

        var response = req.CreateResponse(HttpStatusCode.OK);

        await response.WriteAsJsonAsync(responsePayLoad);

        return response;



    }
}