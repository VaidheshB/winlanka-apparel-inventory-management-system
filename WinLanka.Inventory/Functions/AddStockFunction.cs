using Microsoft.AspNetCore.Http;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;
using WinLanka.Inventory.DTOs;
using WinLanka.Inventory.Security.Interfaces;
using WinLanka.Inventory.Services.Interface;

namespace WinLanka.Inventory.Functions;

public class AddStockFunction
{
    private readonly ILogger<AddStockFunction> _logger;
    private readonly IStockItemService _stockItemService;
    private readonly ITokenService _tokenService;

    public AddStockFunction(ILogger<AddStockFunction> logger, IStockItemService stockItemService, ITokenService tokenService)
    {
        _logger = logger;
        _stockItemService = stockItemService;
        _tokenService = tokenService;
    }

    [Function("AddStockFunction")]
    public async Task<HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Function,"post", Route ="stocks")] HttpRequestData req)
    {
        if (!req.Headers.TryGetValues("Authorization",out var authorizationHeaders))
        {
            return await CreateErrorResponse(req,HttpStatusCode.Unauthorized,"Authorization token is required.");
        }

        var authorizationHeader =authorizationHeaders.FirstOrDefault();

        // 2. Check Bearer token
        if (string.IsNullOrWhiteSpace(authorizationHeader) ||!authorizationHeader.StartsWith("Bearer ",StringComparison.OrdinalIgnoreCase))
        {
            return await CreateErrorResponse(req,HttpStatusCode.Unauthorized,"Invalid authorization header."
            );
        }

        var token = authorizationHeader.Substring("Bearer ".Length).Trim();

        if (string.IsNullOrWhiteSpace(token))
        {
            return await CreateErrorResponse(req,HttpStatusCode.Unauthorized,"Authorization token is required.");
        }

        // 3. Validate JWT
        var principal =_tokenService.ValidateToken(token);

        if (principal == null)
        {
            return await CreateErrorResponse(req,HttpStatusCode.Unauthorized,"Invalid or expired token.");
        }

        // 4. Check Storekeeper role
        var isStorekeeper =principal.IsInRole("Storekeeper");

        if (!isStorekeeper)
        {
            return await CreateErrorResponse(req,HttpStatusCode.Forbidden,"Only Storekeepers can add stock items."
            );
        }

        // 5. Read request body
        AddStockItemRequestDTO? request;

        try
        {
            request = await JsonSerializer.DeserializeAsync<AddStockItemRequestDTO>(req.Body,new JsonSerializerOptions{PropertyNameCaseInsensitive = true});
        }
        catch (JsonException)
        {
            return await CreateErrorResponse(req,HttpStatusCode.BadRequest,"Invalid request body.");
        }

        if (request == null)
        {
            return await CreateErrorResponse(req,HttpStatusCode.BadRequest,"Request body is required.");
        }

        // 6. Validate required fields
        if (string.IsNullOrWhiteSpace(request.StockName))
        {
            return await CreateErrorResponse(req,HttpStatusCode.BadRequest,"Stock name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Category))
        {
            return await CreateErrorResponse(req,HttpStatusCode.BadRequest,"Category is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Unit))
        {
            return await CreateErrorResponse(req,HttpStatusCode.BadRequest,"Unit is required.");
        }

        if (request.ReorderLevel < 0)
        {
            return await CreateErrorResponse(req,HttpStatusCode.BadRequest,"Reorder level cannot be negative.");
        }

        // 7. Add stock item
        var stockItem = await _stockItemService.AddStockItemAsync(request);

        // 8. Return created stock item
        var response =req.CreateResponse(HttpStatusCode.Created);

        await response.WriteAsJsonAsync(stockItem);

        return response;
    }

    private static async Task<HttpResponseData>CreateErrorResponse(HttpRequestData req,HttpStatusCode statusCode,string message)
    {
        var response = req.CreateResponse(statusCode);

        await response.WriteAsJsonAsync(new { message});

        return response;
    }
}