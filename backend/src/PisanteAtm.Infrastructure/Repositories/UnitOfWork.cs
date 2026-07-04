using Microsoft.EntityFrameworkCore.Storage;
using PisanteAtm.Domain.Entities;
using PisanteAtm.Domain.Interfaces;
using PisanteAtm.Infrastructure.Data;

namespace PisanteAtm.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _db;
    private IDbContextTransaction? _transaction;

    public IProductRepository Products { get; }
    public ICategoryRepository Categories { get; }
    public IOrderRepository Orders { get; }
    public ICartRepository Carts { get; }
    public IAddressRepository Addresses { get; }
    public IRepository<ProductImage> ProductImages { get; }

    public UnitOfWork(
        AppDbContext db,
        IProductRepository products,
        ICategoryRepository categories,
        IOrderRepository orders,
        ICartRepository carts,
        IAddressRepository addresses)
    {
        _db = db;
        Products = products;
        Categories = categories;
        Orders = orders;
        Carts = carts;
        Addresses = addresses;
        ProductImages = new Repository<ProductImage>(db);
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        await _db.SaveChangesAsync(cancellationToken);

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default) =>
        _transaction = await _db.Database.BeginTransactionAsync(cancellationToken);

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _db.Dispose();
    }
}
