declare module 'gitconfig' {
    interface GitConfigGetOptions {
        location: 'global' | 'local'
    }
    declare function get(gitConfigKey:string , options?: GitConfigGetOptions): Promise<string | undefined>
}

declare global {
    namespace NodeJS {
        /**
         * All the flags used in our package.json scripts/target to change how the build behaves
         */
        interface ProcessEnv {
            /** App version from the package.json file */
            APP_VERSION: string
            /** Tells if the build is a test build (Cypress, Unit tests) */
            TEST: boolean
            /** Should this build/serve use HTTPS */
            USE_HTTPS: boolean
        }
    }
}
