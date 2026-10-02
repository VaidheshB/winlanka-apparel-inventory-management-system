using System;
using System.Collections.Generic;
using System.Text;
using WinLanka.Inventory.DTOs;

namespace WinLanka.Inventory.Services.Interface
{
    public interface IStockSummaryService
    {
        Task UpdateAllStockSummariesAsync();

        Task<List<StockSummaryResponseDTO>> GetAllStockSummariesAsync();

        Task UpdateReorderLevelAsync( int stockItemId, int reorderLevel);
    }
}
