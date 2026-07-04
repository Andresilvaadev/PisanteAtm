namespace PisanteAtm.Application.DTOs.Auth;

public record ChangePasswordDto(
    string CurrentPassword,
    string NewPassword,
    string ConfirmNewPassword
);
