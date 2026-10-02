using System;
using System.Collections.Generic;
using System.Text;
using WinLanka.Inventory.DTOs;
using WinLanka.Server.Models;

namespace WinLanka.Inventory.Services.Interface
{
    public interface IDispatchNoteService
    {
        Task<DispatchNote> AddDispatchNoteAsync( AddDispatchNoteRequestDTO request);
        Task<List<DispatchNote>> GetAllDispatchNotesAsync();
    }
}
