require('dotenv').config()

const getEnv = (name) => (process.env[name] || '')

const defaultRedirectURL = getEnv('DEFAULT_REDIRECT_URL')
const cacheBusterCode = getEnv('CACHE_BUSTER_SECRET')
const cacheAge = getEnv('CACHE_AGE')

// functions exist for a while in memory, so this can help
// us avoid having to call airtable for the same link during that time.
let fakeCache = {}
const bustCache = () => (fakeCache = {})

exports.handler = async (event, context) => {
  // a unique id per request session
  const runId = Math.random().toString().substr(2, 5)
  const log = (...args) => console.log(runId, ...args)
  log(`New request: coming to "${event.path}"`)

  // netlify funtions has path /.netlify/functions/{handler}
  // only allow /code. If path has multiple paths/slugs, then redirect to default
  let [, code] = event.path.match(/^.*?redirect\/?([^\/]*)$/) || [event.path, '']
  // in case of encoded url and to support emoji 💪
  code = decodeURI(code)

  const getResponse = ({longLink = defaultRedirectURL, statusCode = 302} = {}) => {
    log(`redirecting: ${code} -> ${longLink}`)
    const body = `<html><head><title>Andy Liu Short URLs</title></head><body><a href="${longLink}">moved here</a></body></html>`

    return {
      statusCode,
      body,
      headers: {
        Location: longLink,

        'Cache-Control': `public, max-age=${cacheAge}`,
        // 'Cache-Control': 'no-cache',

        // Same header as bit.ly URL
        'Content-Length': String(body.length),
        'Content-Type': 'text/html; charset=utf-8',
        Connection: 'close',
        'Content-Security-Policy': 'referrer always',
        'Referrer-Policy': 'unsafe-url',
      },
    }
  }

  if (!code) {
    log(`no code provided`)
    return getResponse({code, statusCode: 301})
  }

  if (code === cacheBusterCode) {
    log('busting the cache')
    bustCache()
    return {statusCode: 200, body: 'cache busted'}
  }

  const codeLength = code.length
  if (codeLength > 40) {
    log(`short code "${code}" is ${codeLength} characters long. :thinking:.`)
    return getResponse()
  }

  if (fakeCache[code]) {
    log(`short code "${code}" exists in our in-memory cache.`)
    return getResponse({longLink: fakeCache[code], statusCode: 301})
  }

  try {
    // no cache found, go to Airtable
    const apiKey = getEnv('AIRTABLE_KEY')
    const base = getEnv('AIRTABLE_BASE')
    const table = getEnv('AIRTABLE_TABLE')
    const shortCodeField = getEnv('AIRTABLE_SHORT_CODE_FIELD')
    const longLinkField = getEnv('AIRTABLE_LONG_LINK_FIELD')
    const Airtable = require('airtable')
    log(`Attempting to get long link for code "${code}" from airtable...`)
    const result = await new Airtable({apiKey})
      .base(base)(table)
      .select({
        maxRecords: 1,
        fields: [longLinkField],
        filterByFormula: `{${shortCodeField}} = "${code}"`,
      })
      .firstPage()
    const longLink = result[0].get(longLinkField)
    if (longLink) {
      fakeCache[code] = longLink
      return getResponse({longLink, statusCode: 301})
    } else {
      log(`There was no Long Link associated with "${code}".`)
      return getResponse()
    }
  } catch (error) {
    if (error.stack) {
      log(error.stack)
    } else {
      log(error)
    }
    log('!!!!! we are ignoring an error\n')
  }

  return getResponse()
}
