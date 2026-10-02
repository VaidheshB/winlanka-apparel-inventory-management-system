using Microsoft.AspNetCore.Http;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using WinLanka.Inventory.Security.Interfaces;
using WinLanka.Inventory.Services.Interface;

namespace WinLanka.Inventory.Functions;

public class GetAllStockItemsFunction
{
    private readonly ILogger<GetAllStockItemsFunction> _logger;
    private readonly IStockItemService _stockItemService;
    private readonly ITokenService _tokenService;

    public GetAllStockItemsFunction(ILogger<GetAllStockItemsFunction> logger, IStockItemService stockItemService, ITokenService tokenService)
    {
        _logger = logger;
        _stockItemService = stockItemService;
        _tokenService = tokenService;
    }

    [Function("GetAllStockItemsFunction")]
    public async Task <HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Function, "get", Route ="stocks")] HttpRequestData req)
    {
        if (!req.Headers.TryGetValues("Authorization", out var authorizationHeaders))
        {
            return req.CreateResponse(HttpStatusCode.Unauthorized);
        }

        var authorizationHeader = authorizationHeaders.FirstOrDefault();

        if (string.IsNullOrWhiteSpace(authorizationHeader))
        {
            return req.CreateResponse(HttpStatusCode.Unauthorized);
        }
        if (!authorizationHeader.StartsWith("Bearer ",StringComparison.OrdinalIgnoreCase))
        {
            return req.CreateResponse(HttpStatusCode.Unauthorized);
        }

        var token = authorizationHeader.Substring("Bearer ".Length).Trim();

        if (string.IsNullOrWhiteSpace(token))
        {
            return req.CreateResponse(HttpStatusCode.Unauthorized);
        }

        var principal = _tokenService.ValidateToken(token);

        if (principal == null)
        {
            return req.CreateResponse(HttpStatusCode.Unauthorized);
        }

        var isStorekeeper = principal.IsInRole("Storekeeper");

        var isStockManager = principal.IsInRole("Stock Manager");

        if (!isStorekeeper && !isStockManager)
        {
            return req.CreateResponse( HttpStatusCode.Forbidden);
        }

        var stockItems = await _stockItemService.GetAllStockItemsAsync();
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(stockItems);
        return response;
    }

}