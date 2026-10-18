import '@uno/ui/styles.css'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import { apolloClient } from './lib/apollo'
import { router } from './router'

const app = createApp(App)
app.provide(DefaultApolloClient, apolloClient)
app.use(createPinia())
app.use(router)
void router.isReady().then(() => app.mount('#app'))
