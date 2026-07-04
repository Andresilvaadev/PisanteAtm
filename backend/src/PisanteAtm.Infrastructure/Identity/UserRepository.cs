using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PisanteAtm.Application.Common;
using PisanteAtm.Application.Interfaces;
using PisanteAtm.Domain.Entities;
using PisanteAtm.Infrastructure.Data;

namespace PisanteAtm.Infrastructure.Identity;

public class UserRepository : IUserRepository
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _db;

    public UserRepository(UserManager<ApplicationUser> userManager, AppDbContext db)
    {
        _userManager = userManager;
        _db = db;
    }

    public async Task<bool> EmailExistsAsync(string email, CancellationToken ct = default) =>
        await _userManager.FindByEmailAsync(email) != null;

    public async Task<Guid> CreateUserAsync(string firstName, string lastName, string email, string password, string role, CancellationToken ct = default)
    {
        var user = new ApplicationUser
        {
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            UserName = email,
            EmailConfirmed = true
        };

        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
            throw new AppException(string.Join(", ", result.Errors.Select(e => e.Description)));

        await _userManager.AddToRoleAsync(user, role);
        return user.Id;
    }

    public async Task<UserCredentialsResult?> ValidateCredentialsAsync(string email, string password, CancellationToken ct = default)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null || !user.IsActive) return null;

        var valid = await _userManager.CheckPasswordAsync(user, password);
        if (!valid)
        {
            await _userManager.AccessFailedAsync(user);
            return null;
        }

        await _userManager.ResetAccessFailedCountAsync(user);
        var roles = await _userManager.GetRolesAsync(user);
        return new UserCredentialsResult(user.Id, user.Email!, user.FirstName, user.LastName, roles);
    }

    public async Task<RefreshTokenInfo?> GetRefreshTokenInfoAsync(string token, CancellationToken ct = default)
    {
        var rt = await _db.RefreshTokens
            .FirstOrDefaultAsync(r => r.Token == token, ct);

        if (rt == null) return null;

        var user = await _userManager.FindByIdAsync(rt.UserId.ToString());
        if (user == null) return null;

        var roles = await _userManager.GetRolesAsync(user);
        return new RefreshTokenInfo(
            user.Id, user.Email!, user.FirstName, user.LastName,
            roles, rt.IsActive);
    }

    public async Task AddRefreshTokenAsync(Guid userId, string token, string ipAddress, DateTime expiresAt, CancellationToken ct = default)
    {
        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = userId,
            Token = token,
            ExpiresAt = expiresAt,
            CreatedByIp = ipAddress
        });
        await _db.SaveChangesAsync(ct);
    }

    public async Task RotateRefreshTokenAsync(string oldToken, string newToken, string ipAddress, CancellationToken ct = default)
    {
        var rt = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.Token == oldToken, ct);
        if (rt == null) return;

        rt.RevokedAt = DateTime.UtcNow;
        rt.RevokedByIp = ipAddress;
        rt.ReplacedByToken = newToken;

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = rt.UserId,
            Token = newToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedByIp = ipAddress
        });

        // Clean up old expired/revoked tokens
        var old = await _db.RefreshTokens
            .Where(r => r.UserId == rt.UserId && !r.IsActive && r.CreatedAt < DateTime.UtcNow.AddDays(-7))
            .ToListAsync(ct);
        _db.RefreshTokens.RemoveRange(old);

        await _db.SaveChangesAsync(ct);
    }

    public async Task RevokeRefreshTokenAsync(string token, string ipAddress, CancellationToken ct = default)
    {
        var rt = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.Token == token, ct);
        if (rt == null) return;

        rt.RevokedAt = DateTime.UtcNow;
        rt.RevokedByIp = ipAddress;
        await _db.SaveChangesAsync(ct);
    }

    public async Task ChangePasswordAsync(Guid userId, string currentPassword, string newPassword, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
            ?? throw AppException.NotFound("User");

        var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        if (!result.Succeeded)
            throw new AppException(string.Join(", ", result.Errors.Select(e => e.Description)));
    }

    public async Task<IList<UserListItem>> GetAllCustomersAsync(CancellationToken ct = default)
    {
        var customers = await _userManager.GetUsersInRoleAsync("Customer");
        var tasks = customers.Select(async u =>
        {
            var roles = await _userManager.GetRolesAsync(u);
            return new UserListItem(u.Id, u.FirstName, u.LastName, u.Email!, u.IsActive, u.CreatedAt, roles);
        });
        return (await Task.WhenAll(tasks)).ToList();
    }
}
