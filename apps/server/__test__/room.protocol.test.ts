import { buildSchema, validate } from 'graphql'
import { describe, expect, it } from 'vitest'

import * as operations from '../../vue/src/graphql/rooms'
import { typeDefs } from '../src/graphql/typeDefs'

const schema = buildSchema(typeDefs)

describe('room and game GraphQL operations', () => {
  it.each(Object.entries(operations))('accepts the client %s operation', (_name, document) => {
    expect(validate(schema, document)).toEqual([])
  })
})
