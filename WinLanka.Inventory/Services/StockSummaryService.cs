using WinLanka.Inventory.DTOs;
using WinLanka.Inventory.Repositories.Interface;
using WinLanka.Inventory.Services.Interface;
using WinLanka.Server.Data;
using WinLanka.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace WinLanka.Inventory.Services
{
   public class StockSummaryService : IStockSummaryService
   {
        private readonly ApplicationDbContext _context;
        private readonly IStockSummaryRepository _stockSummaryRepository;

        public StockSummaryService( ApplicationDbContext context, IStockSummaryRepository stockSummaryRepository)
        {
            _context = context;
            _stockSummaryRepository = stockSummaryRepository;
        }

        public async Task UpdateAllStockSummariesAsync()
        {
            var stockItems = await _context.StockItems.OrderBy(item => item.StockItemId)
                    .ToListAsync();

            foreach (var stockItem in stockItems)
            {
                var totalReceived = await _context.GRNItems
                        .Where(item =>
                            item.StockItemId ==
                            stockItem.StockItemId)
                        .SumAsync(item =>
                            item.Quantity);

                var totalDispatched = await _context.DispatchItems
                        .Where(item =>
                            item.StockItemId ==
                            stockItem.StockItemId)
                        .SumAsync(item =>
                            item.Quantity);

                var availableQuantity =totalReceived - totalDispatched;

                var stockSummary = await _context.StockSums.FirstOrDefaultAsync(
                            summary => summary.StockItemId == stockItem.StockItemId);

                if (stockSummary == null)
                {
                    stockSummary = new StockSum
                        {
                            StockItemId = stockItem.StockItemId,
                            StockName = stockItem.StockName,
                            Category = stockItem.Category,
                            Unit = stockItem.Unit,
                            TotalReceived = totalReceived,
                            TotalDispatched = totalDispatched,
                            AvailableQuantity = availableQuantity
                        };

                    _context.StockSums.Add( stockSummary);
                }
                else
                {
                    stockSummary.StockName = stockItem.StockName;
                    stockSummary.Category = stockItem.Category;
                    stockSummary.Unit = stockItem.Unit;
                    stockSummary.TotalReceived = totalReceived;
                    stockSummary.TotalDispatched = totalDispatched;
                    stockSummary.AvailableQuantity = availableQuantity;
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task<List<StockSummaryResponseDTO>> GetAllStockSummariesAsync()
        {
            var stockSummaries = await _stockSummaryRepository.GetAllStockSummariesAsync();

            return stockSummaries.Select(summary =>
                    new StockSummaryResponseDTO
                    {
                        StockSummaryId = summary.StockSummaryId,

                        StockItemId = summary.StockItemId,

                        StockName = summary.StockName,

                        Category = summary.Category,

                        Unit = summary.Unit,

                        TotalReceived = summary.TotalReceived,

                        TotalDispatched = summary.TotalDispatched,

                        AvailableQuantity = summary.AvailableQuantity,

                        ReorderLevel = _context.StockItems
                                .Where(item => item.StockItemId == summary.StockItemId)
                                .Select(item => item.ReorderLevel)
                                .FirstOrDefault(),

                        IsLowStock = summary.AvailableQuantity <
                            _context.StockItems .Where(item =>
                                    item.StockItemId ==
                                    summary.StockItemId)
                                .Select(item =>
                                    item.ReorderLevel)
                                .FirstOrDefault()
                    })
                .ToList();
        }

        public async Task<ReorderLevelUpdateResultDTO> UpdateReorderLevelAsync(int stockItemId, int reorderLevel)
        {
            if (reorderLevel < 0)
            {
                throw new ArgumentException("Reorder level cannot be negative.");
            }

            var stockItem = await _context.StockItems.FirstOrDefaultAsync(item =>
                    item.StockItemId == stockItemId);

            if (stockItem == null)
            {
                throw new ArgumentException($"Stock Item ID {stockItemId} does not exist.");
            }

            var oldReorderLevel = stockItem.ReorderLevel;

            stockItem.ReorderLevel = reorderLevel;

            await _context.SaveChangesAsync();

            return new ReorderLevelUpdateResultDTO
            {
                StockItemId = stockItem.StockItemId,
                StockName = stockItem.StockName,
                OldReorderLevel = oldReorderLevel,
                NewReorderLevel = stockItem.ReorderLevel
            };
        }



    }


}
