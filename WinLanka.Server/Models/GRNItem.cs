using System;
using System.Collections.Generic;
using System.Text;

namespace WinLanka.Server.Models
{
    public class GRNItem
    {
        public int GRNItemId { get; set; }
        public int GRNId { get; set; }
        public int StockItemId { get; set; }
        public int Quantity { get; set; }
        public GoodReceivedNote? GRN { get; set; }
        public StockItem? StockItem { get; set; }
    }
}
