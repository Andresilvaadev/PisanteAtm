using PisanteAtm.Domain.Enums;

namespace PisanteAtm.Domain.Entities;

public class OrderStatusHistory : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public OrderStatus Status { get; set; }
    public string? Comment { get; set; }
    public Guid? ChangedByUserId { get; set; }
}
