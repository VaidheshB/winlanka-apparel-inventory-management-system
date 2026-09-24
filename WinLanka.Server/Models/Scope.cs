using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using WinLanka.Server.Models;

namespace WinLanka.Server.Models
{
    public class Scope
    {
        [Key]
        public int ScopeId { get; set; }
        public string? ScopeName { get; set; }
        public ICollection<UserScope>? UserScopes { get; set; }
    }
}
