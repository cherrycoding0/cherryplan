exports.handler = async (event) => {
  const params = new URLSearchParams(event.queryStringParameters || {})
  params.set('output', 'js')
  params.set('Version', '20131101')

  const url = `http://www.aladin.co.kr/ttb/api/ItemSearch.aspx?${params.toString()}`

  try {
    const res = await fetch(url)
    const text = await res.text()
    const data = JSON.parse(text)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '검색에 실패했어요', detail: err.message }),
    }
  }
}
