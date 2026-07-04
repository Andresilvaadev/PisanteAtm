namespace PisanteAtm.Application.DTOs.Auth;

public record AuthResponseDto(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserTokenDto User
);

public record UserTokenDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    IList<string> Roles
);
