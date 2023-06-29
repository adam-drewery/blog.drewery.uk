
using blog;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

var http = new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) };
var siteContext = await SiteContext.InitializeAsync(http);

builder.Services.AddScoped(_ => http);
builder.Services.AddScoped(_ => siteContext);

await builder.Build().RunAsync();