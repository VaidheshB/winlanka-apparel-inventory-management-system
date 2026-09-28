using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;
using WinLanka.Server.Models;
using WinLanka.Users.DTOs;
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

        public async Task<( bool Success,string? Error,User? User)>AddUserAsync(AddUserDTO data)
        {
           
            if (string.IsNullOrWhiteSpace(data.FirstName))
            {
                return (false,"First name is required.",null);
            }

            if (string.IsNullOrWhiteSpace(data.LastName))
            {
                return (false,"Last name is required.",null);
            }

            
            if (string.IsNullOrWhiteSpace(data.UserName))
            {
                return (false,"Username is required.",null);
            }

            var username =data.UserName.Trim();

            if (username.Length > 100)
            {
                return (false,"Username cannot exceed 100 characters.",null);
            }


            if (string.IsNullOrWhiteSpace(data.Password))
            {
                return (false,"Password is required.",null);
            }

            if (data.Password.Length < 8)
            {
                return (false,"Password must contain at least 8 characters.",null);
            }

            if (!data.Password.Any(char.IsUpper))
            {
                return (false,"Password must contain at least one uppercase letter.",null);
            }

            if (!data.Password.Any(char.IsLower))
            {
                return (false,"Password must contain at least one lowercase letter.",null);
            }

            if (!data.Password.Any(char.IsDigit))
            {
                return (false,"Password must contain at least one number.",null);
            }

            if (!data.Password.Any(ch => !char.IsLetterOrDigit(ch)))
            {
                return (false,"Password must contain at least one special character.",null);
            }

            if (data.Scopes == null ||data.Scopes.Count == 0)
            {
                return (false,"At least one scope must be selected.",null);
            }

            var requestedScopes =
                data.Scopes
                    .Where(s =>
                        !string.IsNullOrWhiteSpace(s))
                    .Select(s => s.Trim())
                    .Distinct(
                        StringComparer.OrdinalIgnoreCase)
                    .ToList();

            if (requestedScopes.Count == 0)
            {
                return (false,"At least one valid scope must be selected.",null);
            }

           
            var usernameExists =await _userRepository.UsernameExistsAsync(username);

            if (usernameExists)
            {
                return (false,"Username already exists.",null);
            }

           
            var scopes = await _userRepository.GetScopesByNamesAsync(requestedScopes);

            if (scopes.Count != requestedScopes.Count)
            {
                return (false,"One or more selected scopes are invalid.",null);
            }

           
            var user = new User
            {
                FirstName =data.FirstName.Trim(),

                LastName =data.LastName.Trim(),

                UserName =username,

                IsActive =data.IsActive,

                RefreshToken = null,

                RefreshTokenExpiryTime = null
            };

           
            user.Password =_passwordHasher.HashPassword(user,data.Password);

           
            var createdUser =await _userRepository.AddUserAsync(user,scopes);

            return (true,null,createdUser);
        
        }
    }
}
