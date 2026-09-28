using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Security.Claims;
using System.Text.Json;
using WinLanka.Server.Models;
using WinLanka.Users.DTOs;
using WinLanka.Users.Security.Interfaces;
using WinLanka.Users.Services.Interfaces;

namespace WinLanka.Users.Functions;

public class UpdateUserFunction
{
    private readonly ILogger<UpdateUserFunction> _logger;
    private readonly IUserService _userService;
    private readonly ITokenService _tokenService;

    public UpdateUserFunction(ILogger<UpdateUserFunction> logger, IUserService userService, ITokenService tokenService)
    {
        _logger = logger;
        _userService = userService;
        _tokenService = tokenService;
    }

    [Function("UpdateUserFunction")]
    public async Task<HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Function,"put", Route = "users/{userId:int}")] HttpRequestData req, int userId)
    {
        _logger.LogInformation("Processing Update User request for User ID {UserId}.",userId);

        // 1. Get Authorization Header
        if (!req.Headers.TryGetValues("Authorization",out var authorizationValues))
        {
            return await CreateResponse(req,HttpStatusCode.Unauthorized,"Authorization token is required.");
        }

        var authorizationHeader = authorizationValues.FirstOrDefault();

        if (string.IsNullOrWhiteSpace(authorizationHeader) ||!authorizationHeader.StartsWith("Bearer ",StringComparison.OrdinalIgnoreCase))
        {
            return await CreateResponse(req,HttpStatusCode.Unauthorized,"Invalid Authorization header.");
        }

        var token =authorizationHeader.Substring("Bearer ".Length).Trim();

        if (string.IsNullOrWhiteSpace(token))
        {
            return await CreateResponse(req,HttpStatusCode.Unauthorized,"Access token is required.");
        }

        var principal = _tokenService.ValidateToken(token);

        if (principal == null)
        {
            return await CreateResponse(req,HttpStatusCode.Unauthorized,"Invalid or expired access token.");
        }

        // 3. Validate Admin Role
        var isAdmin =principal.Claims.Any(claim => claim.Type == ClaimTypes.Role && claim.Value.Equals("Admin",StringComparison.OrdinalIgnoreCase));

        if (!isAdmin)
        {
            return await CreateResponse(req,HttpStatusCode.Forbidden,"Admin scope is required.");
        }

        // 4. Read Request Body

        string requestBody;

        using (var reader = new StreamReader(req.Body))
        {
            requestBody = await reader.ReadToEndAsync();
        }

        if (string.IsNullOrWhiteSpace(
            requestBody))
        {
            return await CreateResponse(req,HttpStatusCode.BadRequest,"Request body is required.");
        }

        // 5. Deserialize Request

        UpdateUserDTO? data;

        try
        {
            data =JsonSerializer.Deserialize<UpdateUserDTO>(requestBody, new JsonSerializerOptions { PropertyNameCaseInsensitive = true});
        }
        catch (JsonException)
        {
            return await CreateResponse(req,HttpStatusCode.BadRequest,"Invalid request body.");
        }

        if (data == null)
        {
            return await CreateResponse(req,HttpStatusCode.BadRequest,"Invalid request data.");
        }

        // 6. Update User

        var result =await _userService.UpdateUserAsync(userId,data);

        if (!result.Success)
        {
            return await CreateResponse(req,HttpStatusCode.BadRequest,result.Error!);
        }

        // 7. Return Safe Response

        var response = req.CreateResponse(HttpStatusCode.OK);

        await response.WriteAsJsonAsync( new { message = "User updated successfully.",
                user = new {
                    userId =result.User!.UserId,
                    firstName =result.User.FirstName,
                    lastName =result.User.LastName,
                    userName =result.User.UserName,
                    isActive =result.User.IsActive,
                    scopes =data.Scopes
                }
            });
        return response;
    }

    private static async Task<HttpResponseData>CreateResponse(HttpRequestData req,HttpStatusCode statusCode,string message)
    {
        var response =req.CreateResponse(statusCode);
        await response.WriteStringAsync(message);
        return response;
    }
}