/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never }
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'
export type ActionInput = {
  accused?: number | null | undefined
  cardIndex?: number | null | undefined
  newColor?: CardColor | null | undefined
  sayUno?: boolean | null | undefined
  type: ActionType
}

export type ActionType = 'catchUnoFailure' | 'challenge' | 'draw' | 'play' | 'sayUno'

export type CardColor = 'BLUE' | 'GREEN' | 'RED' | 'YELLOW'

export type CreateRoomInput = {
  capacity?: number
  mode?: GameMode
  targetScore?: number
}

export type Direction = 'clockwise' | 'counterclockwise'

export type GameMode = 'round' | 'score'

export type RoomStatus = 'between' | 'finished' | 'playing' | 'waiting'

export type RoomFieldsFragment = {
  id: string
  ownerId: string
  status: RoomStatus
  mode: GameMode
  targetScore: number
  capacity: number
  roundNumber: number
  version: number
  localPlayer: number
  members: Array<{ userId: string; name: string; connected: boolean; score: number }>
  round: {
    playableCardIndices: Array<number>
    turn: number | null
    color: CardColor
    direction: Direction
    drawPileSize: number
    mustPlayDrawn: boolean
    declaredUno: boolean
    canSayUno: boolean
    catchablePlayer: number | null
    canChallenge: boolean
    winner: number | null
    score: number | null
    gameWinner: number | null
    players: Array<{ name: string; connected: boolean; cardCount: number; score: number }>
    hand: Array<{ type: string; color: CardColor | null; number: number | null }>
    discardTop: { type: string; color: CardColor | null; number: number | null }
    challengeResult: {
      offender: number
      guilty: boolean
      hand: Array<{ type: string; color: CardColor | null; number: number | null }>
    } | null
  } | null
}

export type MyRoomsQueryVariables = Exact<{ [key: string]: never }>

export type MyRoomsQuery = {
  myRooms: Array<{
    id: string
    ownerId: string
    status: RoomStatus
    mode: GameMode
    targetScore: number
    capacity: number
    roundNumber: number
    version: number
    localPlayer: number
    members: Array<{ userId: string; name: string; connected: boolean; score: number }>
    round: {
      playableCardIndices: Array<number>
      turn: number | null
      color: CardColor
      direction: Direction
      drawPileSize: number
      mustPlayDrawn: boolean
      declaredUno: boolean
      canSayUno: boolean
      catchablePlayer: number | null
      canChallenge: boolean
      winner: number | null
      score: number | null
      gameWinner: number | null
      players: Array<{ name: string; connected: boolean; cardCount: number; score: number }>
      hand: Array<{ type: string; color: CardColor | null; number: number | null }>
      discardTop: { type: string; color: CardColor | null; number: number | null }
      challengeResult: {
        offender: number
        guilty: boolean
        hand: Array<{ type: string; color: CardColor | null; number: number | null }>
      } | null
    } | null
  }>
}

export type RoomQueryVariables = Exact<{
  id: string | number
}>

export type RoomQuery = {
  room: {
    id: string
    ownerId: string
    status: RoomStatus
    mode: GameMode
    targetScore: number
    capacity: number
    roundNumber: number
    version: number
    localPlayer: number
    members: Array<{ userId: string; name: string; connected: boolean; score: number }>
    round: {
      playableCardIndices: Array<number>
      turn: number | null
      color: CardColor
      direction: Direction
      drawPileSize: number
      mustPlayDrawn: boolean
      declaredUno: boolean
      canSayUno: boolean
      catchablePlayer: number | null
      canChallenge: boolean
      winner: number | null
      score: number | null
      gameWinner: number | null
      players: Array<{ name: string; connected: boolean; cardCount: number; score: number }>
      hand: Array<{ type: string; color: CardColor | null; number: number | null }>
      discardTop: { type: string; color: CardColor | null; number: number | null }
      challengeResult: {
        offender: number
        guilty: boolean
        hand: Array<{ type: string; color: CardColor | null; number: number | null }>
      } | null
    } | null
  }
}

export type RoomChangedSubscriptionVariables = Exact<{
  id: string | number
}>

