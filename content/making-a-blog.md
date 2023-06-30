# Setting up a blog in GitHub Pages using Blazor WASM

I achieved a blogception by creating a blog then blogging about the blog from within the blog itself. This is what I've decided to refer to as "recursive metablogging".

> I'm not sure how often I'll post, but I'll try to keep it regular. I'm also not sure what I'll post about, but I'll try to keep it interesting. I'm also not sure how long I'll keep this up, but I'll try to keep it going for a while.

*- This is what github copilot suggested I should write next*

---

## Getting started

Its crazy easy to make a page on GitHub pages. You just create a repo, click a button, then you're off. Well, sort of anyway. I also wanted to write something myself using Blazor, because I'm really into Blazor these days. Its not quite as simple as just deploying a bunch of HTML though.

### The first step
Obviously the first step was to create a blazor project.
```shell
dotnet new blazorwasm -o blog
``` 
I paid for some overpriced crappy template to get me started because my frontend skills aren't great. By the end though, I'd changed almost everything about it. Anyway, after shimmying that into the blazor project it was ready to push up to the repo.

### Configure GitHub Pages
By default, GitHub page sites are deployed from the master branch. Obviously this isn't going to work with a blazor project, we need to get it all compiled up first. So first thing I did was change the deployment method in github to "GitHub Actions".

![configuring github pages](https://raw.githubusercontent.com/adam-drewery/blog/main/content/making-a-blog/setup-github-pages.png "configuring github pages")

At this point I also got the domain name set up, the instructions tell you exactly what to do and it takes about 2 minutes. Plus, I enabled HTTPS-only while I was in here for security and privacy reasons.

### Set up the pipeline
I've not used GitHub actions very much, but I've used Azure DevOps a lot and turns ut they're pretty similar. I just needed to create a new workflow file in the .github/workflows folder. I called it "build.yml" because I'm not very creative.

I started with a regular .NET build and publish. To anyone who's compiled a .net app before it should be self explanitory:

```yaml
jobs:
  build:
    permissions:
      pages: write
      id-token: write
    runs-on: ubuntu-latest
    steps:
    
    - uses: actions/checkout@v2
    
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: 7.0.x
          
    - name: .NET Publish
      run: dotnet publish site/blog.csproj -c Release -o release --nologo
```

Note the `permissions` section. While I'd given GitHub Actions read and write permissions in its settings, it turns out that wasn't enough, and I continued to receive errors during the build. This section fixed that.

I added this part to ensure that GitHub pages was enabled and configured correctly:

```yaml
    - name: Configure Pages
      uses: actions/configure-pages@v3
```

By default, GitHub pages assumes your page is being deployed via Jekyll. Since this isn't the case here, we have to tell GitHub to specifically not do that. Which is kind of weird, but hey, its an easy fix:

```yaml
    - name: Disable Jekyll
      run: touch release/wwwroot/.nojekyll
```

Then, I added a step to upload the release folder as an artifact. It seems like this is what GitHub actions needs in order to do the deployment. 

```yaml
    - name: Upload artifact
      uses: actions/upload-artifact@v2
      with:
        name: wwwroot
        path: './release/wwwroot'
```

So, that was the build job. But what about the release part? I got you covered:

```yaml
  deploy:
    runs-on: ubuntu-latest
    needs: build
    permissions:
      pages: write
      id-token: write
    environment:
      name: GitHub Pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:      
    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v2
```

Here you can see it uses the same `permissions` block as in the build job. I also added an `environment` block to give it a name and a URL.

Other than that though the release part is really simple. It gets the artifact we uploaded in the previous job and yeets it into GitHub pages, easy peasy.

![configuring github actions](https://raw.githubusercontent.com/adam-drewery/blog/main/content/making-a-blog/build-github-pages.png "configuring github actions")

---

### Fix the paths

Using that pipeline, we can successfully deploy the site. With a few caveats...

Firstly, the site is deployed to a subfolder. So, instead of being at `https://adam-drewery.github.io` it was at `https://adam-drewery.github.io/blog`. This is because the repo is called "blog" and that's the name of the folder the site is deployed to.

This is a problem because your scripts and styles etc will be looking at `adam-drewery.github.io/script.js`, whereas it is actualy located in the subfolder `adam-drewery.github.io/blog/script.js` (emphasis on the `/blog/` bit).

My solution to this was simply to configure a domain name to host from (in this case, blog.drewery.uk) However, for anyone not using a domain name, and hosting on the default github.io address, its important to ensure your script and style paths are all relative, and that you add a `base` tag to the head of the index.html file like this:

```html
<base href="/blog/" />
```

### Fix the routing

The other problem I had was that the routing wasn't working. I could navigate to the root of the site, but any other page would just return a 404. This is because the routing is handled by the blazor runtime, and the blazor runtime included in `index.html`.

So, I added a step to the build job to copy the index page to `404.html`, which GitHub pages will use as the 404 page.

```yaml
    - name: copy index.html to 404.html
      run: cp site/wwwroot/index.html site/wwwroot/404.html
```

Probably doesn't require too much explanation as to what's going on here... its pretty filthy though, I felt like I had to take a shower afterwards. I wish there was a better way to do this.

But anyway, if its stupid and it works, then its not stupid! So, I'm happy with it. You can see the completed pipeline yaml file [here](https://github.com/adam-drewery/blog/blob/main/.github/workflows/build.yml).

I'll write another post at some point describing how I built the site itself. I had quite a bit of fun with it if I'm honest... frontend development has gotten more enjoyable now I can delegate the tedious bits to ChatGPT. 😎