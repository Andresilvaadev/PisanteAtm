namespace PisanteAtm.Application.DTOs.Auth;

public record RegisterDto(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string ConfirmPassword,
    string? CPF = null,
    DateTime? BirthDate = null
);
