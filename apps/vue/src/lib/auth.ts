import { createAuthClient } from 'better-auth/vue'

import { serverURL } from './apollo'

export const authClient = createAuthClient({ baseURL: serverURL })