export type RoomChangedSubscription = {
  roomChanged: {
    id: string
    ownerId: string
    status: RoomStatus
    mode: GameMode
    targetScore: number
    capacity: number
    roundNumber: number
    version: number
    localPlayer: number
    members: Array<{ userId: string; name: string; connected: boolean; score: number }>
    round: {
      playableCardIndices: Array<number>
      turn: number | null
      color: CardColor
      direction: Direction
      drawPileSize: number
      mustPlayDrawn: boolean
      declaredUno: boolean
      canSayUno: boolean
      catchablePlayer: number | null
      canChallenge: boolean
      winner: number | null
      score: number | null
      gameWinner: number | null
      players: Array<{ name: string; connected: boolean; cardCount: number; score: number }>
      hand: Array<{ type: string; color: CardColor | null; number: number | null }>
      discardTop: { type: string; color: CardColor | null; number: number | null }
      challengeResult: {
        offender: number
        guilty: boolean
        hand: Array<{ type: string; color: CardColor | null; number: number | null }>
      } | null
    } | null
  }
}

export type CreateRoomMutationVariables = Exact<{
  input: CreateRoomInput
}>

export type CreateRoomMutation = {
  createRoom: {
    id: string
    ownerId: string
    status: RoomStatus
    mode: GameMode
    targetScore: number
    capacity: number
    roundNumber: number
    version: number
    localPlayer: number
    members: Array<{ userId: string; name: string; connected: boolean; score: number }>
    round: {
      playableCardIndices: Array<number>
      turn: number | null
      color: CardColor
      direction: Direction
      drawPileSize: number
      mustPlayDrawn: boolean
      declaredUno: boolean
      canSayUno: boolean
      catchablePlayer: number | null
      canChallenge: boolean
      winner: number | null
      score: number | null
      gameWinner: number | null
      players: Array<{ name: string; connected: boolean; cardCount: number; score: number }>
      hand: Array<{ type: string; color: CardColor | null; number: number | null }>
      discardTop: { type: string; color: CardColor | null; number: number | null }
      challengeResult: {
        offender: number
        guilty: boolean
        hand: Array<{ type: string; color: CardColor | null; number: number | null }>
      } | null
    } | null
  }
}

export type JoinRoomMutationVariables = Exact<{
  id: string | number
}>

export type JoinRoomMutation = {
  joinRoom: {
    id: string
    ownerId: string
    status: RoomStatus
    mode: GameMode
    targetScore: number
    capacity: number
    roundNumber: number
    version: number
    localPlayer: number
    members: Array<{ userId: string; name: string; connected: boolean; score: number }>
    round: {
      playableCardIndices: Array<number>
      turn: number | null
      color: CardColor
      direction: Direction
      drawPileSize: number
      mustPlayDrawn: boolean
      declaredUno: boolean
      canSayUno: boolean
      catchablePlayer: number | null
      canChallenge: boolean
      winner: number | null
      score: number | null
      gameWinner: number | null
      players: Array<{ name: string; connected: boolean; cardCount: number; score: number }>
      hand: Array<{ type: string; color: CardColor | null; number: number | null }>
      discardTop: { type: string; color: CardColor | null; number: number | null }
      challengeResult: {
        offender: number
        guilty: boolean
        hand: Array<{ type: string; color: CardColor | null; number: number | null }>
      } | null
    } | null
  }
}

export type StartGameMutationVariables = Exact<{
  id: string | number
  version: number
}>

export type StartGameMutation = {
  startGame: {
    id: string
    ownerId: string
    status: RoomStatus
    mode: GameMode
    targetScore: number
    capacity: number
    roundNumber: number
    version: number
    localPlayer: number
    members: Array<{ userId: string; name: string; connected: boolean; score: number }>
    round: {
      playableCardIndices: Array<number>
      turn: number | null
      color: CardColor
      direction: Direction
      drawPileSize: number
      mustPlayDrawn: boolean
      declaredUno: boolean
      canSayUno: boolean
      catchablePlayer: number | null
      canChallenge: boolean
      winner: number | null
      score: number | null
      gameWinner: number | null
      players: Array<{ name: string; connected: boolean; cardCount: number; score: number }>
      hand: Array<{ type: string; color: CardColor | null; number: number | null }>
      discardTop: { type: string; color: CardColor | null; number: number | null }
      challengeResult: {
        offender: number
        guilty: boolean
        hand: Array<{ type: string; color: CardColor | null; number: number | null }>
      } | null
    } | null
  }
}

