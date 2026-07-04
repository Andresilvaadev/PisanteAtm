namespace PisanteAtm.Domain.Entities;

public class Cart : BaseEntity
{
    public Guid UserId { get; set; }
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();

    public decimal Total => Items.Sum(i => i.Subtotal);
}
