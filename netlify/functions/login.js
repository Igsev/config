import { getStore } from '@netlify/blobs'

export default async (req) => {
    if (req.method !== 'POST') {
        return new Response('method not allowed', { status: 405 })
    }

    let body
    try { body = await req.json() } catch {
        return new Response('bad json', { status: 400 })
    }

    const { username, password } = body
    if (!username || !password) {
        return Response.json({ success: false, message: 'missing credentials' }, { status: 400 })
    }

    const userStore = getStore('clover-users')
    let user = await userStore.get(username, { type: 'json' })

    if (!user) {
        user = {
            username,
            passwordHash: password,
            key: 'CLOVER-' + username.toUpperCase() + '-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
            expiryDate: Date.now() + 365 * 24 * 60 * 60 * 1000,
            createdAt: Date.now(),
        }
        await userStore.setJSON(username, user)
    } else if (user.passwordHash !== password) {
        return Response.json({ success: false, message: 'invalid password' }, { status: 401 })
    }

    return Response.json({
        success: true,
        user: { username: user.username, key: user.key, expiryDate: user.expiryDate },
    }, {
        headers: { 'Access-Control-Allow-Origin': '*' },
    })
}

export const config = { path: '/api/login' }
