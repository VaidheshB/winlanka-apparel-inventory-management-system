using System;
using System.Collections.Generic;
using System.Text;

namespace WinLanka.Users.DTOs
{
    public class TokenResponseDTO
    {
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
