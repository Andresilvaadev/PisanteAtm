namespace PisanteAtm.Application.Common;

public class AppException : Exception
{
    public int StatusCode { get; }

    public AppException(string message, int statusCode = 400) : base(message)
    {
        StatusCode = statusCode;
    }

    public static AppException NotFound(string resource = "Resource") =>
        new($"{resource} not found.", 404);

    public static AppException Forbidden(string message = "Access denied.") =>
        new(message, 403);

    public static AppException Conflict(string message) =>
        new(message, 409);

    public static AppException Unauthorized(string message = "Unauthorized.") =>
        new(message, 401);
}
