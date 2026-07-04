namespace PisanteAtm.Application.Interfaces;

public interface IUserRepository
{
    Task<bool> EmailExistsAsync(string email, CancellationToken ct = default);
    Task<Guid> CreateUserAsync(string firstName, string lastName, string email, string password, string role, CancellationToken ct = default);
    Task<UserCredentialsResult?> ValidateCredentialsAsync(string email, string password, CancellationToken ct = default);
    Task<RefreshTokenInfo?> GetRefreshTokenInfoAsync(string token, CancellationToken ct = default);
    Task AddRefreshTokenAsync(Guid userId, string token, string ipAddress, DateTime expiresAt, CancellationToken ct = default);
    Task RotateRefreshTokenAsync(string oldToken, string newToken, string ipAddress, CancellationToken ct = default);
    Task RevokeRefreshTokenAsync(string token, string ipAddress, CancellationToken ct = default);
    Task ChangePasswordAsync(Guid userId, string currentPassword, string newPassword, CancellationToken ct = default);
    Task<IList<UserListItem>> GetAllCustomersAsync(CancellationToken ct = default);
}

public record UserCredentialsResult(Guid Id, string Email, string FirstName, string LastName, IList<string> Roles);

public record RefreshTokenInfo(Guid UserId, string Email, string FirstName, string LastName, IList<string> Roles, bool IsActive);

public record UserListItem(Guid Id, string FirstName, string LastName, string Email, bool IsActive, DateTime CreatedAt, IList<string> Roles);
