using System;
using System.Collections.Generic;
using System.Text;
using WinLanka.Server.Models;

namespace WinLanka.Inventory.Repositories.Interface
{
    public interface IGoodReceivedNoteRepository
    {
        Task<List<GoodReceivedNote>> GetAllGoodReceivedNotesAsync();
        Task<GoodReceivedNote> AddGoodReceivedNoteAsync(GoodReceivedNote goodReceivedNote);
    }
}
