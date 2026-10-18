import { on, once } from 'node:events'
import type { AddressInfo } from 'node:net'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WebSocket from 'ws'

import { createApp } from '../src/app'
import { events, roomTopic } from '../src/rooms/events'
import type { Room } from '../src/rooms/repository'

const fixtures = vi.hoisted(() => ({
  origins: ['http://localhost:5173', 'https://example-tunnel.trycloudflare.com'],
  room: undefined as Room | undefined,
}))
vi.mock('../src/config', () => ({ config: { origins: fixtures.origins } }))
vi.mock('../src/auth', () => ({
  auth: {
    api: {
      getSession: async ({ headers }: { headers: Headers }) =>
        headers.get('cookie') === 'session=demo' ? { user: { id: 'demo', name: 'Demo' } } : null,
    },
  },
}))
vi.mock('../src/rooms/repository', () => ({
  roomRepository: { get: () => fixtures.room },
}))

let server: Awaited<ReturnType<typeof createApp>>
const sockets: WebSocket[] = []
let url: string

beforeEach(async () => {
  fixtures.room = {
    id: 'room',
    ownerId: 'demo',
    members: [{ userId: 'demo', name: 'Demo', seatIndex: 0 }],
    capacity: 2,
    mode: 'round',
    targetScore: 500,
    status: 'waiting',
    version: 1,
    updatedAt: 0,
    game: null,
  }
  server = await createApp()
  await new Promise<void>((resolve, reject) => {
    server.httpServer.once('error', reject)
    server.httpServer.listen(0, '127.0.0.1', resolve)
  })
  url = `ws://127.0.0.1:${(server.httpServer.address() as AddressInfo).port}/graphql`
})

afterEach(async () => {
  for (const socket of sockets.splice(0)) {
    if (socket.readyState === WebSocket.CLOSED) continue
    const closed = once(socket, 'close')
    socket.close()
    await closed
  }
  await server.apollo.stop()
})

async function connect(origin: string) {
  const socket = new WebSocket(url, 'graphql-transport-ws', {
    origin,
    headers: { Cookie: 'session=demo' },
  })
  sockets.push(socket)
  await once(socket, 'open')
  return socket
}

describe('WebSocket browser origins', () => {
  it.each(fixtures.origins)('delivers initial state and live updates to %s', async origin => {
    const socket = await connect(origin)
    const messages = on(socket, 'message')
    async function nextMessage() {
      const { value } = await messages.next()
      return JSON.parse(value![0].toString())
    }
    try {
      socket.send(JSON.stringify({ type: 'connection_init' }))
      expect(await nextMessage()).toEqual({ type: 'connection_ack' })

      socket.send(
        JSON.stringify({
          id: 'subscription',
          type: 'subscribe',
          payload: { query: 'subscription { roomChanged(id: "room") { version members { connected } } }' },
        }),
      )
      // The initial snapshot and the presence notification are separate events.
      for (let index = 0; index < 2; index++) {
        const initial = await nextMessage()
        expect(initial.type).toBe('next')
        expect(initial.payload.data.roomChanged.version).toBe(1)
        expect(initial.payload.data.roomChanged.members[0].connected).toBe(true)
      }
      fixtures.room!.version = 2
      await events.publish(roomTopic('room'), { roomChanged: fixtures.room! })
      expect((await nextMessage()).payload.data.roomChanged.version).toBe(2)
    } finally {
      await messages.return?.()
    }
  })

  it.each(fixtures.origins)('allows HTTP requests from the same origin list: %s', async origin => {
    const response = await fetch(url.replace('ws:', 'http:'), {
      method: 'OPTIONS',
      headers: { Origin: origin, 'Access-Control-Request-Method': 'POST' },
    })
    expect(response.status).toBe(204)
    expect(response.headers.get('access-control-allow-origin')).toBe(origin)
    expect(response.headers.get('access-control-allow-credentials')).toBe('true')
  })

  it('rejects an unlisted origin even with a valid session', async () => {
    const socket = await connect('https://untrusted.example')
    const closed = once(socket, 'close')
    socket.send(JSON.stringify({ type: 'connection_init' }))
    const [code] = await closed
    expect(code).toBe(4403)
  })
})
