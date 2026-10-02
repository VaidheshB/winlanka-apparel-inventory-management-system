using System;
using System.Collections.Generic;
using System.Text;

namespace WinLanka.Inventory.DTOs
{
    public class StockSummaryResponseDTO
    {
        public int StockSummaryId { get; set; }
        public int StockItemId { get; set; }
        public string StockName { get; set; }
        public string Category { get; set; }
        public string Unit { get; set; }
        public int TotalReceived { get; set; }
        public int TotalDispatched { get; set; }
        public int AvailableQuantity { get; set; }
        public int ReorderLevel { get; set; }
        public bool IsLowStock { get; set; }
    }
}
