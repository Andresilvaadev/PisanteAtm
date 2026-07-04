using Microsoft.Extensions.Configuration;
using PisanteAtm.Application.Common;
using PisanteAtm.Application.Interfaces;

namespace PisanteAtm.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _uploadPath;
    private readonly string _baseUrl;
    private readonly string[] _allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    private const long MaxFileSize = 5 * 1024 * 1024; // 5MB

    public LocalFileStorageService(IConfiguration config)
    {
        _uploadPath = config["Storage:UploadPath"] ?? "uploads";
        _baseUrl = config["Storage:BaseUrl"] ?? "http://localhost:5000/uploads";
    }

    public async Task<string> SaveAsync(Stream stream, string fileName, string folder, CancellationToken cancellationToken = default)
    {
        if (stream.Length > MaxFileSize)
            throw new AppException("File too large. Maximum size is 5MB.");

        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        if (!_allowedExtensions.Contains(ext))
            throw new AppException($"File type not allowed. Allowed: {string.Join(", ", _allowedExtensions)}");

        var safeFileName = $"{Guid.NewGuid()}{ext}";
        var folderPath = Path.Combine(_uploadPath, folder);
        Directory.CreateDirectory(folderPath);

        var fullPath = Path.Combine(folderPath, safeFileName);

        await using var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write);
        stream.Position = 0;
        await stream.CopyToAsync(fileStream, cancellationToken);

        return $"{folder}/{safeFileName}";
    }

    public Task DeleteAsync(string filePath, CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_uploadPath, filePath);
        if (File.Exists(fullPath))
            File.Delete(fullPath);
        return Task.CompletedTask;
    }

    public string GetPublicUrl(string filePath) => $"/uploads/{filePath}";
}
