using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using System;
using WinLanka.Inventory.Services.Interface;

namespace WinLanka.Inventory.Functions;

public class UpdateStockSummaryTimerFunction
{
    private readonly ILogger _logger;
    private readonly IStockSummaryService _stockSummaryService;

    public UpdateStockSummaryTimerFunction(ILoggerFactory loggerFactory, IStockSummaryService stockSummaryService)
    {
        _logger = loggerFactory.CreateLogger<UpdateStockSummaryTimerFunction>();
        _stockSummaryService = stockSummaryService;
    }

    [Function("UpdateStockSummaryTimerFunction")]
    public async Task Run([TimerTrigger("0 */5 * * * *")] TimerInfo myTimer)
    {
        _logger.LogInformation( "Stock Summary timer triggered at {Time}.", DateTime.UtcNow);

        try
        {
            await _stockSummaryService.UpdateAllStockSummariesAsync();

            _logger.LogInformation( "Stock Summary updated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError( ex, "Error while updating Stock Summary.");
        }
    }
}