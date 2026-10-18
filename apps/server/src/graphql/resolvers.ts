import { GraphQLError } from 'graphql'

import { events, roomTopic } from '../rooms/events'
import { playerActionSchema } from '../rooms/inputs'
import { connectPlayer } from '../rooms/presence'
import type { Room } from '../rooms/repository'
import { roomService, requireRoom, viewRoom } from '../rooms/service'
import type { Context } from './context'
import type { Resolvers } from './generated'

function actionFromInput(input: unknown) {
  const result = playerActionSchema.safeParse(input)
  if (!result.success) throw new GraphQLError('Invalid action input', { extensions: { code: 'BAD_USER_INPUT' } })
  return result.data
}

export const resolvers: Resolvers = {
  Query: {
    myRooms: (_: unknown, _args: unknown, { user }: Context) => roomService.list(user.id),
    room: (_: unknown, { id }, { user }: Context) => roomService.get(id, user.id),
  },
  Mutation: {
    createRoom: (_: unknown, { input }, { user }: Context) =>
      roomService.create(user, input.mode, input.targetScore, input.capacity),
    joinRoom: (_: unknown, { id }, { user }: Context) => roomService.join(id, user),
    startGame: (_: unknown, { id, version }, { user }: Context) => roomService.start(id, user.id, version),
    takeAction: (_: unknown, { id, version, action }, { user }: Context) =>
      roomService.act(id, user.id, version, actionFromInput(action)),
    nextRound: (_: unknown, { id, version }, { user }: Context) => roomService.next(id, user.id, version),
  },
  Subscription: {
    roomChanged: {
      subscribe(_: unknown, { id }, context: Context) {
        requireRoom(id, context.user.id)
        const iterator = events.asyncIterableIterator<{ roomChanged: Room }>(roomTopic(id))
        let pending = iterator.next()
        const disconnect = connectPlayer(id, context.user.id)
        let initial = true
        const stream: AsyncIterableIterator<{ roomChanged: Room }> = {
          [Symbol.asyncIterator]() {
            return this
          },
          async next() {
            if (initial) {
              initial = false
              return { done: false as const, value: { roomChanged: requireRoom(id, context.user.id) } }
            }
            const event = await pending
            if (!event.done) pending = iterator.next()
            return event
          },
          return() {
            disconnect()
            return iterator.return!()
          },
          throw(error: unknown) {
            disconnect()
            return iterator.throw!(error)
          },
        }
        return stream
      },
      async resolve({ roomChanged }: { roomChanged: Room }, _args: unknown, context: Context) {
        const user = await context.authenticate()
        requireRoom(roomChanged.id, user.id)
        return viewRoom(roomChanged, user.id)
      },
    },
  },
}
