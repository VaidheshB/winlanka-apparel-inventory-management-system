using System;
using System.Collections.Generic;
using System.Text;
using WinLanka.Inventory.DTOs;
using WinLanka.Inventory.Repositories.Interface;
using WinLanka.Inventory.Security.Interfaces;
using WinLanka.Inventory.Services.Interface;
using WinLanka.Server.Models;

namespace WinLanka.Inventory.Services
{
    public class StockItemService : IStockItemService
    {
        private readonly IStockItemRepository _stockItemRepository;
       


        public StockItemService(IStockItemRepository stockItemRepository, ITokenService tokenService)
        {
            _stockItemRepository = stockItemRepository;

        }

        public async Task<List<StockItem>> GetAllStockItemsAsync()
        {
            return await _stockItemRepository
                .GetAllStockItemsAsync();
        }

        public async Task<StockItem> AddStockItemAsync(AddStockItemRequestDTO request)
        {
            var stockItem = new StockItem
            {
                StockName = request.StockName,
                Category = request.Category,
                Unit = request.Unit,
                ReorderLevel = request.ReorderLevel
            };

            return await _stockItemRepository.AddStockItemAsync(stockItem);
        }
    }
}
