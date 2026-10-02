using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using WinLanka.Inventory.DTOs;
using WinLanka.Inventory.Security.Interfaces;
using WinLanka.Inventory.Services.Interface;

namespace WinLanka.Inventory.Functions
{
    public class UpdateReorderLevelFunction
    {
        private readonly ILogger<UpdateReorderLevelFunction> _logger;

        private readonly ITokenService _tokenService;

        private readonly IStockSummaryService  _stockSummaryService;

        public UpdateReorderLevelFunction( ILogger<UpdateReorderLevelFunction> logger, ITokenService tokenService, IStockSummaryService stockSummaryService)
        {
            _logger = logger;
            _tokenService = tokenService;
            _stockSummaryService = stockSummaryService;
        }

        [Function("UpdateReorderLevelFunction")]
        public async Task<IActionResult> Run( [HttpTrigger( AuthorizationLevel.Function, "put", Route = "stocksummary/{stockItemId}/reorderlevel")] HttpRequest req, int stockItemId)
        {
            _logger.LogInformation( "Updating reorder level for Stock Item ID {StockItemId}.", stockItemId);

            // Validate Authorization Header

            var authorizationHeader = req.Headers["Authorization"].FirstOrDefault();

            if (string.IsNullOrWhiteSpace( authorizationHeader))
            {
                return new UnauthorizedObjectResult( "Authorization token is required.");
            }

            if (!authorizationHeader.StartsWith( "Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                return new UnauthorizedObjectResult( "Invalid authorization header.");
            }

            var token = authorizationHeader.Substring("Bearer ".Length).Trim();

            // Validate JWT Token

            var principal = _tokenService.ValidateToken(token);

            if (principal == null)
            {
                return new UnauthorizedObjectResult( "Invalid or expired token.");
            }

            // Check Storekeeper Role

            if (!principal.IsInRole("Storekeeper"))
            {
                return new ObjectResult( "Only Storekeepers can update reorder levels.")
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
            }

            // Validate Stock Item ID

            if (stockItemId <= 0)
            {
                return new BadRequestObjectResult( "Invalid Stock Item ID.");
            }

            // Read Request Body

            UpdateReorderLevelRequestDTO? request;

            try
            {
                request = await req.ReadFromJsonAsync< UpdateReorderLevelRequestDTO>();
            }
            catch (Exception ex)
            {
                _logger.LogWarning( ex, "Invalid request body for Stock Item ID {StockItemId}.", stockItemId);

                return new BadRequestObjectResult( "Invalid request body.");
            }

            if (request == null)
            {
                return new BadRequestObjectResult( "Request body is required.");
            }

            // Validate Reorder Level

            if (request.ReorderLevel < 0)
            {
                return new BadRequestObjectResult( "Reorder level cannot be negative.");
            }

            // Update Reorder Level

            try
            {
                await _stockSummaryService.UpdateReorderLevelAsync( stockItemId, request.ReorderLevel);

                _logger.LogInformation( "Reorder level for Stock Item ID {StockItemId} updated to {ReorderLevel}.", stockItemId, request.ReorderLevel);

                return new OkObjectResult( new
                    {
                        message ="Reorder level updated successfully.",
                        stockItemId = stockItemId,
                        reorderLevel = request.ReorderLevel
                    });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning( ex, "Stock Item ID {StockItemId} was not found.", stockItemId);

                return new NotFoundObjectResult( ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while updating reorder level for Stock Item ID {StockItemId}.", stockItemId);

                return new ObjectResult( "Unable to update reorder level.")
                {
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }
    }
}

