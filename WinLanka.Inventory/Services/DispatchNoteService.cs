using System;
using System.Collections.Generic;
using System.Text;
using WinLanka.Inventory.DTOs;
using WinLanka.Inventory.Repositories.Interface;
using WinLanka.Inventory.Services.Interface;
using WinLanka.Server.Models;

namespace WinLanka.Inventory.Services
{
    public class DispatchNoteService : IDispatchNoteService
    {
        private readonly IDispatchNoteRepository _dispatchNoteRepository;

        private readonly IStockItemRepository _stockItemRepository;

        public DispatchNoteService( IDispatchNoteRepository dispatchNoteRepository, IStockItemRepository stockItemRepository)
        {
           _dispatchNoteRepository = dispatchNoteRepository;

            _stockItemRepository =  stockItemRepository;
        }

        public async Task<DispatchNote> AddDispatchNoteAsync( AddDispatchNoteRequestDTO request)
        {
            // Get all requested stock item IDs
            var stockItemIds = request.Items
                    .Select(item => item.StockItemId)
                    .Distinct()
                    .ToList();

            // Check that the stock items exist
            var existingStockItemIds = await _stockItemRepository
                    .GetAllStockItemIDs(stockItemIds);

            var invalidStockItemIds = stockItemIds
                    .Except(existingStockItemIds)
                    .ToList();

            if (invalidStockItemIds.Any())
            {
                throw new ArgumentException( "The following stock item IDs do not exist: " + string.Join( ", ", invalidStockItemIds));
            }

            // Check available quantity
            foreach (var item in request.Items)
            {
                var totalReceived = await _dispatchNoteRepository.GetTotalReceivedQuantityAsync( item.StockItemId);

                var totalDispatched = await _dispatchNoteRepository.GetTotalDispatchedQuantityAsync( item.StockItemId);

                var availableQuantity = totalReceived - totalDispatched;

                if (item.Quantity > availableQuantity)
                {
                    throw new InvalidOperationException( $"Insufficient stock for Stock Item ID " + $"{item.StockItemId}. " + $"Available quantity: {availableQuantity}, " + $"requested quantity: {item.Quantity}.");
                }
            }

            // Create Dispatch Note
            var dispatchNote = new DispatchNote { Customer = request.Customer.Trim(), Date = request.Date };

            // Add Dispatch Items
            foreach (var item in request.Items)
            {
                dispatchNote.DispatchItems.Add( new DispatchItem { StockItemId = item.StockItemId, Quantity = item.Quantity });
            }

            return await _dispatchNoteRepository.AddDispatchNoteAsync(dispatchNote);
        }

        public async Task<List<DispatchNote>> GetAllDispatchNotesAsync()
        {
            return await _dispatchNoteRepository.GetAllDispatchNotesAsync();
        }
    }
}
