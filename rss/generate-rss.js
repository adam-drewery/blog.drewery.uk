const fs = require('fs');
const RSS = require('rss');
const marked = require('marked');

// Read index.json
const index = JSON.parse(fs.readFileSync('content/index.json', 'utf8'));

const feed = new RSS({
    title: 'Adam Drewery\'s Blog',
    description: '',
    feed_url: 'https://raw.githubusercontent.com/adam-drewery/blog/main/rss.xml',
    site_url: 'blog.drewery.uk',
    managingEditor: 'Adam Drewery',
    webMaster: 'Adam Drewery',
    language: 'en',
    pubDate: new Date().toUTCString(),
});

for (const articleId in index) {
    const article = index[articleId];

    const markdown = fs.readFileSync("content/" + articleId + ".md", 'utf8')
    
    feed.item({
        title:  article.title,
        description: marked(markdown),
        url: `https://blog.drewery.uk/${articleId}`,
        date: article.date,
        author: 'Adam Drewery',
    });
}

fs.writeFileSync('rss.xml', feed.xml());