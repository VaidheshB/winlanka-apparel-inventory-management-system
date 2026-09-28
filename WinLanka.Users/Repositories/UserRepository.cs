using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using WinLanka.Server.Data;
using WinLanka.Server.Models;
using WinLanka.Users.Repositories.Interfaces;

namespace WinLanka.Users.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            return await _context.Users
                .Include(u => u.UserScopes!)
                    .ThenInclude(us => us.Scope)
                .FirstOrDefaultAsync(u => u.UserName == username);
        }

        public async Task UpdateRefreshTokenAsync(User user,string refreshToken,DateTime expiryTime)
        {
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = expiryTime;

            await _context.SaveChangesAsync();
        }

        public async Task<User?> GetUserByRefreshTokenAsync(string refreshToken)
        {
            return await _context.Users
                .Include(u => u.UserScopes!)
                .ThenInclude(us => us.Scope)
                .FirstOrDefaultAsync(u=>u.RefreshToken == refreshToken);
        }

        public async Task<bool> UsernameExistsAsync(string username)
        {
            return await _context.Users
                .AnyAsync(u => u.UserName == username);
        }

        public async Task<List<Scope>> GetScopesByNamesAsync(
            List<string> scopeNames)
        {
            return await _context.Scopes
                .Where(s =>
                    s.ScopeName != null &&
                    scopeNames.Contains(s.ScopeName))
                .ToListAsync();
        }

        public async Task<User> AddUserAsync(User user, List<Scope> scopes)
        {
            user.UserScopes = new List<UserScope>();

            foreach (var scope in scopes)
            {
                user.UserScopes.Add(new UserScope { User = user, ScopeId = scope.ScopeId });
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

    }
}
