using System;
using System.Collections.Generic;
using System.Text;
using WinLanka.Server.Models;

namespace WinLanka.Inventory.Repositories.Interface
{
    public interface IDispatchNoteRepository
    {
        Task<DispatchNote> AddDispatchNoteAsync( DispatchNote dispatchNote);
        Task<int> GetTotalReceivedQuantityAsync( int stockItemId);
        Task<int> GetTotalDispatchedQuantityAsync( int stockItemId);
        Task<List<DispatchNote>> GetAllDispatchNotesAsync();
    }
}
