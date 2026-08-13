const API_BASE = import.meta.env.VITE_APP_BASE_URL ?? ''

async function request(path, options = {}, responseType = 'json') {
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, options)
  } catch {
    throw new Error('Could not reach the classification service. Check that the API is running and try again.')
  }

  if (responseType === 'blob') {
    const blob = await response.blob()
    const text = await blob.text().catch(() => '')

    if (!response.ok) {
      const message = parseErrorMessage(text)
      throw new Error(message)
    }

    return {
      blob,
      filename: getFilenameFromResponse(response) || 'classified_output.csv',
    }
  }

  const text = await response.text()
  let data = {}
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { text }
    }
  }

  if (!response.ok) {
    throw new Error(parseErrorMessage(text, data))
  }

  return data
}

function parseErrorMessage(text, data = {}) {
  if (data?.error || data?.detail || data?.message) {
    return data.error || data.detail || data.message
  }

  if (typeof text === 'string' && text.trim()) {
    return text
  }

  return 'The service could not complete that request. Please try again.'
}

function getFilenameFromResponse(response) {
  const disposition = response.headers.get('content-disposition') || ''
  const match = disposition.match(/filename="?([^";]+)"?/) || disposition.match(/filename=([^;]+)/)
  return match?.[1] || null
}

export function classifyDescription(description) {
  return request('/api/classify/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  })
}

export async function classifyBulk(file) {
  const formData = new FormData()
  formData.append('file', file)

  const candidatePaths = ['/api/classify/bulk/', '/api/classify_bulk/']

  for (const path of candidatePaths) {
    try {
      return await request(path, {
        method: 'POST',
        body: formData,
      }, 'blob')
    } catch (error) {
      if (path === candidatePaths[candidatePaths.length - 1]) {
        throw error
      }

      if (!/404|not found/i.test(error.message)) {
        throw error
      }
    }
  }

  throw new Error('The bulk upload endpoint is unavailable at the moment.')
}

export async function submitCorrection(queryId, submittedCode) {
  return request('/api/corrections/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query_id: queryId, submitted_code: submittedCode }),
  })
}

export async function lookupHsn(code) {
  const candidatePaths = [`/api/lookup/${encodeURIComponent(code)}/`, `/api/hsn/${encodeURIComponent(code)}/`]

  for (const path of candidatePaths) {
    try {
      return await request(path)
    } catch (error) {
      if (path === candidatePaths[candidatePaths.length - 1]) {
        throw error
      }

      if (!/404|not found/i.test(error.message)) {
        throw error
      }
    }
  }

  throw new Error('No HSN/SAC code was found for that value.')
}
