using Microsoft.EntityFrameworkCore;
using WinLanka.Inventory.Repositories.Interface;
using WinLanka.Server.Data;
using WinLanka.Server.Models;

namespace WinLanka.Inventory.Repositories
{
    public class StockSummaryRepository : IStockSummaryRepository
    {
        private readonly ApplicationDbContext _context;

        public StockSummaryRepository( ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<StockSum>> GetAllStockSummariesAsync()
        {
            return await _context.StockSums
                .OrderBy(s => s.StockItemId)
                .ToListAsync();
        }

        public async Task UpdateStockSummaryAsync( StockSum stockSum)
        {
            _context.StockSums.Update(stockSum);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateReorderLevelAsync(
            int stockItemId,
            int reorderLevel)
        {
            var stockItem = await _context.StockItems.FirstOrDefaultAsync(
                        item => item.StockItemId == stockItemId);

            if (stockItem == null)
            {
                throw new ArgumentException( $"Stock Item ID {stockItemId} does not exist.");
            }

            stockItem.ReorderLevel = reorderLevel;

            await _context.SaveChangesAsync();
        }
    }
}
