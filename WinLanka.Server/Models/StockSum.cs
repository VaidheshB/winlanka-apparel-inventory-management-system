using System;
using System.Collections.Generic;
using System.Text;
using System.ComponentModel.DataAnnotations;

namespace WinLanka.Server.Models
{
    public class StockSum
    {
        [Key]
        public int StockSummaryId { get; set; }
        public int StockItemId { get; set; }
        public String? StockName { get; set; }
        public String? Category { get; set; }
        public String? Unit { get; set; }
        public int TotalReceived { get; set; }
        public int TotalDispatched { get; set; }
        public int AvailableQuantity { get; set; }

    }
}
