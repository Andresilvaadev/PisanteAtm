namespace PisanteAtm.Domain.Entities;

public class ProductVariant : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string Size { get; set; } = string.Empty;
    public string? Color { get; set; }
    public string SKU { get; set; } = string.Empty;
    public int StockQuantity { get; set; } = 0;
    public decimal? PriceAdjustment { get; set; } = 0;
}
