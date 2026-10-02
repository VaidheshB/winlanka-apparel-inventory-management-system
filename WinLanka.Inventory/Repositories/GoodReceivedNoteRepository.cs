using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using WinLanka.Inventory.Repositories.Interface;
using WinLanka.Server.Data;
using WinLanka.Server.Models;

namespace WinLanka.Inventory.Repositories
{
    public class GoodReceivedNoteRepository : IGoodReceivedNoteRepository
    {
        private readonly ApplicationDbContext _context;

        public GoodReceivedNoteRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<GoodReceivedNote>> GetAllGoodReceivedNotesAsync()
        {
            return await _context.GoodReceivedNotes.Include(grn => grn.GRNItems)
                     .ThenInclude(item => item.StockItem)
                     .OrderByDescending(grn => grn.GoodReceivedNoteId)
                     .ToListAsync();

        }

        public async Task<GoodReceivedNote> AddGoodReceivedNoteAsync(GoodReceivedNote goodReceivedNote)
        {
            _context.GoodReceivedNotes.Add(goodReceivedNote);
            await _context.SaveChangesAsync();
            return goodReceivedNote;

        }

    }
}
