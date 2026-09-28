using System;
using System.Collections.Generic;
using System.Text;

namespace WinLanka.Users.DTOs
{
     public class AddUserDTO
        {
            public string? FirstName { get; set; }
            public string? LastName { get; set; }
            public string? UserName { get; set; }
            public string? Password { get; set; }
            public List<string>? Scopes { get; set; }
            public bool IsActive { get; set; }
        }
    
}
