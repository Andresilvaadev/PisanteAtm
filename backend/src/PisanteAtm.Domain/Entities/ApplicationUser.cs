namespace PisanteAtm.Domain.Entities;

// Placeholder — keeps domain compilation clean.
// The concrete class (inheriting IdentityUser<Guid>) lives in Infrastructure.
// Domain entities reference UserId (Guid) only, never the Identity class directly.
public abstract class ApplicationUser
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Email { get; set; }
}
