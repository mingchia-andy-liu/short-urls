# short urls

This is a short-url service that works with
[netlify functions](https://www.netlify.com/docs/functions/) and uses
[airtable](https://airtable.com). It is based on Kent C. Dodds' repository. Please [check it out here first!](https://github.com/kentcdodds/airtable-netlify-short-urls)

## Example

Here are a sneak peak, find out what else I have hidden yourself.

| Shorten URL | Links |
|----------------------|-------------------------------------------------------------------------------------------------------|
| aliu.info/me | [My personal page](andyliu.me) |
| aliu.info/github | [My github profile](github.com/mingchia-andy-liu) |
| aliu.info/box-scores | [My box scores extension](https://chrome.google.com/webstore/detail/mfmkedeaebcckihpinmhkadoagdbifaa) |
| aliu.info/❤️ | [My favourite singer](https://open.spotify.com/artist/3qNVuliS40BLgXGxhdBdqu) |


## Stack

### Netlify, Netlify functions

The repo has an continuous deployment with `Netlify`. It also provides custom domain management which I set up my `Cloudflare` DNS record to `Netlify`'s build in DNS service.

Redirects is setup automatically in the `netlify.toml`. Everything should go to the function handler. The `redirect.js` handler parse the short code and read the long link from `airtable`. There is also a small in-memory cache to prevent max out the airtable rate limit.

### airetable

It's a free and simple service that provides spreadsheet as a lookup table. Short codes and redirect links are stored in here. **Notes:** It has a limit of 5 requests per second.

### Cloudflare

Cloudflare is able to cache response with `301` and `302` status.
In theory, the requests are cache at a CDN level. It does not even reach the lambda function 🎉.


## Dev

### Local
You need and dot env file. Here are the keys:
```
AIRTABLE_BASE=
AIRTABLE_KEY=
AIRTABLE_LONG_LINK_FIELD=
AIRTABLE_SHORT_CODE_FIELD=
AIRTABLE_TABLE=
CACHE_AGE=
CACHE_BUSTER_SECRET=
DEFAULT_REDIRECT_URL=
```

Run this command should bring up the local lambda (wait till webpack is finished).
```
$ npm run dev
```

Go to this URL to play with your own custom url shortener. Since I named the handler `redirect.js`, I go to the `/redirect`. Change this accordingly.
```
localhost:9000/.netlify/functions/redirect
```

### Prod
First, setup an airtable account with a base and table. The table should have
a column for the short code and one for the long link.

Connect `Netlify` with the repository for continuous deployment and lambda functions. Deploy the app and add all the environment variables. Configure the custom domain if you have any. Then, you are done!
