using System;
using System.Collections.Generic;
using System.Text;

namespace WinLanka.Inventory.Services.Interface
{
    public interface IEmailService
    {
        Task SendReorderLevelUpdatedEmailAsync(string recipientEmail, string stockName, int stockItemId, int oldReorderLevel, int newReorderLevel);

    }
}
