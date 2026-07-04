namespace PisanteAtm.Domain.Entities;

public class Address : BaseEntity
{
    public Guid UserId { get; set; }
    public string Label { get; set; } = "Casa";
    public string RecipientName { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string Number { get; set; } = string.Empty;
    public string? Complement { get; set; }
    public string Neighborhood { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = "BR";
    public bool IsDefault { get; set; } = false;
}
