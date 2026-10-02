using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using WinLanka.Inventory.Repositories.Interface;
using WinLanka.Server.Data;
using WinLanka.Server.Models;

namespace WinLanka.Inventory.Repositories
{
    public class DispatchNoteRepository : IDispatchNoteRepository
    {
        private readonly ApplicationDbContext _context;
        public DispatchNoteRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DispatchNote> AddDispatchNoteAsync( DispatchNote dispatchNote)
        {
            _context.DispatchNotes.Add(dispatchNote);
            await _context.SaveChangesAsync();
            return dispatchNote;
        }

        public async Task<int> GetTotalReceivedQuantityAsync( int stockItemId)
        {
            return await _context.GRNItems
                                .Where(item => item.StockItemId == stockItemId)
                                .SumAsync(item => item.Quantity);
        }

        public async Task<int> GetTotalDispatchedQuantityAsync( int stockItemId)
        {
            return await _context.DispatchItems
                                    .Where(item => item.StockItemId == stockItemId)
                                    .SumAsync(item => item.Quantity);
        }

        public async Task<List<DispatchNote>> GetAllDispatchNotesAsync()
        {
            return await _context.DispatchNotes
                .Include(dn => dn.DispatchItems)
                .ThenInclude(item => item.StockItem)
                .OrderByDescending(dn => dn.DispatchNoteId)
                .ToListAsync();
        }
    }
}
