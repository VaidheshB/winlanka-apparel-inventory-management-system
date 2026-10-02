using System;
using System.Collections.Generic;
using System.Text;
using WinLanka.Inventory.DTOs;
using WinLanka.Server.Models;

namespace WinLanka.Inventory.Services.Interface
{
    public interface IStockItemService
    {
        Task<List<StockItem>> GetAllStockItemsAsync();
        Task<StockItem> AddStockItemAsync(AddStockItemRequestDTO request);
    }
}
