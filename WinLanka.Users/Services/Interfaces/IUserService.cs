using System;
using System.Collections.Generic;
using System.Text;
using WinLanka.Server.Models;
using WinLanka.Users.DTOs;

namespace WinLanka.Users.Services.Interfaces
{
    public interface IUserService
    {
        Task<User?>AuthenticateUserAsync(string username, string password);
        Task<bool> UpdateRefreshTokenAsync(User user, string refreshToken, DateTime expiryTime);
        Task<User?> ValidateRefreshTokenAsync(string refreshToken);
        Task<(bool Success, string? Error, User? User)>AddUserAsync(AddUserDTO data);
        Task<(bool Success, string? Error, User? User)>UpdateUserAsync(int userId, UpdateUserDTO data);
        Task<List<UserDTO>> GetAllUsersAsync();

    }
}
