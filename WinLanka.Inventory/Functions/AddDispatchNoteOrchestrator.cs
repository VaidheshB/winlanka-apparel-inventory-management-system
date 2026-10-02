using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.DurableTask;
using Microsoft.DurableTask.Client;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;
using WinLanka.Inventory.DTOs;
using WinLanka.Inventory.Security.Interfaces;
using WinLanka.Inventory.Services.Interface;

namespace WinLanka.Inventory.Functions;

public static class AddDispatchNoteOrchestrator
{


    [Function(nameof(AddDispatchNoteOrchestrator))]
    public static async Task<int> Orchestrator(
        [OrchestrationTrigger] TaskOrchestrationContext context)
    {
        var request = context.GetInput<AddDispatchNoteRequestDTO>();

        if (request == null)
        {
            throw new ArgumentNullException(
                nameof(request));
        }

        var dispatchNoteId = await context.CallActivityAsync<int>("AddDispatchNoteActivity", request); return dispatchNoteId;
    }

    [Function("AddDispatchNoteActivity")]
    public static async Task<int> AddDispatchNoteActivity([ActivityTrigger] AddDispatchNoteRequestDTO request, FunctionContext executionContext)
    {
        var logger = executionContext.GetLogger("AddDispatchNoteActivity");

        var dispatchNoteService = executionContext.InstanceServices.GetRequiredService<IDispatchNoteService>();

        logger.LogInformation("Adding Dispatch Note for customer {Customer}.", request.Customer);

        var dispatchNote = await dispatchNoteService.AddDispatchNoteAsync(request);

        logger.LogInformation("Dispatch Note {DispatchNoteId} added successfully.", dispatchNote.DispatchNoteId);

        return dispatchNote.DispatchNoteId;
    }

    [Function("AddDispatchNoteFunction")]
    public static async Task<HttpResponseData> HttpStart([HttpTrigger(AuthorizationLevel.Function, "post", Route = "adddispatch")] HttpRequestData req, [DurableClient] DurableTaskClient client, FunctionContext executionContext)
    {
        var logger = executionContext.GetLogger("AddDispatchNoteFunction");

        // 3.1 GET TOKEN SERVICE

        var tokenService = executionContext.InstanceServices.GetRequiredService<ITokenService>();

        // 3.2 CHECK AUTHORIZATION HEADER

        if (!req.Headers.TryGetValues("Authorization", out var authorizationHeaders))
        {
            return await CreateErrorResponse(req, HttpStatusCode.Unauthorized, "Authorization token is required.");
        }

        var authorizationHeader = authorizationHeaders.FirstOrDefault();

        if (string.IsNullOrWhiteSpace(authorizationHeader))
        {
            return await CreateErrorResponse(req, HttpStatusCode.Unauthorized, "Authorization token is required.");
        }

        // 3.3 CHECK BEARER TOKEN

        if (!authorizationHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return await CreateErrorResponse(req, HttpStatusCode.Unauthorized, "Invalid authorization header.");
        }

        var token = authorizationHeader.Substring("Bearer ".Length).Trim();

        if (string.IsNullOrWhiteSpace(token))
        {
            return await CreateErrorResponse(req, HttpStatusCode.Unauthorized, "Authorization token is required.");
        }

        // 3.4 VALIDATE JWT

        var principal = tokenService.ValidateToken(token);

        if (principal == null)
        {
            return await CreateErrorResponse(req, HttpStatusCode.Unauthorized, "Invalid or expired token.");
        }

        // 3.5 CHECK STOREKEEPER ROLE

        var isStorekeeper = principal.IsInRole("Storekeeper");

        if (!isStorekeeper)
        {
            return await CreateErrorResponse(req, HttpStatusCode.Forbidden, "Only Storekeepers can add Dispatch Notes.");
        }


        // 3.6 DESERIALIZE REQUEST BODY

        AddDispatchNoteRequestDTO? request;

        try
        {
            request = await JsonSerializer.DeserializeAsync<AddDispatchNoteRequestDTO>(req.Body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch (JsonException ex)
        {
            logger.LogError(ex, "Invalid Dispatch Note request body.");

            return await CreateErrorResponse(req, HttpStatusCode.BadRequest, "Invalid request body.");
        }

        if (request == null)
        {
            return await CreateErrorResponse(req, HttpStatusCode.BadRequest, "Request body is required.");
        }


        // 3.7 VALIDATE CUSTOMER

        if (string.IsNullOrWhiteSpace(request.Customer))
        {
            return await CreateErrorResponse(req, HttpStatusCode.BadRequest, "Customer name is required.");
        }


        // 3.8 VALIDATE DATE

        if (request.Date == default)
        {
            return await CreateErrorResponse(req, HttpStatusCode.BadRequest, "Date is required.");
        }

        // 3.9 VALIDATE ITEMS

        if (request.Items == null || request.Items.Count == 0)
        {
            return await CreateErrorResponse(req, HttpStatusCode.BadRequest, "At least one stock item is required.");
        }

        // 3.10 VALIDATE EACH ITEM
        foreach (var item in request.Items)
        {
            if (item.StockItemId <= 0)
            {
                return await CreateErrorResponse(req, HttpStatusCode.BadRequest, "Invalid stock item ID.");
            }

            if (item.Quantity <= 0)
            {
                return await CreateErrorResponse(req, HttpStatusCode.BadRequest, "Quantity must be greater than zero.");
            }
        }

        // 3.11 CHECK DUPLICATE STOCK ITEMS

        var duplicateStockItems = request.Items
                .GroupBy(item => item.StockItemId)
                .Where(group => group.Count() > 1)
                .Select(group => group.Key)
                .ToList();

        if (duplicateStockItems.Any())
        {
            return await CreateErrorResponse(req, HttpStatusCode.BadRequest, "The same stock item cannot be added more than once.");
        }

        // 3.12 START DURABLE ORCHESTRATION

        try
        {
            var instanceId = await client.ScheduleNewOrchestrationInstanceAsync(nameof(AddDispatchNoteOrchestrator), request);

            logger.LogInformation("Started Add Dispatch Note orchestration " + "with ID = '{InstanceId}'.", instanceId);

            // 3.13 RETURN 202 ACCEPTED

            var response = req.CreateResponse(HttpStatusCode.Accepted);

            await response.WriteAsJsonAsync(new { message = "Dispatch Note creation has been started.", instanceId });

            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unable to start Add Dispatch Note orchestration.");

            return await CreateErrorResponse(req, HttpStatusCode.InternalServerError, "Unable to start Dispatch Note creation.");
        }
    }

    private static async Task<HttpResponseData> CreateErrorResponse( HttpRequestData req, HttpStatusCode statusCode, string message)
    {
        var response = req.CreateResponse(statusCode);
        await response.WriteStringAsync( message);
        return response;
    }
}