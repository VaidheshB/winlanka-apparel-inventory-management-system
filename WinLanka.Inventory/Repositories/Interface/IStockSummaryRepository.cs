using System;
using System.Collections.Generic;
using System.Text;
using WinLanka.Server.Models;

namespace WinLanka.Inventory.Repositories.Interface
{
    public interface IStockSummaryRepository
    {
        Task<List<StockSum>> GetAllStockSummariesAsync();

        Task UpdateStockSummaryAsync( StockSum stockSum);

        Task UpdateReorderLevelAsync( int stockItemId, int reorderLevel);
    }
}
