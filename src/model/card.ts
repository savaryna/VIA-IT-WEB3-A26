export const types = ['NUMBERED', 'SKIP', 'REVERSE', 'DRAW', 'WILD', 'WILD DRAW'] as const
export const colors = ['BLUE', 'GREEN', 'RED', 'YELLOW'] as const
export const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const

export type Type = (typeof types)[number]

export type Color = (typeof colors)[number]

export type Number = (typeof numbers)[number]

export type TypedCard<T extends Type> = {
  type: T
}

export type ColoredCard<T extends Type> = TypedCard<T> & {
  color: Color
}

export type NumberCard = ColoredCard<'NUMBERED'> & {
  number: Number
}

export type SkipCard = ColoredCard<'SKIP'>

export type ReverseCard = ColoredCard<'REVERSE'>

export type DrawCard = ColoredCard<'DRAW'>

export type WildCard = TypedCard<'WILD'>

export type WildDrawCard = TypedCard<'WILD DRAW'>

export type Card = NumberCard | SkipCard | ReverseCard | DrawCard | WildCard | WildDrawCard

export const isType = (value: unknown): value is Type => types.includes(value as Type)

export const isColor = (value: unknown): value is Color => colors.includes(value as Color)

export const isNumber = (value: unknown): value is Number => numbers.includes(value as Number)

export const hasColor = (card: Card, color: Color) =>
  card.type !== 'WILD' && card.type !== 'WILD DRAW' && card.color === color

export const hasNumber = (card: Card, number: Number) => card.type === 'NUMBERED' && card.number === number
