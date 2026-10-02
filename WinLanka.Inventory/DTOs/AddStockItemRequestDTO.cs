using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace WinLanka.Inventory.DTOs
{
    public  class AddStockItemRequestDTO
    {
        [Required]
        public string StockName { get; set; }

        [Required]
        public string Category { get; set; }

        [Required]
        public string Unit { get; set; }

        [Range(0, int.MaxValue)]
        public int ReorderLevel { get; set; }
    }
}
