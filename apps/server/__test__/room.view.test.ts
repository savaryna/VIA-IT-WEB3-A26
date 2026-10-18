import { buildSchema, graphqlSync, print } from 'graphql'
import { describe, expect, it } from 'vitest'

import { RoomDocument, type RoomQuery } from '../../vue/src/graphql/generated'
import { roomFromGraphQL } from '../../vue/src/graphql/models'
import { typeDefs } from '../src/graphql/typeDefs'

const schema = buildSchema(typeDefs)

function wireRoom(challenge = false) {
  const rootValue = {
    room: {
      id: 'room',
      ownerId: 'a',
      status: 'playing',
      mode: 'score',
      targetScore: 500,
      capacity: 2,
      roundNumber: 1,
      version: 1,
      localPlayer: 0,
      members: [{ userId: 'a', name: 'A', score: 0, connected: true }],
      round: {
        players: [{ name: 'A', cardCount: 1, score: 0, connected: true }],
        hand: [{ type: 'WILD' }],
        playableCardIndices: [0],
        turn: 0,
        discardTop: { type: 'NUMBERED', color: 'BLUE', number: 3 },
        color: 'BLUE',
        direction: 'clockwise',
        drawPileSize: 100,
        mustPlayDrawn: false,
        declaredUno: false,
        canSayUno: false,
        canChallenge: false,
        challengeResult: challenge
          ? { offender: 1, guilty: true, hand: [{ type: 'WILD DRAW' }, { type: 'SKIP', color: 'RED' }] }
          : undefined,
      },
    },
  }
  const result = graphqlSync({
    schema,
    rootValue,
    source: print(RoomDocument),
    variableValues: { id: 'room' },
  })
  expect(result.errors).toBeUndefined()
  return (result.data as RoomQuery).room
}

describe('GraphQL room view adaptation', () => {
  it('converts nullable card fields into engine variants', () => {
    const room = roomFromGraphQL(wireRoom())
    expect(room.round!.hand).toEqual([{ type: 'WILD' }])
    expect(room.round!.discardTop).toEqual({ type: 'NUMBERED', color: 'BLUE', number: 3 })
    expect(room.round!.winner).toBeNull()
    expect(room.round!.challengeResult).toBeUndefined()
  })
  it('rejects invalid card variants during engine adaptation', () => {
    const room = wireRoom()
    room.round!.hand[0].type = 'UNKNOWN'
    expect(() => roomFromGraphQL(room)).toThrow()
  })
  it('converts revealed challenge cards', () => {
    expect(roomFromGraphQL(wireRoom(true)).round!.challengeResult!.hand).toEqual([
      { type: 'WILD DRAW' },
      { type: 'SKIP', color: 'RED' },
    ])
  })
})
