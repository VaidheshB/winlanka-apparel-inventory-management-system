using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using WinLanka.Inventory.DTOs;
using WinLanka.Inventory.Security.Interfaces;
using WinLanka.Inventory.Services.Interface;

namespace WinLanka.Inventory.Functions;

public class GetAllDispatchNoteDetailsFunction
{
    private readonly ILogger<GetAllDispatchNoteDetailsFunction> _logger;
    private readonly ITokenService _tokenService;
    private readonly IDispatchNoteService _dispatchNoteService;

    public GetAllDispatchNoteDetailsFunction(ILogger<GetAllDispatchNoteDetailsFunction> logger, ITokenService tokenService, IDispatchNoteService dispatchNoteService)
    {
        _logger = logger;
        _tokenService = tokenService;
        _dispatchNoteService = dispatchNoteService;
    }

    [Function("GetAllDispatchNoteDetailsFunction")]
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Function, "get", Route = "dispatchnotes")] HttpRequest req)
    {
        _logger.LogInformation( "Getting all Dispatch Note details.");

        // Get Authorization header
        var authorizationHeader = req.Headers["Authorization"].FirstOrDefault();

        if (string.IsNullOrWhiteSpace( authorizationHeader))
        {
            return new UnauthorizedObjectResult( "Authorization token is required.");
        }

        // Check Bearer token
        if (!authorizationHeader.StartsWith( "Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return new UnauthorizedObjectResult( "Invalid authorization header.");
        }

        var token = authorizationHeader.Substring("Bearer ".Length).Trim();

        if (string.IsNullOrWhiteSpace(token))
        {
            return new UnauthorizedObjectResult("Authorization token is required.");
        }

        // Validate JWT
        var principal = _tokenService.ValidateToken(token);

        if (principal == null)
        {
            return new UnauthorizedObjectResult( "Invalid or expired token.");
        }

        // Check user role
        var isStorekeeper = principal.IsInRole("Storekeeper");

        var isStockManager = principal.IsInRole("Stock Manager");

        if (!isStorekeeper && !isStockManager)
        {
            return new ObjectResult( "You do not have permission to view Dispatch Notes.")
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
        }

        try
        {
            // Get Dispatch Notes from service
            var dispatchNotes = await _dispatchNoteService.GetAllDispatchNotesAsync();

            // Convert entities to DTOs
            var response = dispatchNotes.Select(dispatchNote => new DispatchNoteResponseDTO
                        {
                            DispatchNoteId = dispatchNote.DispatchNoteId,
                            Customer = dispatchNote.Customer,
                            Date = dispatchNote.Date,
                            DispatchItems = dispatchNote.DispatchItems
                                    .Select(item =>
                                        new DispatchItemResponseDTO
                                        {
                                            DispatchItemId = item.DispatchItemId,
                                            DispatchNoteId = item.DispatchNoteId,
                                            StockItemId = item.StockItemId,
                                            Quantity = item.Quantity,
                                            StockItem = item.StockItem == null
                                                    ? null
                                                    : new StockItemResponseDTO {
                                                        StockItemId = item.StockItem.StockItemId,
                                                        StockName = item.StockItem.StockName,
                                                        Category = item.StockItem.Category,
                                                        Unit = item.StockItem.Unit,
                                                        ReorderLevel = item.StockItem.ReorderLevel
                                                    }
                                        })
                                    .ToList()
                        })
                    .ToList();

            return new OkObjectResult(response);
        }
        catch (Exception ex)
        {
            _logger.LogError( ex, "Error occurred while getting Dispatch Note details.");

            return new ObjectResult( "Unable to retrieve Dispatch Notes.")
            {
                StatusCode = StatusCodes.Status500InternalServerError
            };
        }
    }
}