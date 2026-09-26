using System;
using System.Collections.Generic;
using System.Text;
using WinLanka.Server.Models;

namespace WinLanka.Users.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetUserByUsernameAsync(string username);
        Task UpdateRefreshTokenAsync(User user,string refreshToken,DateTime expiryTime);
        Task<User?> GetUserByRefreshTokenAsync(string refreshToken);
    }
}
