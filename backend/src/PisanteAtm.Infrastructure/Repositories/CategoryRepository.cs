using Microsoft.EntityFrameworkCore;
using PisanteAtm.Domain.Entities;
using PisanteAtm.Domain.Interfaces;
using PisanteAtm.Infrastructure.Data;

namespace PisanteAtm.Infrastructure.Repositories;

public class CategoryRepository : Repository<Category>, ICategoryRepository
{
    public CategoryRepository(AppDbContext db) : base(db) { }

    public async Task<Category?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default) =>
        await _set.Include(c => c.Products).FirstOrDefaultAsync(c => c.Slug == slug, cancellationToken);

    public async Task<IEnumerable<Category>> GetActiveAsync(CancellationToken cancellationToken = default) =>
        await _set.Where(c => c.IsActive && !c.IsDeleted).OrderBy(c => c.DisplayOrder).ToListAsync(cancellationToken);

    public override async Task<IEnumerable<Category>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _set.Include(c => c.Products).ToListAsync(cancellationToken);
}
