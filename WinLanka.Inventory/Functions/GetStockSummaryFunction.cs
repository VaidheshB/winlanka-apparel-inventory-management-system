using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using WinLanka.Inventory.Security.Interfaces;
using WinLanka.Inventory.Services.Interface;

namespace WinLanka.Inventory.Functions;

public class GetStockSummaryFunction
{
    private readonly ILogger<GetStockSummaryFunction> _logger;
    private readonly ITokenService _tokenService;

    private readonly IStockSummaryService _stockSummaryService;

    public GetStockSummaryFunction(ILogger<GetStockSummaryFunction> logger, ITokenService tokenService, IStockSummaryService stockSummaryService)
    {
        _logger = logger;
        _tokenService = tokenService;
        _stockSummaryService = stockSummaryService;
    }

    [Function("GetStockSummaryFunction")]
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Function, "get", Route = "stocksummary")] HttpRequest req)
    {
        _logger.LogInformation( "Getting Stock Summary.");

        var authorizationHeader = req.Headers["Authorization"].FirstOrDefault();

        if (string.IsNullOrWhiteSpace( authorizationHeader))
        {
            return new UnauthorizedObjectResult("Authorization token is required.");
        }

        if (!authorizationHeader.StartsWith( "Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return new UnauthorizedObjectResult( "Invalid authorization header.");
        }

        var token = authorizationHeader.Substring("Bearer ".Length).Trim();

        var principal =_tokenService.ValidateToken(token);

        if (principal == null)
        {
            return new UnauthorizedObjectResult( "Invalid or expired token.");
        }

        var isStorekeeper = principal.IsInRole("Storekeeper");

        var isStockManager = principal.IsInRole("Stock Manager");

        if (!isStorekeeper && !isStockManager)
        {
            return new ObjectResult( "You do not have permission to view Stock Summary.")
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
        }

        try
        {
            var stockSummary =
                await _stockSummaryService.GetAllStockSummariesAsync();

            return new OkObjectResult( stockSummary);
        }
        catch (Exception ex)
        {
            _logger.LogError( ex, "Error while getting Stock Summary.");

            return new ObjectResult( "Unable to retrieve Stock Summary.")
            {
                StatusCode = StatusCodes.Status500InternalServerError
            };
        }
    }
}