using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace WinLanka.Server.Models
{
    public class GoodReceivedNote
    {
        [Key]
        public int GoodReceivedNoteId { get; set; }
        public string? Supplier { get; set; }
        public DateTime Date { get; set; }
        public ICollection<GRNItem> GRNItems { get; set; } = new List<GRNItem>();
    }
}
