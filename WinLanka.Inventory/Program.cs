using Azure.Monitor.OpenTelemetry.Exporter;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Azure.Functions.Worker.OpenTelemetry;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OpenTelemetry;
using Resend;
using WinLanka.Inventory.Repositories;
using WinLanka.Inventory.Repositories.Interface;
using WinLanka.Inventory.Security;
using WinLanka.Inventory.Security.Interfaces;
using WinLanka.Inventory.Services;
using WinLanka.Inventory.Services.Interface;
using WinLanka.Server.Data;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

if (!string.IsNullOrEmpty(Environment.GetEnvironmentVariable("APPLICATIONINSIGHTS_CONNECTION_STRING")))
{
    builder.Services.AddOpenTelemetry()
        .UseFunctionsWorkerDefaults()
        .UseAzureMonitorExporter();
}

builder.Services.AddDbContext<ApplicationDbContext>(
    options =>
        options.UseSqlServer(
            builder.Configuration
                .GetConnectionString("DefaultConnection")
        )
);

builder.Services.AddHttpClient<ResendClient>();

builder.Services.Configure<ResendClientOptions>(
    options =>
    {
        options.ApiToken =
            Environment.GetEnvironmentVariable(
                "ResendApiKey")!;
    });

builder.Services.AddTransient<IResend, ResendClient>();

builder.Services.AddScoped<IStockItemRepository,StockItemRepository>();
builder.Services.AddScoped<IGoodReceivedNoteRepository, GoodReceivedNoteRepository>();
builder.Services.AddScoped<IGoodReceivedNoteService, GoodReceivedNoteService>();
builder.Services.AddScoped<IDispatchNoteRepository, DispatchNoteRepository>();
builder.Services.AddScoped<IDispatchNoteService, DispatchNoteService>();
builder.Services.AddScoped<IStockItemRepository, StockItemRepository>();
builder.Services.AddScoped<IStockItemService,StockItemService>();
builder.Services.AddScoped<ITokenService,TokenService>();
builder.Services.AddScoped< IStockSummaryRepository, StockSummaryRepository>();
builder.Services.AddScoped< IStockSummaryService, StockSummaryService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Build().Run();
