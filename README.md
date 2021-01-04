# short urls

This is a short-url service that works with [Netlify](https://www.netlify.com/). It uses its redirect function to make the short url magic. The original method would work with [Netlify functions](https://www.netlify.com/docs/functions/), it was based on Kent C. Dodds' [repository](https://github.com/kentcdodds/airtable-netlify-short-urls). Check out the **`functions`** branch, if you are interested.

## Example

Example shorten urls.

| Shorten URL | Links |
|----------------------|-------------------------------------------------------------------------------------------------------|
| aliu.info/me | [My personal page](aliu.dev) |
| aliu.info/linkedin | [My LinkedIn profile](linkedin.com/in/mingchia-andy-liu) |
| aliu.info/github | [My github profile](github.com/mingchia-andy-liu) |
| aliu.info/nba | [My box scores extension](https://boxscores.site) |
| aliu.info/taeyeon | [My favourite singer](https://open.spotify.com/artist/3qNVuliS40BLgXGxhdBdqu) |


## Netlify

The repo has an continuous deployment with `Netlify`. It also provides custom domain management which I set up my `Cloudflare` DNS record to `Netlify`'s build in DNS service. `Netlify` caches `301` and `302` redirects response in the edge nodes. So they are cached in a CDN level instead of hitting the server for every requests 🎉.
