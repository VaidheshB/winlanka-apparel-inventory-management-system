using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using WinLanka.Server.Models;

namespace WinLanka.Inventory.DTOs
{
    public class AddGoodReceivedNoteRequestDTO
    {
        [Required]
        public string Supplier { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        [MinLength(1)]
        public List<GRNItemRequest> Items { get; set; }

    }

    public class GRNItemRequest
    {
        [Required]
        public int StockItemId { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }
}
