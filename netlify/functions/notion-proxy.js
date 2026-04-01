exports.handler = async (event) => {
  // DEBUG
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: event.path, rawUrl: event.rawUrl, qs: event.queryStringParameters }),
    }
  }

  const splat = event.queryStringParameters?.notionPath || ''
  const notionPath = '/' + splat
  const url = `https://api.notion.com${notionPath}`

  try {
    const res = await fetch(url, {
      method: event.httpMethod,
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: event.body || undefined,
    })
    const text = await res.text()
    return {
      statusCode: res.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: text,
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
