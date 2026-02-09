import 'vue-router'

declare module 'vue-router' {
    interface RouteMeta {

        title?: string
        requiresAuth?: boolean
        layout?: 'default' | 'auth' | 'blank'
        transition?: string
    }
}
