exports.handler = async (event) => {
  const notionPath = event.path.replace(/^\/?api\/notion/, '')
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
