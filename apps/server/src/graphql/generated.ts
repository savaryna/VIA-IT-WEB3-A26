import type { GraphQLResolveInfo } from 'graphql'

import type { RoomView } from '../rooms/service'
import type { Context } from './context'
export type Maybe<T> = T | null | undefined
export type InputMaybe<T> = T | null
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
}

export type ActionInput = {
  accused?: InputMaybe<Scalars['Int']['input']>
  cardIndex?: InputMaybe<Scalars['Int']['input']>
  newColor?: InputMaybe<CardColor>
  sayUno?: InputMaybe<Scalars['Boolean']['input']>
  type: ActionType
}

export type ActionType = 'catchUnoFailure' | 'challenge' | 'draw' | 'play' | 'sayUno'

export type Card = {
  __typename?: 'Card'
  color?: Maybe<CardColor>
  number?: Maybe<Scalars['Int']['output']>
  type: Scalars['String']['output']
}

export type CardColor = 'BLUE' | 'GREEN' | 'RED' | 'YELLOW'

export type ChallengeResult = {
  __typename?: 'ChallengeResult'
  guilty: Scalars['Boolean']['output']
  hand: Array<Card>
  offender: Scalars['Int']['output']
}

export type CreateRoomInput = {
  capacity: Scalars['Int']['input']
  mode: GameMode
  targetScore: Scalars['Int']['input']
}

export type Direction = 'clockwise' | 'counterclockwise'

export type GameMode = 'round' | 'score'

export type Member = {
  __typename?: 'Member'
  connected: Scalars['Boolean']['output']
  name: Scalars['String']['output']
  score: Scalars['Int']['output']
  userId: Scalars['ID']['output']
}

export type Mutation = {
  __typename?: 'Mutation'
  createRoom: Room
  joinRoom: Room
  nextRound: Room
  startGame: Room
  takeAction: Room
}

export type MutationCreateRoomArgs = {
  input: CreateRoomInput
}

export type MutationJoinRoomArgs = {
  id: Scalars['ID']['input']
}

export type MutationNextRoundArgs = {
  id: Scalars['ID']['input']
  version: Scalars['Int']['input']
}

export type MutationStartGameArgs = {
  id: Scalars['ID']['input']
  version: Scalars['Int']['input']
}

export type MutationTakeActionArgs = {
  action: ActionInput
  id: Scalars['ID']['input']
  version: Scalars['Int']['input']
}

export type Player = {
  __typename?: 'Player'
  cardCount: Scalars['Int']['output']
  connected: Scalars['Boolean']['output']
  name: Scalars['String']['output']
  score: Scalars['Int']['output']
}

export type Query = {
  __typename?: 'Query'
  myRooms: Array<Room>
  room: Room
}

export type QueryRoomArgs = {
  id: Scalars['ID']['input']
}

export type Room = {
  __typename?: 'Room'
  capacity: Scalars['Int']['output']
  id: Scalars['ID']['output']
  localPlayer: Scalars['Int']['output']
  members: Array<Member>
  mode: GameMode
  ownerId: Scalars['ID']['output']
  round?: Maybe<Round>
  roundNumber: Scalars['Int']['output']
  status: RoomStatus
  targetScore: Scalars['Int']['output']
  version: Scalars['Int']['output']
}

export type RoomStatus = 'between' | 'finished' | 'playing' | 'waiting'

export type Round = {
  __typename?: 'Round'
  canChallenge: Scalars['Boolean']['output']
  canSayUno: Scalars['Boolean']['output']
  catchablePlayer?: Maybe<Scalars['Int']['output']>
  challengeResult?: Maybe<ChallengeResult>
  color: CardColor
  declaredUno: Scalars['Boolean']['output']
  direction: Direction
  discardTop: Card
  drawPileSize: Scalars['Int']['output']
  gameWinner?: Maybe<Scalars['Int']['output']>
  hand: Array<Card>
  mustPlayDrawn: Scalars['Boolean']['output']
  playableCardIndices: Array<Scalars['Int']['output']>
  players: Array<Player>
  score?: Maybe<Scalars['Int']['output']>
  turn?: Maybe<Scalars['Int']['output']>
  winner?: Maybe<Scalars['Int']['output']>
}

export type Subscription = {
  __typename?: 'Subscription'
  roomChanged: Room
}

export type SubscriptionRoomChangedArgs = {
  id: Scalars['ID']['input']
}

export type ResolverTypeWrapper<T> = Promise<T> | T

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>
}
export type Resolver<
  TResult,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
  TArgs = Record<PropertyKey, never>,
> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => Promise<TResult> | TResult

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
  TArgs = Record<PropertyKey, never>,
> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo,
) => Maybe<TTypes> | Promise<Maybe<TTypes>>

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo,
) => boolean | Promise<boolean>

export type NextResolverFn<T> = () => Promise<T>

