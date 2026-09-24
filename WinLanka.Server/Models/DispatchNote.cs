using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;


namespace WinLanka.Server.Models
{
    public class DispatchNote
    {
        [Key]
        public int DispatchNoteId { get; set; }
        public string? Customer { get; set; }
        public DateTime Date { get; set; }
        public ICollection<DispatchItem> DispatchItems { get; set; } = new List<DispatchItem>();
    }
}
