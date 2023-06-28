using System.Net.Http.Json;

namespace blog;

internal class SiteContext
{
    public const string GitHub = "https://github.com/adam-drewery";
    public const string StackOverflow = "https://stackoverflow.com/users/1228263/adam-drewery";
    public const string LinkedIn = "https://www.linkedin.com/in/adam-drewery-57678792/";
    
    public IList<PostDetails> Posts { get; } = new List<PostDetails>();
    
    public static string RssFeed { get; set; }

    public static async Task<SiteContext> InitializeAsync(HttpClient http)
    {
        var siteContext = new SiteContext();
        var posts = await http.GetFromJsonAsync<IDictionary<string, PostDetails>>("posts/index.json")
            ?? throw new InvalidDataException("Failed to get post index");
        
        foreach (var post in posts)
        {
            post.Value.Id = post.Key;
            siteContext.Posts.Add(post.Value);
        }

        return siteContext;
    }
}

internal class PostDetails
{
    public string Id { get; set; } = null!;

    public string Title { get; set; } = null!;

    public string Date { get; set; } = null!;

    public string[] Tags { get; set; } = Array.Empty<string>();
}