export type DirectiveResolverFn<
  TResult = Record<PropertyKey, never>,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
  TArgs = Record<PropertyKey, never>,
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  ActionInput: ActionInput
  ActionType: ActionType
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>
  Card: ResolverTypeWrapper<Card>
  CardColor: CardColor
  ChallengeResult: ResolverTypeWrapper<ChallengeResult>
  CreateRoomInput: CreateRoomInput
  Direction: Direction
  GameMode: GameMode
  ID: ResolverTypeWrapper<Scalars['ID']['output']>
  Int: ResolverTypeWrapper<Scalars['Int']['output']>
  Member: ResolverTypeWrapper<Member>
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>
  Player: ResolverTypeWrapper<Player>
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>
  Room: ResolverTypeWrapper<RoomView>
  RoomStatus: RoomStatus
  Round: ResolverTypeWrapper<Round>
  String: ResolverTypeWrapper<Scalars['String']['output']>
  Subscription: ResolverTypeWrapper<Record<PropertyKey, never>>
}

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  ActionInput: ActionInput
  Boolean: Scalars['Boolean']['output']
  Card: Card
  ChallengeResult: ChallengeResult
  CreateRoomInput: CreateRoomInput
  ID: Scalars['ID']['output']
  Int: Scalars['Int']['output']
  Member: Member
  Mutation: Record<PropertyKey, never>
  Player: Player
  Query: Record<PropertyKey, never>
  Room: RoomView
  Round: Round
  String: Scalars['String']['output']
  Subscription: Record<PropertyKey, never>
}

export type CardResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['Card'] = ResolversParentTypes['Card'],
> = {
  color?: Resolver<Maybe<ResolversTypes['CardColor']>, ParentType, ContextType>
  number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>
}

export type ChallengeResultResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['ChallengeResult'] = ResolversParentTypes['ChallengeResult'],
> = {
  guilty?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  hand?: Resolver<Array<ResolversTypes['Card']>, ParentType, ContextType>
  offender?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
}

export type MemberResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['Member'] = ResolversParentTypes['Member'],
> = {
  connected?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  score?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
}

export type MutationResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation'],
> = {
  createRoom?: Resolver<ResolversTypes['Room'], ParentType, ContextType, RequireFields<MutationCreateRoomArgs, 'input'>>
  joinRoom?: Resolver<ResolversTypes['Room'], ParentType, ContextType, RequireFields<MutationJoinRoomArgs, 'id'>>
  nextRound?: Resolver<
    ResolversTypes['Room'],
    ParentType,
    ContextType,
    RequireFields<MutationNextRoundArgs, 'id' | 'version'>
  >
  startGame?: Resolver<
    ResolversTypes['Room'],
    ParentType,
    ContextType,
    RequireFields<MutationStartGameArgs, 'id' | 'version'>
  >
  takeAction?: Resolver<
    ResolversTypes['Room'],
    ParentType,
    ContextType,
    RequireFields<MutationTakeActionArgs, 'action' | 'id' | 'version'>
  >
}

export type PlayerResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['Player'] = ResolversParentTypes['Player'],
> = {
  cardCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  connected?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  score?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
}

export type QueryResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query'],
> = {
  myRooms?: Resolver<Array<ResolversTypes['Room']>, ParentType, ContextType>
  room?: Resolver<ResolversTypes['Room'], ParentType, ContextType, RequireFields<QueryRoomArgs, 'id'>>
}

export type RoomResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['Room'] = ResolversParentTypes['Room'],
> = {
  capacity?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  localPlayer?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  members?: Resolver<Array<ResolversTypes['Member']>, ParentType, ContextType>
  mode?: Resolver<ResolversTypes['GameMode'], ParentType, ContextType>
  ownerId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  round?: Resolver<Maybe<ResolversTypes['Round']>, ParentType, ContextType>
  roundNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  status?: Resolver<ResolversTypes['RoomStatus'], ParentType, ContextType>
  targetScore?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  version?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
}

export type RoundResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['Round'] = ResolversParentTypes['Round'],
> = {
  canChallenge?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  canSayUno?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  catchablePlayer?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  challengeResult?: Resolver<Maybe<ResolversTypes['ChallengeResult']>, ParentType, ContextType>
  color?: Resolver<ResolversTypes['CardColor'], ParentType, ContextType>
  declaredUno?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  direction?: Resolver<ResolversTypes['Direction'], ParentType, ContextType>
  discardTop?: Resolver<ResolversTypes['Card'], ParentType, ContextType>
  drawPileSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  gameWinner?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  hand?: Resolver<Array<ResolversTypes['Card']>, ParentType, ContextType>
  mustPlayDrawn?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  playableCardIndices?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>
  players?: Resolver<Array<ResolversTypes['Player']>, ParentType, ContextType>
  score?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  turn?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  winner?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
}

export type SubscriptionResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription'],
> = {
  roomChanged?: SubscriptionResolver<
    ResolversTypes['Room'],
    'roomChanged',
    ParentType,
    ContextType,
    RequireFields<SubscriptionRoomChangedArgs, 'id'>
  >
}

export type Resolvers<ContextType = Context> = {
  Card?: CardResolvers<ContextType>
  ChallengeResult?: ChallengeResultResolvers<ContextType>
  Member?: MemberResolvers<ContextType>
  Mutation?: MutationResolvers<ContextType>
  Player?: PlayerResolvers<ContextType>
  Query?: QueryResolvers<ContextType>
  Room?: RoomResolvers<ContextType>
  Round?: RoundResolvers<ContextType>
  Subscription?: SubscriptionResolvers<ContextType>
}
