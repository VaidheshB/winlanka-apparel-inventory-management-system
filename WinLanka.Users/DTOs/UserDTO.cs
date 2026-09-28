using System;
using System.Collections.Generic;
using System.Text;

namespace WinLanka.Users.DTOs
{
    public class UserDTO
    {
        public int UserId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? UserName { get; set; }
        public bool IsActive { get; set; }
        public List<string> Scopes { get; set; } = new List<string>();
    }
}
