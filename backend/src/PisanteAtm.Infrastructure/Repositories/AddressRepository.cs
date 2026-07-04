using Microsoft.EntityFrameworkCore;
using PisanteAtm.Domain.Entities;
using PisanteAtm.Domain.Interfaces;
using PisanteAtm.Infrastructure.Data;

namespace PisanteAtm.Infrastructure.Repositories;

public class AddressRepository : Repository<Address>, IAddressRepository
{
    public AddressRepository(AppDbContext db) : base(db) { }

    public async Task<IEnumerable<Address>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default) =>
        await _set.Where(a => a.UserId == userId && !a.IsDeleted).ToListAsync(cancellationToken);

    public async Task<Address?> GetDefaultAsync(Guid userId, CancellationToken cancellationToken = default) =>
        await _set.FirstOrDefaultAsync(a => a.UserId == userId && a.IsDefault, cancellationToken);
}
