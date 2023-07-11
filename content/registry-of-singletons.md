# The registry of singletons pattern

#### AKA why all my homies hate enums.

Enums are great. Well, they're OK anyway. Its a nice thing to be able to assign labels to numbers but that's about all they're good for. They're not very extensible, and they're not very encapsulated. 

### The problem

Oftentimes I've seen an innocent looking enum defined and used like this:

```csharp
public enum Country
{
    Germany,
    France,
    Mexico
}

public class Person
{
    public string Name { get; set; }

    public Country Country { get; set; }
}
```

Everything seems alright so far. I can create a person and set their country to Germany. But inevitably, we end up needing to perform some sort of logic relating to this enum. And, since enums cannot contain logic, we inevitably end up with at least one, but often more, switch statements littered throughout our codebase: 

```csharp

public int GetSalesTaxRate(Person person)
{
    switch(person.Country)
    {
        case Country.Germany:
            return 19;
        case Country.France:
            return 20;
        case Country.Mexico:
            return 16;
    }
}
```

The major problem here is a lack of encapsulation. This also violates the open/closed principle, because if we need to add a new country, we have to go and modify this method, and all the other ones which operate on the `Country` property of a person. It should be pretty clear why this is a problem...

### The solution

This is a variation of the "Registry of Singletons" pattern. We can see it in use in the .NET framework itself, for example in the `System.Drawing.Color` class and `System.Text.Encoding`, to name a couple.

For starters we need a class, with a private constructor:

```csharp
public class Country
{
    private Country(string name, int salesTaxRate)
    {
        Name = name;
        SalesTaxRate = salesTaxRate;
    }

    public string Name { get; }

    public int SalesTaxRate { get; }
}
```

We make the constructor private so clients cannot accidentally add new countries. We also make the properties read-only, so they cannot be modified after the object is created. Next we just add our countries as static properties:

```csharp
public class Country
{
    private Country(string name, int salesTaxRate)
    {
        Name = name;
        SalesTaxRate = salesTaxRate;
    }

    public string Name { get; }

    public int SalesTaxRate { get; }

    public static Country Germany { get; } = new Country("Germany", 19);

    public static Country France { get; } = new Country("France", 20);

    public static Country Mexico { get; } = new Country("Mexico", 16);
}
```

Hey presto! It works just like an enum. In fact, sometimes people might not even realise its not an enum. But now we can access rich data about the countries, and its impossible to add new countries without also being forced to include required information such as the sales tax rate.

### Exposing it as an `IEnumerable`

Sometimes we want to expose our list of countries as an `IEnumerable` and be able to look them up by name. This is easy to do with a static property that uses reflection:

```csharp
    public static IDictionary<string, Country> All => this.GetType().GetProperties(BindingFlags.Public | BindingFlags.Static)
        .Where(p => p.PropertyType == typeof(Country))
        .Select(p => p.GetValue(null))
        .Cast<Country>()
        .ToDictionary(c => c.Name, c => c);
}
```

If you write a lot of these types of classes, it might even save you time to put this into an extension method or base class.

### But what about serialization?

Its nice to have these rich objects, but sometimes we need to serialize them. For example, if we're sending them over the wire, or storing them in a database.

A custom JSON converter may feel like a lot of work but it really isn't. This one will work specifically for the `Country` class we defined above, however, if you choose to implement these with a base class or interface, you can make a generic version of this converter that will work for all of them.

```csharp:

public class CountryConverter : JsonConverter
{
    public override bool CanConvert(Type objectType)
    {
        return objectType == typeof(Country);
    }

    public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
    {
        JObject jsonObject = JObject.Load(reader);
        string name = jsonObject.Value<string>();
        return Country.All[name];
    }

    public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
    {
        Country country = (Country)value;
        writer.WriteValue(country.Name);
    }
}
```

And that's it! Now you have a fully encapsulated enum-like object that can be serialized and deserialized, and you can add as many properties and methods as you like to it. Maybe you have some ideas on how this pattern could be improved? Let me know!