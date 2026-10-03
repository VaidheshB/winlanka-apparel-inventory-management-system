using System;
using System.Collections.Generic;
using System.Text;

namespace WinLanka.Inventory.DTOs
{
    public class ReorderLevelUpdateResultDTO
    {
        public int StockItemId { get; set; }
        public string? StockName { get; set; }
        public int OldReorderLevel { get; set; }
        public int NewReorderLevel { get; set; }
    }
}
