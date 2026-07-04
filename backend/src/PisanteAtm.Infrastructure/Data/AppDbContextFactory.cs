using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace PisanteAtm.Infrastructure.Data;

// Used only by EF Core tools (dotnet ef migrations). Never runs in production.
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseMySql(
                "Server=127.0.0.1;Port=3306;Database=Pisanteatm;User=root;Password=andredev;",
                ServerVersion.Parse("8.0.0-mysql"))
            .Options;

        return new AppDbContext(options);
    }
}
