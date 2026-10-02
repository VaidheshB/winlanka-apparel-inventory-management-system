using System;
using System.Collections.Generic;
using System.Text;

namespace WinLanka.Inventory.DTOs
{
    public class DispatchNoteResponseDTO
    {
        public int DispatchNoteId { get; set; }
        public string Customer { get; set; }
        public DateTime Date { get; set; }
        public List<DispatchItemResponseDTO> DispatchItems { get; set; }
            = new List<DispatchItemResponseDTO>();
    }

    public class DispatchItemResponseDTO
    {
        public int DispatchItemId { get; set; }
        public int DispatchNoteId { get; set; }
        public int StockItemId { get; set; }
        public int Quantity { get; set; }
        public StockItemResponseDTO StockItem { get; set; }
    }
}
