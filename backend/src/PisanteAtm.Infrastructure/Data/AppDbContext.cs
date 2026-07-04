using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PisanteAtm.Domain.Entities;
using PisanteAtm.Infrastructure.Identity;

// ApplicationUser in this file refers to Infrastructure.Identity.ApplicationUser
// (the concrete class), aliased here to avoid ambiguity with Domain.Entities.ApplicationUser.
using AppUser = PisanteAtm.Infrastructure.Identity.ApplicationUser;

namespace PisanteAtm.Infrastructure.Data;

public class AppDbContext : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<ProductReview> ProductReviews => Set<ProductReview>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderStatusHistory> OrderStatusHistories => Set<OrderStatusHistory>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Rename Identity tables
        builder.Entity<AppUser>().ToTable("Users");
        builder.Entity<IdentityRole<Guid>>().ToTable("Roles");
        builder.Entity<IdentityUserRole<Guid>>().ToTable("UserRoles");
        builder.Entity<IdentityUserClaim<Guid>>().ToTable("UserClaims");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("UserLogins");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("UserTokens");

        // Product
        builder.Entity<Product>(e =>
        {
            e.HasQueryFilter(p => !p.IsDeleted);
            e.Property(p => p.Price).HasPrecision(18, 2);
            e.Property(p => p.DiscountPrice).HasPrecision(18, 2);
            e.HasIndex(p => p.Slug).IsUnique();
            e.HasOne(p => p.Category)
             .WithMany(c => c.Products)
             .HasForeignKey(p => p.CategoryId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Category
        builder.Entity<Category>(e =>
        {
            e.HasQueryFilter(c => !c.IsDeleted);
            e.HasIndex(c => c.Slug).IsUnique();
        });

        // Order — FK to Users table via UserId
        builder.Entity<Order>(e =>
        {
            e.Property(o => o.Subtotal).HasPrecision(18, 2);
            e.Property(o => o.ShippingCost).HasPrecision(18, 2);
            e.Property(o => o.Discount).HasPrecision(18, 2);
            e.Property(o => o.Total).HasPrecision(18, 2);
            e.HasIndex(o => o.OrderNumber).IsUnique();
            e.HasOne<AppUser>()
             .WithMany(u => u.Orders)
             .HasForeignKey(o => o.UserId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<OrderItem>(e =>
        {
            e.Property(i => i.UnitPrice).HasPrecision(18, 2);
            e.HasOne(i => i.Product)
             .WithMany(p => p.OrderItems)
             .HasForeignKey(i => i.ProductId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Cart
        builder.Entity<Cart>(e =>
        {
            e.HasOne<AppUser>()
             .WithOne(u => u.Cart)
             .HasForeignKey<Cart>(c => c.UserId);
        });

        builder.Entity<CartItem>(e =>
        {
            e.HasOne(i => i.Product)
             .WithMany(p => p.CartItems)
             .HasForeignKey(i => i.ProductId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // RefreshToken
        builder.Entity<RefreshToken>(e =>
        {
            e.HasOne<AppUser>()
             .WithMany(u => u.RefreshTokens)
             .HasForeignKey(r => r.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ProductReview
        builder.Entity<ProductReview>(e =>
        {
            e.HasOne<AppUser>()
             .WithMany(u => u.Reviews)
             .HasForeignKey(r => r.UserId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Address
        builder.Entity<Address>(e =>
        {
            e.HasOne<AppUser>()
             .WithMany(u => u.Addresses)
             .HasForeignKey(a => a.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ProductVariant
        builder.Entity<ProductVariant>(e =>
        {
            e.Property(v => v.PriceAdjustment).HasPrecision(18, 2);
            e.HasIndex(v => v.SKU).IsUnique();
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is BaseEntity baseEntity && entry.State == EntityState.Modified)
                baseEntity.UpdatedAt = DateTime.UtcNow;
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
