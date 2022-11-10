import { execSync } from 'child_process'

/**
 * Small Rollout / Vite plugin that writes a JSON containing build information, such as date or app
 * version.
 *
 * The app version is received as parameter of the plugin (when added to vite plugin array)
 */
export default function generateBuildInfo(version) {
    return {
        name: 'generateBuildInfo',
        buildEnd: {
            sequential: true,
            order: 'post',
            async handler() {
                const now = new Date()
                const gitBranch = execSync(
                    `git show-ref --heads | grep "$(git --no-pager show --format=%H)" | head -1 | awk '{gsub("refs/heads/", ""); print $2}'`
                )
                    .toString()
                    .trim()
                const gitHash = execSync('git rev-parse HEAD').toString().trim()
                const localChanges = execSync('git status --porcelain').toString().trim()
                this.emitFile({
                    type: 'asset',
                    fileName: 'info.json',
                    source: JSON.stringify(
                        {
                            version: version,
                            build: {
                                date: now.toISOString(),
                                author: process.env.USER,
                            },
                            git: {
                                branch: gitBranch,
                                hash: gitHash,
                                dirty: !!localChanges,
                                localChanges: localChanges,
                            },
                        },
                        null,
                        2
                    ),
                })
            },
        },
    }
}
