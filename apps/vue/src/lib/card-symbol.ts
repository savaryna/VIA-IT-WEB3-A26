import type { Card } from '@uno/engine'

export function cardSymbol(card: Card): string {
  if (card.type === 'NUMBERED') return String(card.number)
  return { DRAW: '+2', REVERSE: '«', SKIP: 'x', WILD: 'W', 'WILD DRAW': '+4' }[card.type]
}
