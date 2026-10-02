using System.ComponentModel.DataAnnotations;

namespace WinLanka.Inventory.DTOs
{
    public class AddDispatchNoteRequestDTO
    {
        [Required]
        public string Customer { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        [MinLength(1)]
        public List<DispatchItemRequest> Items { get; set; } = new List<DispatchItemRequest>();
    }

    public class DispatchItemRequest
    {
        [Required]
        public int StockItemId { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }
}
