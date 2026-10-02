using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;
using WinLanka.Inventory.Security.Interfaces;
using WinLanka.Inventory.Services.Interface;

namespace WinLanka.Inventory.Functions;

public class GetAllGoodReceivedNotesFunction
{
    private readonly ILogger<GetAllGoodReceivedNotesFunction> _logger;
    private readonly IGoodReceivedNoteService _goodReceivedNoteService;
    private readonly ITokenService _tokenService;

    public GetAllGoodReceivedNotesFunction( ILogger<GetAllGoodReceivedNotesFunction> logger, IGoodReceivedNoteService goodReceivedNoteService, ITokenService tokenService)
    {
        _logger = logger;
        _goodReceivedNoteService = goodReceivedNoteService;
        _tokenService = tokenService;
    }

    [Function("GetAllGoodReceivedNotesFunction")]
    public async Task<HttpResponseData> Run([HttpTrigger( AuthorizationLevel.Function, "get", Route = "grns")] HttpRequestData req)
    {
        // 1. Check Authorization header

        if (!req.Headers.TryGetValues( "Authorization",out var authorizationHeaders))
        {
            return await CreateErrorResponse( req, HttpStatusCode.Unauthorized, "Authorization token is required." );
        }

        var authorizationHeader =authorizationHeaders.FirstOrDefault();

        if (string.IsNullOrWhiteSpace(authorizationHeader))
        {
            return await CreateErrorResponse( req, HttpStatusCode.Unauthorized, "Authorization token is required." );
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

        // 4. Check roles

        var isStorekeeper = principal.IsInRole("Storekeeper");

        var isStockManager = principal.IsInRole("Stock Manager");

        if (!isStorekeeper && !isStockManager)
        {
            return await CreateErrorResponse( req, HttpStatusCode.Forbidden, "Only Storekeepers and Stock Managers can view GRNs." );
        }

        // 5. Get GRNs

        try
        {
            var goodReceivedNotes = await _goodReceivedNoteService.GetAllGoodReceivedNotesAsync();
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync( goodReceivedNotes );
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError( ex, "Unable to retrieve Good Received Notes." );

            return await CreateErrorResponse( req, HttpStatusCode.InternalServerError, "Unable to retrieve Good Received Notes." );
        }
    }

    private static async Task<HttpResponseData> CreateErrorResponse( HttpRequestData req, HttpStatusCode statusCode, string message)
    {
        var response = req.CreateResponse(statusCode);

        response.Headers.Remove("Content-Type");

        await response.WriteAsJsonAsync( new { message } );

        return response;
    }
}