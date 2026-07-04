using PisanteAtm.Domain.Entities;

namespace PisanteAtm.Domain.Interfaces;

public interface IAddressRepository : IRepository<Address>
{
    Task<IEnumerable<Address>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Address?> GetDefaultAsync(Guid userId, CancellationToken cancellationToken = default);
}
