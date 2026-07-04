using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using PisanteAtm.Application.Common;
using PisanteAtm.Application.DTOs.Auth;
using PisanteAtm.Application.Interfaces;

namespace PisanteAtm.Application.Services;

// AuthService depends on IUserRepository abstraction to avoid coupling to Identity types
public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    public AuthService(IUserRepository users, IConfiguration config, ILogger<AuthService> logger)
    {
        _users = users;
        _config = config;
        _logger = logger;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken = default)
    {
        if (dto.Password != dto.ConfirmPassword)
            throw new AppException("Passwords do not match.");

        var exists = await _users.EmailExistsAsync(dto.Email, cancellationToken);
        if (exists) throw AppException.Conflict("Email already registered.");

        var userId = await _users.CreateUserAsync(dto.FirstName, dto.LastName, dto.Email, dto.Password, "Customer", cancellationToken);
        _logger.LogInformation("New user registered: {Email}", dto.Email);

        return await GenerateAuthResponseAsync(userId, dto.Email, dto.FirstName, dto.LastName, ["Customer"], "::1", cancellationToken);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto, string ipAddress, CancellationToken cancellationToken = default)
    {
        var userInfo = await _users.ValidateCredentialsAsync(dto.Email, dto.Password, cancellationToken);
        if (userInfo == null)
        {
            _logger.LogWarning("Failed login attempt: {Email} from {IP}", dto.Email, ipAddress);
            throw AppException.Unauthorized("Invalid credentials.");
        }

        _logger.LogInformation("User logged in: {Email}", dto.Email);
        return await GenerateAuthResponseAsync(userInfo.Id, userInfo.Email, userInfo.FirstName, userInfo.LastName, userInfo.Roles, ipAddress, cancellationToken);
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string token, string ipAddress, CancellationToken cancellationToken = default)
    {
        var tokenInfo = await _users.GetRefreshTokenInfoAsync(token, cancellationToken)
            ?? throw AppException.Unauthorized("Invalid refresh token.");

        if (!tokenInfo.IsActive)
        {
            _logger.LogWarning("Inactive refresh token from IP: {IP}", ipAddress);
            throw AppException.Unauthorized("Invalid refresh token.");
        }

        var newTokenValue = GenerateRefreshTokenValue();
        await _users.RotateRefreshTokenAsync(token, newTokenValue, ipAddress, cancellationToken);

        return await GenerateAuthResponseAsync(
            tokenInfo.UserId, tokenInfo.Email, tokenInfo.FirstName, tokenInfo.LastName,
            tokenInfo.Roles, ipAddress, cancellationToken, newTokenValue);
    }

    public async Task RevokeTokenAsync(string token, string ipAddress, CancellationToken cancellationToken = default)
    {
        var info = await _users.GetRefreshTokenInfoAsync(token, cancellationToken)
            ?? throw AppException.Unauthorized("Invalid refresh token.");

        if (!info.IsActive) throw AppException.Unauthorized("Token already revoked.");
        await _users.RevokeRefreshTokenAsync(token, ipAddress, cancellationToken);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto, CancellationToken cancellationToken = default)
    {
        if (dto.NewPassword != dto.ConfirmNewPassword)
            throw new AppException("New passwords do not match.");

        await _users.ChangePasswordAsync(userId, dto.CurrentPassword, dto.NewPassword, cancellationToken);
    }

    private async Task<AuthResponseDto> GenerateAuthResponseAsync(
        Guid userId, string email, string firstName, string lastName,
        IList<string> roles, string ipAddress, CancellationToken ct,
        string? existingRefreshToken = null)
    {
        var refreshToken = existingRefreshToken ?? GenerateRefreshTokenValue();
        if (existingRefreshToken == null)
            await _users.AddRefreshTokenAsync(userId, refreshToken, ipAddress, DateTime.UtcNow.AddDays(7), ct);

        var accessToken = GenerateJwtToken(userId, email, firstName, lastName, roles);
        var expiresAt = DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpiresInMinutes"] ?? "60"));

        return new AuthResponseDto(
            AccessToken: accessToken,
            RefreshToken: refreshToken,
            ExpiresAt: expiresAt,
            User: new UserTokenDto(userId, firstName, lastName, email, roles)
        );
    }

    private string GenerateJwtToken(Guid userId, string email, string firstName, string lastName, IList<string> roles)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Secret"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpiresInMinutes"] ?? "60"));

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("firstName", firstName),
            new("lastName", lastName)
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshTokenValue() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
}
