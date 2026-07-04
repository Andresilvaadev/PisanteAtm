using Microsoft.AspNetCore.Identity;
using PisanteAtm.Domain.Entities;

namespace PisanteAtm.Infrastructure.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? CPF { get; set; }
    public DateTime? BirthDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Address> Addresses { get; set; } = new List<Address>();
    public ICollection<ProductReview> Reviews { get; set; } = new List<ProductReview>();
    public List<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public Cart? Cart { get; set; }
}
