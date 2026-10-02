using Microsoft.EntityFrameworkCore;
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
    public class GoodReceivedNoteService : IGoodReceivedNoteService
    {
        private readonly IGoodReceivedNoteRepository _goodReceivedNoteRepository;
        private readonly IStockItemRepository _stockItemRepository;


        public GoodReceivedNoteService(IGoodReceivedNoteRepository goodReceivedNoteRepository, IStockItemRepository stockItemRepository)
        {
           _goodReceivedNoteRepository = goodReceivedNoteRepository;
            _stockItemRepository = stockItemRepository;

        }

        public async Task<List<GRNResponseDTO>> GetAllGoodReceivedNotesAsync()
        {
            var goodReceivedNotes =await _goodReceivedNoteRepository.GetAllGoodReceivedNotesAsync();

            return goodReceivedNotes
                .Select(grn => new GRNResponseDTO
                {
                    GoodReceivedNoteId = grn.GoodReceivedNoteId,
                    Supplier = grn.Supplier,
                    Date = grn.Date,

                    GRNItems = grn.GRNItems
                        .Select(item => new GRNItemResponseDTO
                        {
                            GRNItemId = item.GRNItemId,
                            GRNId = item.GRNId,
                            StockItemId = item.StockItemId,
                            Quantity = item.Quantity,

                            StockItem = new StockItemResponseDTO
                            {
                                StockItemId =
                                    item.StockItem.StockItemId,

                                StockName =
                                    item.StockItem.StockName,

                                Category =
                                    item.StockItem.Category,

                                Unit =
                                    item.StockItem.Unit,

                                ReorderLevel =
                                    item.StockItem.ReorderLevel
                            }
                        })
                        .ToList()
                })
                .ToList();
        }

        public async Task<GoodReceivedNote> AddGoodReceivedNoteAsync(AddGoodReceivedNoteRequestDTO request)
        {
            var stockItemIds = request.Items
                               .Select(item => item.StockItemId)
                               .Distinct()
                               .ToList();

            var existingStockItemIds = await _stockItemRepository.GetAllStockItemIDs(stockItemIds);

            var invalidStockItemIds =stockItemIds.Except(existingStockItemIds).ToList();

            if (invalidStockItemIds.Any())
            {
                throw new ArgumentException( $"The following stock item IDs do not exist: " + $"{string.Join(", ", invalidStockItemIds)}");
            }

            var goodReceivedNote =
                new GoodReceivedNote
                {
                    Supplier = request.Supplier.Trim(),
                    Date = request.Date
                };

            foreach (var item in request.Items)
            {
                goodReceivedNote.GRNItems.Add(
                    new GRNItem
                    {
                        StockItemId = item.StockItemId,
                        Quantity = item.Quantity
                    }
                );
            }

            return await _goodReceivedNoteRepository.AddGoodReceivedNoteAsync( goodReceivedNote);
        }
    }
}
