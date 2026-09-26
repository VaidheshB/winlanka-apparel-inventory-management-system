using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;
using WinLanka.Server.Models;
using WinLanka.Users.Repositories.Interfaces;
using WinLanka.Users.Services.Interfaces;

namespace WinLanka.Users.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly PasswordHasher<User> _passwordHasher;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
            _passwordHasher = new PasswordHasher<User>();
        }

        public async Task<User?> AuthenticateUserAsync(string username, string password)
        {
            var user = await _userRepository.GetUserByUsernameAsync(username);
            if (user == null)
            {
                return null;
            }
            if (user.IsActive != true)
            {
                return null;
            }
            var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.Password, password);
            if (verificationResult == PasswordVerificationResult.Success)
            {
                return user;
            }
            return null;
        }

        public async Task<bool> UpdateRefreshTokenAsync(User user,string refreshToken,DateTime expiryTime)
        {
            await _userRepository.UpdateRefreshTokenAsync(user,refreshToken,expiryTime);
            return true;
        }

        public async Task<User?> ValidateRefreshTokenAsync(string refreshToken)
        {
            var user = await _userRepository.GetUserByRefreshTokenAsync(refreshToken);

            if (user == null)
            {
                return null;
            }

            if (user.IsActive != true)
            {
                return null;
            }
            if (user.RefreshTokenExpiryTime != null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return null;
            }
            return user;
        }
    }
}
