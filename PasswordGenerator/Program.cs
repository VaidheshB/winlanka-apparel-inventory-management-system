using Microsoft.AspNetCore.Identity;
using WinLanka.Server.Models;

var hasher = new PasswordHasher<User>();

var user = new User();

var hash = hasher.HashPassword(user, "Nbkv@123456");

Console.WriteLine("Password Hash:");
Console.WriteLine(hash);

Console.WriteLine();
Console.WriteLine("Press Enter to exit...");
Console.ReadLine();