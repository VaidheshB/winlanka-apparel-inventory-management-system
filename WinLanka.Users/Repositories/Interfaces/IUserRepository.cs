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
        Task<bool> UsernameExistsAsync(string username);
        Task<List<Scope>> GetScopesByNamesAsync(List<string> scopeNames);
        Task<User> AddUserAsync(User user,List<Scope> scopes);
        Task<User?> GetUserByIdAsync(int userId);
        Task<User> UpdateUserAsync( User user,List<Scope> scopes);
        Task<List<User>> GetAllUsersAsync();
    }
}
