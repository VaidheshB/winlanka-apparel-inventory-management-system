using System;
using System.Collections.Generic;
using System.Text;

namespace WinLanka.Inventory.DTOs
{
    public class GRNResponseDTO
    {
        public int GoodReceivedNoteId { get; set; }
        public string? Supplier { get; set; }
        public DateTime Date { get; set; }

        public List<GRNItemResponseDTO> GRNItems { get; set; }
            = new List<GRNItemResponseDTO>();
    }

    public class GRNItemResponseDTO
    {
        public int GRNItemId { get; set; }
        public int GRNId { get; set; }
        public int StockItemId { get; set; }
        public int Quantity { get; set; }

        public StockItemResponseDTO? StockItem { get; set; }
    }

    public class StockItemResponseDTO
    {
        public int StockItemId { get; set; }
        public string? StockName { get; set; }
        public string? Category { get; set; }
        public string? Unit { get; set; }
        public int ReorderLevel { get; set; }
    }
}