export type TakeActionMutationVariables = Exact<{
  id: string | number
  version: number
  action: ActionInput
}>

export type TakeActionMutation = {
  takeAction: {
    id: string
    ownerId: string
    status: RoomStatus
    mode: GameMode
    targetScore: number
    capacity: number
    roundNumber: number
    version: number
    localPlayer: number
    members: Array<{ userId: string; name: string; connected: boolean; score: number }>
    round: {
      playableCardIndices: Array<number>
      turn: number | null
      color: CardColor
      direction: Direction
      drawPileSize: number
      mustPlayDrawn: boolean
      declaredUno: boolean
      canSayUno: boolean
      catchablePlayer: number | null
      canChallenge: boolean
      winner: number | null
      score: number | null
      gameWinner: number | null
      players: Array<{ name: string; connected: boolean; cardCount: number; score: number }>
      hand: Array<{ type: string; color: CardColor | null; number: number | null }>
      discardTop: { type: string; color: CardColor | null; number: number | null }
      challengeResult: {
        offender: number
        guilty: boolean
        hand: Array<{ type: string; color: CardColor | null; number: number | null }>
      } | null
    } | null
  }
}

export type NextRoundMutationVariables = Exact<{
  id: string | number
  version: number
}>

export type NextRoundMutation = {
  nextRound: {
    id: string
    ownerId: string
    status: RoomStatus
    mode: GameMode
    targetScore: number
    capacity: number
    roundNumber: number
    version: number
    localPlayer: number
    members: Array<{ userId: string; name: string; connected: boolean; score: number }>
    round: {
      playableCardIndices: Array<number>
      turn: number | null
      color: CardColor
      direction: Direction
      drawPileSize: number
      mustPlayDrawn: boolean
      declaredUno: boolean
      canSayUno: boolean
      catchablePlayer: number | null
      canChallenge: boolean
      winner: number | null
      score: number | null
      gameWinner: number | null
      players: Array<{ name: string; connected: boolean; cardCount: number; score: number }>
      hand: Array<{ type: string; color: CardColor | null; number: number | null }>
      discardTop: { type: string; color: CardColor | null; number: number | null }
      challengeResult: {
        offender: number
        guilty: boolean
        hand: Array<{ type: string; color: CardColor | null; number: number | null }>
      } | null
    } | null
  }
}

