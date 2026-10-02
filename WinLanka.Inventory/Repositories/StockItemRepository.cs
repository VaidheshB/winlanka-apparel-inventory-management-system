using WinLanka.Inventory.Repositories.Interface;
using WinLanka.Server.Data;
using WinLanka.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace WinLanka.Inventory.Repositories
{
    public class StockItemRepository : IStockItemRepository
    {
        private readonly ApplicationDbContext _context;

        public StockItemRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<StockItem>> GetAllStockItemsAsync()
        {
            return await _context.StockItems.OrderBy(s => s.StockItemId).ToListAsync();
        }

        public async Task<StockItem> AddStockItemAsync(StockItem stockItem)
        {
            _context.StockItems.Add(stockItem);
            await _context.SaveChangesAsync();
            return stockItem;
        }

        public async Task<List<int>> GetAllStockItemIDs(List<int> stockItemIds)
        {
            return await _context.StockItems
                .Where(stockItem =>stockItemIds.Contains(stockItem.StockItemId))
                .Select(stockItem =>stockItem.StockItemId)
                .ToListAsync();
        }

    }
}
