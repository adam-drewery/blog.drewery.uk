const fs = require('fs');
const RSS = require('rss');
const axios = require('axios');

// Read index.json
const index = JSON.parse(fs.readFileSync('content/index.json', 'utf8'));

// Create a feed
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

// Loop over the articles in the index and add them to the feed
for (const articleId in index) {
    const article = index[articleId];

    const response = axios.get("blog.drewery.uk/raw/" + articleId);
    
    feed.item({
        title:  article.title,
        description: 'You can add a description here',
        url: `https://yourwebsite.com/${articleId}`, // URL of the article
        date: article.date,
        
        // Add the article content as HTML
        content: response.data
    });
}

// Write the XML to a file
fs.writeFileSync('rss.xml', feed.xml());