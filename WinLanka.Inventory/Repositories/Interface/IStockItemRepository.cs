using System;
using System.Collections.Generic;
using System.Text;
using WinLanka.Server.Models;

namespace WinLanka.Inventory.Repositories.Interface
{
    public interface IStockItemRepository
    {
        Task<List<StockItem>> GetAllStockItemsAsync();
        Task<StockItem> AddStockItemAsync(StockItem stockItem);
        Task<List<int>> GetAllStockItemIDs(List<int>StockItemIDs);
    }
}
