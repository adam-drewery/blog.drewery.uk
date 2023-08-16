# LINQ Query Encapsulation

## Problem
Over the years I've seen a lot of different approaches to encapsulating LINQ queries. One of the most common approaches is to use some sort of Repository class that exposes methods containing specific queries. They usually look something like this:

```csharp
public class InvoiceRepository : IRepository<Invoice>
{
    public Invoice GetInvoiceById(int id)
    {
        return _context.Invoices.FirstOrDefault(x => x.Id == id);
    }

    public IEnumerable<Invoice> GetInvoicesForCustomerId(int customerId)
    {
        var now = DateTime.Now;
        return _context.Invoices
            .Include(x => x.Customer)
            .Where(x => x.CustomerId == customerId && x.Status == InvoiceStatus.Paid)
            .Where(x => x.PublishDate == null || x.PublishDate <= now)
            .OrderByDescending(x => x.Date)
            .Take(10);
    }
}
```

This approach has a few problems. First, it's not very flexible. If you need to query the same data in a slightly different way, you have to add a new method to the repository. Second, it's not very testable. If you want to test the logic that uses the repository, you have to mock the repository.

Furthermore- the second method there doesn't really say exactly what its doing. One might rationally presume that `GetInvoicesForCustomerId` _just_ retrieves invoices. But this one filters by other values, specifies includes, and orders the results.

Perhaps a more appropriate name for this method would be `GetInvoicesAndIncludeCustomerForCustomerIdAndStatusAndLimitToTen`. But that's a bit of a mouthful isn't it.

## Can't we parameterize it?

One approach to solving this problem is to parameterize the query method. We could do something like this:

```csharp
public IEnumerable<Invoice> GetInvoices(int? customerId = null, InvoiceStatus? status = null, int? limit = null)
{
    var now = DateTime.Now;
    var query = _context.Invoices
        .Include(x => x.Customer)
        .Where(x => x.PublishDate == null || x.PublishDate <= now);
    
    if (customerId.HasValue)
    {
        query = query.Where(x => x.CustomerId == customerId.Value);
    }
    
    if (status.HasValue)
    {
        query = query.Where(x => x.Status == status.Value);
    }
    
    if (limit.HasValue)
    {
        query = query.Take(limit.Value);
    }
    
    return query;
}
```

The obvious issues here are, your method signature is going to grow larger and larger as more things are parameterized. Sure, you could put all of these in some sort of `Filter` class, but still, its not clear to the client how these parameters are being concatenated. Are they ANDed together? ORed together? Are they mutually exclusive? It's not clear.  

## Business Logic vs. Presentation Logic

One of the fundamental issues here is that we're trying to encapsulate two different things in the same method. We're trying to encapsulate the business logic of retrieving invoices, what makes an invoice viewable by the customer, and the presentation logic of how to display them.

Let's separate those two things out. First, lets try to encapsulate what it means for an invoice to be "published", or "paid" using extension methods:

```csharp
public static class QueryableExtensions
{
    public static IQueryable<Invoice> Published(this IQueryable<Invoice> invoices)
    {
        var now = DateTime.Now;
        return invoices.Where(x => x.PublishDate == null || x.PublishDate >= now);
    }
    
    public static IQueryable<Invoice> ForCustomer(this IQueryable<Invoice> invoices, int customerId)
    {
        return invoices.Where(x => x.CustomerId == customerId)
    }
    
    public static IQueryable<Invoice> Paid(this IQueryable<Invoice> invoices)
    {
        return invoices.Where(x => x.Status == InvoiceStatus.Paid);
    }
}
```

Now, we can use these extension methods to build up our query:

```csharp
_context.Invoices
    .Include(x => x.Customer)
    .ForCustomer(customerId)
    .Paid()
    .Published()
    .OrderByDescending(x => x.Date)
    .Take(10);
```

Now our business logic is cleanly encapsulated somewhere else, what we have left here is pure presentation logic.

## Improving the design

One of the beautiful things about LINQ is that we can re-use our logic for database queries as well as filtering objects client-side. With Blazor, we can potentially even use this same logic in the browser.

But, we need to make some changes to accomodate that. We _could_ have duplicated extension methods for `IEnumerable<Invoice>` and `IQueryable<Invoice>`, but that would be a bit of a nightmare to maintain. Instead, we can do the following:

```csharp
public static IQueryable<Invoice> Published(this IEnumerable<Invoice> invoices)
{
    var now = DateTime.Now;
    return invoices.AsQueryable().Where(x => x.PublishDate == null || x.PublishDate >= now);
}
```

Note that the method now accepts any old `IEnumerable`, but we convert it to an `IQueryable` before applying the filter. This means that we can use the same extension method for both IEnumerable and IQueryable.

If the underlying implementation is not an IQueryable, then the filter will be performed client-side.

## Generic versions

Of course, there's nothing stopping you from writing generic versions of these extension methods. Assuming `Invoice` implements an `IHasName` interface, here's an example:

```csharp
public static IQueryable<T> WithName(this IEnumerable<T> entities, string name) where T : IHasName, class
{
    return entities.AsQueryable().Where(x => x.Name == name);
}
```

## Conclusion

The examples I've provided are simple, but hopefully they show the advantages this technique has over the repository approach. First, it's more flexible. You can easily compose queries in different ways. Second, it's more testable. These extension methods are pure functions so you can test the logic that uses the query without having to mock anything. Lastly, it's more readable. The query is more declarative, and the method names are more descriptive.