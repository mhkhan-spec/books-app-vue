import 'vue-router'

declare module 'vue-router' {
    interface RouteMeta {
        // Add all your custom meta fields here
        title?: string
        requiresAuth?: boolean
        layout?: 'default' | 'auth' | 'blank'
        transition?: string
    }
}

// You can add other libraries here too, for example:
// import 'axios'
// declare module 'axios' { ... }