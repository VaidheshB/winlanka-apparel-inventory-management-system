using System;
using System.Collections.Generic;
using System.Text;

namespace WinLanka.Server.Models
{
    public class DispatchItem
    {
        public int DispatchItemId { get; set; }
        public int DispatchNoteId { get; set; }
        public int StockItemId { get; set; }
        public int Quantity { get; set; }
        public DispatchNote? DispatchNote { get; set; }
        public StockItem? StockItem { get; set; }

    }
}
