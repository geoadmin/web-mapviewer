declare module 'gitconfig' {
    interface GitConfigGetOptions {
        location: 'global' | 'local'
    }
    declare function get(
        gitConfigKey: string,
        options?: GitConfigGetOptions
    ): Promise<string | undefined>
}
