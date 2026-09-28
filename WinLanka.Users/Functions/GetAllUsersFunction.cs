using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Security.Claims;
using WinLanka.Users.Security.Interfaces;
using WinLanka.Users.Services.Interfaces;

namespace WinLanka.Users.Functions;

public class GetAllUsersFunction
{
    private readonly ILogger<GetAllUsersFunction> _logger;
    private readonly IUserService _userService;
    private readonly ITokenService _tokenService;

    public GetAllUsersFunction(ILogger<GetAllUsersFunction> logger, IUserService userService, ITokenService tokenService)
    {
        _logger = logger;
        _userService = userService;
        _tokenService = tokenService;
    }

    [Function("GetAllUsersFunction")]
    public async Task <HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Function, "get", Route ="users")] HttpRequestData req)
    {
        _logger.LogInformation("Processing Get All Users request.");

        // 1. Get Authorization Header

        if (!req.Headers.TryGetValues("Authorization",out var authorizationValues))
        {
            return await CreateResponse(req,HttpStatusCode.Unauthorized,"Authorization token is required.");
        }

        var authorizationHeader =authorizationValues.FirstOrDefault();

        if (string.IsNullOrWhiteSpace(authorizationHeader) || !authorizationHeader.StartsWith("Bearer ",StringComparison.OrdinalIgnoreCase))
        {
            return await CreateResponse(req,HttpStatusCode.Unauthorized,"Invalid Authorization header.");
        }

        var token =authorizationHeader.Substring("Bearer ".Length).Trim();

        if (string.IsNullOrWhiteSpace(token))
        {
            return await CreateResponse(req,HttpStatusCode.Unauthorized,"Access token is required.");
        }

        // 2. Validate JWT

        var principal =_tokenService.ValidateToken(token);

        if (principal == null)
        {
            return await CreateResponse(req,HttpStatusCode.Unauthorized,"Invalid or expired access token.");
        }

        // 3. Validate Admin Role

        var isAdmin = principal.Claims.Any(claim => claim.Type == ClaimTypes.Role && claim.Value.Equals( "Admin",StringComparison.OrdinalIgnoreCase));

        if (!isAdmin)
        {
            return await CreateResponse(req,HttpStatusCode.Forbidden,"Admin scope is required.");
        }

        // 4. Get Users

        var users = await _userService.GetAllUsersAsync();

        // 5. Return Users

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(users);
        return response;
    }

    private static async Task<HttpResponseData>CreateResponse(HttpRequestData req,HttpStatusCode statusCode,string message)
    {
        var response =req.CreateResponse(statusCode);
        await response.WriteStringAsync(message);
        return response;
    }
} 