export const RoomFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RoomFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Room' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mode' } },
          { kind: 'Field', name: { kind: 'Name', value: 'targetScore' } },
          { kind: 'Field', name: { kind: 'Name', value: 'capacity' } },
          { kind: 'Field', name: { kind: 'Name', value: 'roundNumber' } },
          { kind: 'Field', name: { kind: 'Name', value: 'version' } },
          { kind: 'Field', name: { kind: 'Name', value: 'localPlayer' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'members' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'connected' } },
                { kind: 'Field', name: { kind: 'Name', value: 'score' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'round' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'players' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'connected' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'cardCount' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'score' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'hand' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'playableCardIndices' } },
                { kind: 'Field', name: { kind: 'Name', value: 'turn' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'discardTop' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                { kind: 'Field', name: { kind: 'Name', value: 'direction' } },
                { kind: 'Field', name: { kind: 'Name', value: 'drawPileSize' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mustPlayDrawn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'declaredUno' } },
                { kind: 'Field', name: { kind: 'Name', value: 'canSayUno' } },
                { kind: 'Field', name: { kind: 'Name', value: 'catchablePlayer' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'challengeResult' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'offender' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'guilty' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'hand' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'canChallenge' } },
                { kind: 'Field', name: { kind: 'Name', value: 'winner' } },
                { kind: 'Field', name: { kind: 'Name', value: 'score' } },
                { kind: 'Field', name: { kind: 'Name', value: 'gameWinner' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RoomFieldsFragment, unknown>
export const MyRoomsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'MyRooms' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'myRooms' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'RoomFields' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RoomFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Room' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mode' } },
          { kind: 'Field', name: { kind: 'Name', value: 'targetScore' } },
          { kind: 'Field', name: { kind: 'Name', value: 'capacity' } },
          { kind: 'Field', name: { kind: 'Name', value: 'roundNumber' } },
          { kind: 'Field', name: { kind: 'Name', value: 'version' } },
          { kind: 'Field', name: { kind: 'Name', value: 'localPlayer' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'members' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'connected' } },
                { kind: 'Field', name: { kind: 'Name', value: 'score' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'round' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'players' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'connected' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'cardCount' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'score' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'hand' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'playableCardIndices' } },
                { kind: 'Field', name: { kind: 'Name', value: 'turn' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'discardTop' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                { kind: 'Field', name: { kind: 'Name', value: 'direction' } },
                { kind: 'Field', name: { kind: 'Name', value: 'drawPileSize' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mustPlayDrawn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'declaredUno' } },
                { kind: 'Field', name: { kind: 'Name', value: 'canSayUno' } },
                { kind: 'Field', name: { kind: 'Name', value: 'catchablePlayer' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'challengeResult' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'offender' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'guilty' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'hand' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'canChallenge' } },
                { kind: 'Field', name: { kind: 'Name', value: 'winner' } },
                { kind: 'Field', name: { kind: 'Name', value: 'score' } },
                { kind: 'Field', name: { kind: 'Name', value: 'gameWinner' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MyRoomsQuery, MyRoomsQueryVariables>
export const RoomDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Room' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'room' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'RoomFields' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RoomFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Room' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mode' } },
          { kind: 'Field', name: { kind: 'Name', value: 'targetScore' } },
          { kind: 'Field', name: { kind: 'Name', value: 'capacity' } },
          { kind: 'Field', name: { kind: 'Name', value: 'roundNumber' } },
          { kind: 'Field', name: { kind: 'Name', value: 'version' } },
          { kind: 'Field', name: { kind: 'Name', value: 'localPlayer' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'members' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'connected' } },
                { kind: 'Field', name: { kind: 'Name', value: 'score' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'round' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'players' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'connected' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'cardCount' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'score' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'hand' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'playableCardIndices' } },
                { kind: 'Field', name: { kind: 'Name', value: 'turn' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'discardTop' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                { kind: 'Field', name: { kind: 'Name', value: 'direction' } },
                { kind: 'Field', name: { kind: 'Name', value: 'drawPileSize' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mustPlayDrawn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'declaredUno' } },
                { kind: 'Field', name: { kind: 'Name', value: 'canSayUno' } },
                { kind: 'Field', name: { kind: 'Name', value: 'catchablePlayer' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'challengeResult' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'offender' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'guilty' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'hand' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'canChallenge' } },
                { kind: 'Field', name: { kind: 'Name', value: 'winner' } },
                { kind: 'Field', name: { kind: 'Name', value: 'score' } },
                { kind: 'Field', name: { kind: 'Name', value: 'gameWinner' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RoomQuery, RoomQueryVariables>
export const RoomChangedDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'subscription',
      name: { kind: 'Name', value: 'RoomChanged' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'roomChanged' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'RoomFields' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RoomFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Room' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mode' } },
          { kind: 'Field', name: { kind: 'Name', value: 'targetScore' } },
          { kind: 'Field', name: { kind: 'Name', value: 'capacity' } },
          { kind: 'Field', name: { kind: 'Name', value: 'roundNumber' } },
          { kind: 'Field', name: { kind: 'Name', value: 'version' } },
          { kind: 'Field', name: { kind: 'Name', value: 'localPlayer' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'members' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'connected' } },
                { kind: 'Field', name: { kind: 'Name', value: 'score' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'round' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'players' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'connected' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'cardCount' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'score' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'hand' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'playableCardIndices' } },
                { kind: 'Field', name: { kind: 'Name', value: 'turn' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'discardTop' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                { kind: 'Field', name: { kind: 'Name', value: 'direction' } },
                { kind: 'Field', name: { kind: 'Name', value: 'drawPileSize' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mustPlayDrawn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'declaredUno' } },
                { kind: 'Field', name: { kind: 'Name', value: 'canSayUno' } },
                { kind: 'Field', name: { kind: 'Name', value: 'catchablePlayer' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'challengeResult' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'offender' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'guilty' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'hand' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'canChallenge' } },
                { kind: 'Field', name: { kind: 'Name', value: 'winner' } },
                { kind: 'Field', name: { kind: 'Name', value: 'score' } },
                { kind: 'Field', name: { kind: 'Name', value: 'gameWinner' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RoomChangedSubscription, RoomChangedSubscriptionVariables>
export const CreateRoomDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateRoom' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'CreateRoomInput' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createRoom' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'RoomFields' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RoomFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Room' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mode' } },
          { kind: 'Field', name: { kind: 'Name', value: 'targetScore' } },
          { kind: 'Field', name: { kind: 'Name', value: 'capacity' } },
          { kind: 'Field', name: { kind: 'Name', value: 'roundNumber' } },
          { kind: 'Field', name: { kind: 'Name', value: 'version' } },
          { kind: 'Field', name: { kind: 'Name', value: 'localPlayer' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'members' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'connected' } },
                { kind: 'Field', name: { kind: 'Name', value: 'score' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'round' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'players' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'connected' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'cardCount' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'score' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'hand' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'playableCardIndices' } },
                { kind: 'Field', name: { kind: 'Name', value: 'turn' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'discardTop' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                { kind: 'Field', name: { kind: 'Name', value: 'direction' } },
                { kind: 'Field', name: { kind: 'Name', value: 'drawPileSize' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mustPlayDrawn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'declaredUno' } },
                { kind: 'Field', name: { kind: 'Name', value: 'canSayUno' } },
                { kind: 'Field', name: { kind: 'Name', value: 'catchablePlayer' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'challengeResult' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'offender' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'guilty' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'hand' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'canChallenge' } },
                { kind: 'Field', name: { kind: 'Name', value: 'winner' } },
                { kind: 'Field', name: { kind: 'Name', value: 'score' } },
                { kind: 'Field', name: { kind: 'Name', value: 'gameWinner' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateRoomMutation, CreateRoomMutationVariables>
export const JoinRoomDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'JoinRoom' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'joinRoom' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'RoomFields' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RoomFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Room' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mode' } },
          { kind: 'Field', name: { kind: 'Name', value: 'targetScore' } },
          { kind: 'Field', name: { kind: 'Name', value: 'capacity' } },
          { kind: 'Field', name: { kind: 'Name', value: 'roundNumber' } },
          { kind: 'Field', name: { kind: 'Name', value: 'version' } },
          { kind: 'Field', name: { kind: 'Name', value: 'localPlayer' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'members' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'connected' } },
                { kind: 'Field', name: { kind: 'Name', value: 'score' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'round' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'players' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'connected' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'cardCount' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'score' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'hand' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'playableCardIndices' } },
                { kind: 'Field', name: { kind: 'Name', value: 'turn' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'discardTop' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                { kind: 'Field', name: { kind: 'Name', value: 'direction' } },
                { kind: 'Field', name: { kind: 'Name', value: 'drawPileSize' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mustPlayDrawn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'declaredUno' } },
                { kind: 'Field', name: { kind: 'Name', value: 'canSayUno' } },
                { kind: 'Field', name: { kind: 'Name', value: 'catchablePlayer' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'challengeResult' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'offender' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'guilty' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'hand' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'canChallenge' } },
                { kind: 'Field', name: { kind: 'Name', value: 'winner' } },
                { kind: 'Field', name: { kind: 'Name', value: 'score' } },
                { kind: 'Field', name: { kind: 'Name', value: 'gameWinner' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<JoinRoomMutation, JoinRoomMutationVariables>
export const StartGameDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'StartGame' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'version' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'startGame' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'version' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'version' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'RoomFields' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RoomFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Room' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mode' } },
          { kind: 'Field', name: { kind: 'Name', value: 'targetScore' } },
          { kind: 'Field', name: { kind: 'Name', value: 'capacity' } },
          { kind: 'Field', name: { kind: 'Name', value: 'roundNumber' } },
          { kind: 'Field', name: { kind: 'Name', value: 'version' } },
          { kind: 'Field', name: { kind: 'Name', value: 'localPlayer' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'members' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'connected' } },
                { kind: 'Field', name: { kind: 'Name', value: 'score' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'round' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'players' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'connected' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'cardCount' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'score' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'hand' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'playableCardIndices' } },
                { kind: 'Field', name: { kind: 'Name', value: 'turn' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'discardTop' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                { kind: 'Field', name: { kind: 'Name', value: 'direction' } },
                { kind: 'Field', name: { kind: 'Name', value: 'drawPileSize' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mustPlayDrawn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'declaredUno' } },
                { kind: 'Field', name: { kind: 'Name', value: 'canSayUno' } },
                { kind: 'Field', name: { kind: 'Name', value: 'catchablePlayer' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'challengeResult' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'offender' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'guilty' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'hand' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'canChallenge' } },
                { kind: 'Field', name: { kind: 'Name', value: 'winner' } },
                { kind: 'Field', name: { kind: 'Name', value: 'score' } },
                { kind: 'Field', name: { kind: 'Name', value: 'gameWinner' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<StartGameMutation, StartGameMutationVariables>
export const TakeActionDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'TakeAction' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'version' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'action' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ActionInput' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'takeAction' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'version' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'version' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'action' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'action' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'RoomFields' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RoomFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Room' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mode' } },
          { kind: 'Field', name: { kind: 'Name', value: 'targetScore' } },
          { kind: 'Field', name: { kind: 'Name', value: 'capacity' } },
          { kind: 'Field', name: { kind: 'Name', value: 'roundNumber' } },
          { kind: 'Field', name: { kind: 'Name', value: 'version' } },
          { kind: 'Field', name: { kind: 'Name', value: 'localPlayer' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'members' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'connected' } },
                { kind: 'Field', name: { kind: 'Name', value: 'score' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'round' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'players' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'connected' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'cardCount' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'score' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'hand' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'playableCardIndices' } },
                { kind: 'Field', name: { kind: 'Name', value: 'turn' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'discardTop' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                { kind: 'Field', name: { kind: 'Name', value: 'direction' } },
                { kind: 'Field', name: { kind: 'Name', value: 'drawPileSize' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mustPlayDrawn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'declaredUno' } },
                { kind: 'Field', name: { kind: 'Name', value: 'canSayUno' } },
                { kind: 'Field', name: { kind: 'Name', value: 'catchablePlayer' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'challengeResult' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'offender' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'guilty' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'hand' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'canChallenge' } },
                { kind: 'Field', name: { kind: 'Name', value: 'winner' } },
                { kind: 'Field', name: { kind: 'Name', value: 'score' } },
                { kind: 'Field', name: { kind: 'Name', value: 'gameWinner' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TakeActionMutation, TakeActionMutationVariables>
export const NextRoundDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'NextRound' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'version' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'nextRound' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'version' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'version' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'RoomFields' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RoomFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Room' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mode' } },
          { kind: 'Field', name: { kind: 'Name', value: 'targetScore' } },
          { kind: 'Field', name: { kind: 'Name', value: 'capacity' } },
          { kind: 'Field', name: { kind: 'Name', value: 'roundNumber' } },
          { kind: 'Field', name: { kind: 'Name', value: 'version' } },
          { kind: 'Field', name: { kind: 'Name', value: 'localPlayer' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'members' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'connected' } },
                { kind: 'Field', name: { kind: 'Name', value: 'score' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'round' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'players' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'connected' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'cardCount' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'score' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'hand' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'playableCardIndices' } },
                { kind: 'Field', name: { kind: 'Name', value: 'turn' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'discardTop' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                { kind: 'Field', name: { kind: 'Name', value: 'direction' } },
                { kind: 'Field', name: { kind: 'Name', value: 'drawPileSize' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mustPlayDrawn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'declaredUno' } },
                { kind: 'Field', name: { kind: 'Name', value: 'canSayUno' } },
                { kind: 'Field', name: { kind: 'Name', value: 'catchablePlayer' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'challengeResult' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'offender' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'guilty' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'hand' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'color' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'canChallenge' } },
                { kind: 'Field', name: { kind: 'Name', value: 'winner' } },
                { kind: 'Field', name: { kind: 'Name', value: 'score' } },
                { kind: 'Field', name: { kind: 'Name', value: 'gameWinner' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<NextRoundMutation, NextRoundMutationVariables>
