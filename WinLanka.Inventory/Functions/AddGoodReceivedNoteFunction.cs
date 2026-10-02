using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;
using WinLanka.Inventory.DTOs;
using WinLanka.Inventory.Security.Interfaces;
using WinLanka.Inventory.Services.Interface;

namespace WinLanka.Inventory.Functions;

public class AddGoodReceivedNoteFunction
{
    private readonly ILogger<AddGoodReceivedNoteFunction> _logger;
    private readonly ITokenService _tokenService;
    private readonly IGoodReceivedNoteService _goodReceivedNoteService;

    public AddGoodReceivedNoteFunction( ILogger<AddGoodReceivedNoteFunction> logger, ITokenService tokenService, IGoodReceivedNoteService goodReceivedNoteService)
    {
        _logger = logger;
        _tokenService = tokenService;
        _goodReceivedNoteService = goodReceivedNoteService;
    }

    [Function("AddGoodReceivedNoteFunction")]
    public async Task<HttpResponseData> Run( [HttpTrigger( AuthorizationLevel.Function, "post", Route = "addgrn")] HttpRequestData req)
    {
        // 1. Check Authorization header

        if (!req.Headers.TryGetValues( "Authorization", out var authorizationHeaders))
        {
            return await CreateErrorResponse( req, HttpStatusCode.Unauthorized, "Authorization token is required." );
        }

        var authorizationHeader = authorizationHeaders.FirstOrDefault();

        if (string.IsNullOrWhiteSpace(authorizationHeader))
        {
            return await CreateErrorResponse( req, HttpStatusCode.Unauthorized,"Authorization token is required." );
        }

        // 2. Check Bearer token

        if (!authorizationHeader.StartsWith( "Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return await CreateErrorResponse( req, HttpStatusCode.Unauthorized, "Invalid authorization header." );
        }

        var token = authorizationHeader.Substring("Bearer ".Length).Trim();

        if (string.IsNullOrWhiteSpace(token))
        {
            return await CreateErrorResponse( req, HttpStatusCode.Unauthorized, "Authorization token is required." );
        }

        // 3. Validate JWT

        var principal = _tokenService.ValidateToken(token);

        if (principal == null)
        {
            return await CreateErrorResponse( req, HttpStatusCode.Unauthorized, "Invalid or expired token." );
        }

        // 4. Check Storekeeper role

        var isStorekeeper = principal.IsInRole("Storekeeper");

        if (!isStorekeeper)
        {
            return await CreateErrorResponse( req, HttpStatusCode.Forbidden, "Only Storekeepers can add GRN items." );
        }

        // 5. Deserialize request body

        AddGoodReceivedNoteRequestDTO? request;

        try
        {
            request = await JsonSerializer.DeserializeAsync <AddGoodReceivedNoteRequestDTO>( req.Body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true } );
        }
        catch (JsonException ex)
        {
            _logger.LogError( ex, "Invalid GRN request body." );
            return await CreateErrorResponse( req, HttpStatusCode.BadRequest, "Invalid request body." );
        }

        if (request == null)
        {
            return await CreateErrorResponse( req, HttpStatusCode.BadRequest, "Request body is required." );
        }

        // 6. Validate supplier

        if (string.IsNullOrWhiteSpace(request.Supplier))
        {
            return await CreateErrorResponse( req, HttpStatusCode.BadRequest, "Supplier name is required." );
        }

        // 7. Validate date

        if (request.Date == default)
        {
            return await CreateErrorResponse( req, HttpStatusCode.BadRequest, "Date is required." );
        }

        // 8. Validate items

        if (request.Items == null || request.Items.Count == 0)
        {
            return await CreateErrorResponse( req, HttpStatusCode.BadRequest, "At least one stock item is required." );
        }

        // 9. Validate each item

        foreach (var item in request.Items)
        {
            if (item.StockItemId <= 0)
            {
                return await CreateErrorResponse( req, HttpStatusCode.BadRequest, "Invalid stock item ID." );
            }

            if (item.Quantity <= 0)
            {
                return await CreateErrorResponse( req, HttpStatusCode.BadRequest, "Quantity must be greater than zero." );
            }
        }

        // 10. Check duplicate stock items

        var duplicateStockItems = request.Items
                .GroupBy(item => item.StockItemId)
                .Where(group => group.Count() > 1)
                .Select(group => group.Key)
                .ToList();

        if (duplicateStockItems.Any())
        {
            return await CreateErrorResponse( req, HttpStatusCode.BadRequest, "The same stock item cannot be added more than once." );
        }

        // 11. Add GRN

        try
        {
            var goodReceivedNote = await _goodReceivedNoteService.AddGoodReceivedNoteAsync(request);
            _logger.LogInformation( "Good Received Note {GRNId} added successfully.", goodReceivedNote.GoodReceivedNoteId );
            var response = req.CreateResponse( HttpStatusCode.Created );
            await response.WriteStringAsync( "Good Received Note added successfully.");
            return response;
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning( ex, "Invalid stock item supplied for GRN." );

            return await CreateErrorResponse( req, HttpStatusCode.BadRequest, ex.Message );
        }
        catch (Exception ex)
        {
            _logger.LogError( ex, "Error while adding Good Received Note." );

            return await CreateErrorResponse( req, HttpStatusCode.InternalServerError, "Unable to add Good Received Note." );
        }
    }

    private static async Task<HttpResponseData> CreateErrorResponse( HttpRequestData req, HttpStatusCode statusCode, string message)
    {
        var response = req.CreateResponse(statusCode);
        await response.WriteStringAsync( message );
        return response;
    }
}