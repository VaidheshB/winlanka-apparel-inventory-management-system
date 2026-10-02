using System;
using System.Collections.Generic;
using System.Text;
using WinLanka.Inventory.DTOs;
using WinLanka.Server.Models;

namespace WinLanka.Inventory.Services.Interface
{
    public interface IGoodReceivedNoteService
    {
        Task<List<GRNResponseDTO>> GetAllGoodReceivedNotesAsync();
        Task<GoodReceivedNote> AddGoodReceivedNoteAsync(AddGoodReceivedNoteRequestDTO request);
    }
}
