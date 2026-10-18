import { PubSub } from 'graphql-subscriptions'

import type { Room } from './repository'

export const events = new PubSub<Record<string, { roomChanged: Room }>>()

export const roomTopic = (id: string) => `room:${id}`
