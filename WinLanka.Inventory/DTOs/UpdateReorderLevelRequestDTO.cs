using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace WinLanka.Inventory.DTOs
{
    public class UpdateReorderLevelRequestDTO
    {
        [Range(0, int.MaxValue)]
        public int ReorderLevel { get; set; }
    }
}
