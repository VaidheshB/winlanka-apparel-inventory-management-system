using System;
using System.Collections.Generic;
using System.Text;
using WinLanka.Server.Models;

namespace WinLanka.Users.Services.Interfaces
{
    public interface IUserService
    {
        Task<User?>AuthenticateUserAsync(string username, string password);
        Task<bool> UpdateRefreshTokenAsync(User user, string refreshToken, DateTime expiryTime);
        Task<User?> ValidateRefreshTokenAsync(string refreshToken);

    }
}
