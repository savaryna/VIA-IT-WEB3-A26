import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'apps/server/src/graphql/schema.graphql',
  hooks: { afterAllFileWrite: ['oxfmt'] },
  generates: {
    'apps/server/src/graphql/generated.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        enumsAsTypes: true,
        useTypeImports: true,
        contextType: './context#Context',
        inputMaybeValue: 'T | null',
        avoidOptionals: { defaultValue: true },
        maybeValue: 'T | null | undefined',
        mappers: { Room: '../rooms/service#RoomView' },
      },
    },
  },
}
export default config
