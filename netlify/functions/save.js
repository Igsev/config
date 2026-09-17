import { getStore } from '@netlify/blobs'

export default async (req) => {
    if (req.method !== 'POST') {
        return new Response('method not allowed', { status: 405 })
    }

    let body
    try { body = await req.json() } catch {
        return new Response('bad json', { status: 400 })
    }

    const { key, configs, activeConfig } = body
    if (!key || !configs) {
        return new Response('missing key or configs', { status: 400 })
    }

    const store = getStore('clover-configs')
    await store.setJSON(key, { configs, activeConfig, updatedAt: Date.now() })

    return Response.json({ ok: true }, {
        headers: { 'Access-Control-Allow-Origin': '*' },
    })
}

export const config = { path: '/api/save' }
