namespace PisanteAtm.Domain.Entities;

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public Guid? VariantId { get; set; }
    public ProductVariant? Variant { get; set; }

    public string ProductName { get; set; } = string.Empty;
    public string? VariantSize { get; set; }
    public string? VariantColor { get; set; }
    public string? ProductImageUrl { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal Total => UnitPrice * Quantity;
}
