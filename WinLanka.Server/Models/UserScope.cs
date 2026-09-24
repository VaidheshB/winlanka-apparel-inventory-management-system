using System;
using System.Collections.Generic;
using System.Text;

namespace WinLanka.Server.Models
{
    public class UserScope
    {
        public int UserId { get; set; }
        public User? User { get; set; }
        public int ScopeId { get; set; }
        public Scope? Scope { get; set; }

    }
}
