using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using WinLanka.Server.Models;

namespace WinLanka.Users.Security.Interfaces
{
    public interface ITokenService
    {
        string GenerateToken(User user);
        string GenerateRefreshToken();
        ClaimsPrincipal? ValidateToken(string token);
    }
}
