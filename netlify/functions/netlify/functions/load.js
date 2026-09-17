import { getStore } from '@netlify/blobs'

export default async (req) => {
    const key = new URL(req.url).searchParams.get('key')
    const cors = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store',
    }

    if (!key) {
        return new Response('-- missing key', { status: 400, headers: cors })
    }

    const store = getStore('clover-configs')
    const data = await store.get(key, { type: 'json' })
    if (!data) {
        return new Response('-- no config for key', { status: 404, headers: cors })
    }

    const activeName = data.activeConfig
    const active = data.configs && data.configs[activeName]
    if (!active || !active.code) {
        return new Response('-- no active config', { status: 404, headers: cors })
    }

    const code = active.code.trim()
    const lua = code.startsWith('return') ? code : 'return ' + code

    return new Response(lua, { headers: cors })
}

export const config = { path: '/api/load' }
