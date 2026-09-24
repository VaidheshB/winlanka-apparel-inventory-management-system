using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using WinLanka.Server.Models;

namespace WinLanka.Server.Models
{
    public class StockItem
    {
        [Key]
        public int StockItemId { get; set; }
        public string? StockName { get; set; }
        public string? Category { get; set; }
        public string? Unit { get; set; }
        public int ReorderLevel { get; set; }
        public ICollection<GRNItem> GRNItems { get; set; } = new List<GRNItem>();
        public ICollection<DispatchItem> DispatchItems { get; set; } = new List<DispatchItem>();

    }
}
