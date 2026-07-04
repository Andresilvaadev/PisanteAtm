namespace PisanteAtm.Domain.Entities;

public class CartItem : BaseEntity
{
    public Guid CartId { get; set; }
    public Cart Cart { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public Guid? VariantId { get; set; }
    public ProductVariant? Variant { get; set; }
    public int Quantity { get; set; } = 1;

    public decimal Subtotal => (Product?.DiscountPrice ?? Product?.Price ?? 0) * Quantity;
}
