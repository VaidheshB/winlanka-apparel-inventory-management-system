using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using WinLanka.Inventory.DTOs;
using WinLanka.Inventory.Security.Interfaces;
using WinLanka.Inventory.Services.Interface;
using WinLanka.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace WinLanka.Inventory.Functions
{
    public class UpdateReorderLevelFunction
    {
        private readonly ILogger<UpdateReorderLevelFunction> _logger;
        private readonly ITokenService _tokenService;
        private readonly IStockSummaryService  _stockSummaryService;
        private readonly IEmailService _emailService;
        private readonly ApplicationDbContext _context;
        public UpdateReorderLevelFunction( ILogger<UpdateReorderLevelFunction> logger, ITokenService tokenService, IStockSummaryService stockSummaryService, IEmailService emailService, ApplicationDbContext context)
        {
            _logger = logger;
            _tokenService = tokenService;
            _stockSummaryService = stockSummaryService;
            _emailService = emailService;
            _context = context;
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
                var result = await _stockSummaryService.UpdateReorderLevelAsync( stockItemId, request.ReorderLevel);

                var recipientEmails = await GetStorekeeperAndStockManagerEmailsAsync();

                foreach (var email in recipientEmails)
                {
                    try
                    {
                        await _emailService.SendReorderLevelUpdatedEmailAsync(email, result.StockName, result.StockItemId, result.OldReorderLevel, result.NewReorderLevel);

                    }
                    catch (Exception emailException)
                    {
                        // Email failure should be logged. 
                        // The database update itself has already succeeded. 
                        _logger.LogError(emailException, "Failed to send reorder level notification to {Email}.", email);
                    }


                }

                _logger.LogInformation( "Reorder level for Stock Item ID {StockItemId} updated to {ReorderLevel}.", stockItemId, request.ReorderLevel);

                return new OkObjectResult( new
                    {
                        message ="Reorder level updated successfully.",
                        stockItemId = result.StockItemId,
                        stockName = result.StockName,
                        oldReorderLevel = result.OldReorderLevel,
                        newReorderLevel = result.NewReorderLevel,
                        notificationRecipients = recipientEmails.Count

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

        private async Task<List<string>> GetStorekeeperAndStockManagerEmailsAsync()
        {
            return await _context.Users.Where(user => user.IsActive == true && !string.IsNullOrWhiteSpace(user.UserName) && user.UserScopes.Any(
                        userScope => userScope.Scope != null && ( userScope.Scope.ScopeName == "Storekeeper" || userScope.Scope.ScopeName == "Stock Manager" )
                    )
                )
                .Select(user => user.UserName!)
                .Distinct()
                .ToListAsync();
        }


    }

}

