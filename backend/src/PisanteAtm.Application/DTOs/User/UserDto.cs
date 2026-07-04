namespace PisanteAtm.Application.DTOs.User;

public record UserDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? CPF,
    DateTime? BirthDate,
    bool IsActive,
    IList<string> Roles,
    DateTime CreatedAt
);

public record UpdateProfileDto(
    string FirstName,
    string LastName,
    string? CPF,
    DateTime? BirthDate
);
