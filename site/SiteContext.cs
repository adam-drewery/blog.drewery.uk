using System.Diagnostics;
using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace blog;

public class SiteContext
{
    private readonly HttpClient _http;

    private SiteContext(HttpClient http)
    {
        _http = http;
        BaseContentAddress = "https://raw.githubusercontent.com/adam-drewery/blog/main/content";
    }

    public const string GitHub = "https://github.com/adam-drewery";
    public const string StackOverflow = "https://stackoverflow.com/users/1228263/adam-drewery";
    public const string LinkedIn = "https://www.linkedin.com/in/adam-drewery-57678792/";
    
    public string BaseContentAddress { get; set; }
    
    public IList<PostDetails> Posts { get; } = new List<PostDetails>();
    
    public static async Task<SiteContext> InitializeAsync(HttpClient http)
    {
        var siteContext = new SiteContext(http);
        await siteContext.Reload();
        return siteContext;
    }

    public async Task Reload()
    {
        Posts.Clear();
        
        var indexUrl = BaseContentAddress +  "/index.json";
        const string commentDetailsUrl = "https://api.github.com/repos/adam-drewery/blog/issues";
        
        var posts = await _http.GetFromJsonAsync<IDictionary<string, PostDetails>>(indexUrl)
            ?? throw new InvalidDataException("Failed to get post index");
        try
        {
            var commentDetails = await _http.GetFromJsonAsync<CommentDetails[]>(commentDetailsUrl)
                                 ?? throw new InvalidDataException("Failed to get comments");

            foreach (var postComments in commentDetails)
            {
                var title = postComments.Title.Split("/").Last();
                var commentCount = postComments.Comments;

                if (posts.TryGetValue(title, out var post))
                    post.CommentCount = commentCount;
            }
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
        }

        foreach (var post in posts)
        {
            post.Value.Id = post.Key;
            Posts.Add(post.Value);
        }
    }
}

public class CommentDetails
{
    public string Title { get; set; } = null!;

    public int Comments { get; set; }
}

public class PostDetails
{
    public string Id { get; set; } = null!;

    public string Title { get; set; } = null!;
    
    public string Description { get; set; } = null!;
    
    public string Image { get; set; } = null!;
    
    public string Date { get; set; } = "";

    public string[] Tags { get; set; } = Array.Empty<string>();
    
    public int CommentCount { get; set; }
}

public class DateTimeConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        Debug.Assert(typeToConvert == typeof(DateTime));
        return DateTime.ParseExact(reader.GetString() ?? string.Empty, "dd-MM-yyyy", CultureInfo.InvariantCulture);
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString("dd-MM-yyyy", CultureInfo.InvariantCulture));
    }
}