using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Reflection.Emit;
using System.Text;
using WinLanka.Server.Models;

namespace WinLanka.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Scope> Scopes { get; set; }
        public DbSet<UserScope> UserScopes { get; set; }
        public DbSet<StockItem> StockItems { get; set; }
        public DbSet<GoodReceivedNote> GoodReceivedNotes { get; set; }
        public DbSet<GRNItem> GRNItems { get; set; }
        public DbSet<DispatchNote> DispatchNotes { get; set; }
        public DbSet<DispatchItem> DispatchItems { get; set; }
        public DbSet<StockSum> StockSums { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            // Configure the many-to-many relationship between User and Scope through UserScope
            modelBuilder.Entity<UserScope>()
                .HasKey(us => new { us.UserId, us.ScopeId });

            modelBuilder.Entity<UserScope>()
                .HasOne(us => us.User) // Each UserScope has one User
                .WithMany(u => u.UserScopes) // Each User can have many UserScopes
                .HasForeignKey(us => us.UserId);

            modelBuilder.Entity<UserScope>()
                .HasOne(us => us.Scope) // Each UserScope has one Scope
                .WithMany(s => s.UserScopes) // Each Scope can have many UserScopes
                .HasForeignKey(us => us.ScopeId);

            modelBuilder.Entity<GRNItem>()
                .HasOne(gi => gi.GRN) // Each GRNItem has one GoodReceivedNote
                .WithMany(grn => grn.GRNItems) // Each GoodReceivedNote can have many GRNItems
                .HasForeignKey(gi => gi.GRNId);

            modelBuilder.Entity<GRNItem>()
                .HasOne(gi => gi.StockItem) // Each GRNItem has one StockItem
                .WithMany(si => si.GRNItems) // Each StockItem can have many GRNItems
                .HasForeignKey(gi => gi.StockItemId);

            modelBuilder.Entity<DispatchItem>()
                .HasOne(di => di.DispatchNote) // Each DispatchItem has one DispatchNote
                .WithMany(dn => dn.DispatchItems) // Each DispatchNote can have many DispatchItems
                .HasForeignKey(di => di.DispatchNoteId);

            modelBuilder.Entity<DispatchItem>()
               .HasOne(di => di.StockItem) // Each DispatchItem has one StockItem
               .WithMany(si => si.DispatchItems) // Each StockItem can have many DispatchItems
               .HasForeignKey(di => di.StockItemId);


            // STOCK ITEM ↔ STOCK SUM
            modelBuilder.Entity<StockSum>()
               .HasOne<StockItem>()
               .WithOne()
               .HasForeignKey<StockSum>(ss => ss.StockItemId);


            // ONLY ONE STOCK SUM FOR EACH STOCK ITEM
            modelBuilder.Entity<StockSum>()
                .HasIndex(ss => ss.StockItemId)
                .IsUnique();


            // USERNAME MUST BE UNIQUE
            modelBuilder.Entity<User>()
                .HasIndex(u => u.UserName)
                .IsUnique();
        }
    }


}
