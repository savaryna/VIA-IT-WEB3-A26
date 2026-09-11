export const types = ['NUMBERED', 'SKIP', 'REVERSE', 'DRAW', 'WILD', 'WILD DRAW'] as const
export const colors = ['BLUE', 'GREEN', 'RED', 'YELLOW'] as const
export const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const

export type CardType = (typeof types)[number]

export type CardColor = (typeof colors)[number]

export type CardNumber = (typeof numbers)[number]

export type NumberCard = {
  type: 'NUMBERED'
  color: CardColor
  number: CardNumber
}

export type SkipCard = {
  type: 'SKIP'
  color: CardColor
}

export type ReverseCard = {
  type: 'REVERSE'
  color: CardColor
}

export type DrawCard = {
  type: 'DRAW'
  color: CardColor
}

export type ColoredCard = NumberCard | SkipCard | ReverseCard | DrawCard

export type WildCard = {
  type: 'WILD'
}

export type WildDrawCard = {
  type: 'WILD DRAW'
}

export type Card = ColoredCard | WildCard | WildDrawCard

export type TypedCard<T extends CardType> = Extract<Card, { type: T }>

export const isType = (value: unknown): value is CardType => types.includes(value as CardType)

export const isColor = (value: unknown): value is CardColor => colors.includes(value as CardColor)

export const isNumber = (value: unknown): value is CardNumber => numbers.includes(value as CardNumber)

export const hasType = <T extends CardType>(card: Card, type: T): card is TypedCard<T> => card.type === type

export const hasColor = (card: Card, color: CardColor): card is ColoredCard =>
  card.type !== 'WILD' && card.type !== 'WILD DRAW' && card.color === color

export const hasNumber = (card: Card, number: CardNumber): card is NumberCard =>
  card.type === 'NUMBERED' && card.number === number
