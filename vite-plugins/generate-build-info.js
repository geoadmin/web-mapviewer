import { execSync } from 'child_process'

/**
 * Javascriptifaction of
 * https://github.com/geoadmin/web-mapviewer/blob/4826f4a05df9a5a12fc3eea2a902618800fc9425/buildspec.yml#L43-L44
 * so that it also functions properly on a window10/11 machine in PowerShell (or Window terminal)
 *
 * Original cmd is git show-ref | grep "$(git rev-parse HEAD)" | awk '!/refs/tags// {print $2}' |
 * head -1
 *
 * @param {String} gitHash The current git hash
 * @returns {String} The git branch without "origin/" or "refs/" portion
 */
function getGitBranch(gitHash) {
    const headRefs = execSync('git show-ref --heads').toString().trim().split('\n')
    // we now do a grep-like operation, only keeping refs that have the hash found in gitHash
    // we also have to remove all prefixes on the branch, i.e. /refs/tags or /origin/ etc...
    const branches = headRefs
        .filter((ref) => ref.indexOf(gitHash) !== -1)
        .map((matchingRef) => matchingRef.substring(matchingRef.lastIndexOf('/') + 1)) // +1 so that we skip the /
    // only taking into account the last item (like doing a head -1)
    return branches[0]
}

const currentHash = execSync('git rev-parse HEAD').toString().trim()

// We take the version from GIT_BRANCH but if not set, then take it from git show-ref
let gitBranch = process.env.GIT_BRANCH
if (!gitBranch) {
    gitBranch = getGitBranch(currentHash)
}

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
                const localChanges = execSync('git status --porcelain').toString().trim()
                this.emitFile({
                    type: 'asset',
                    fileName: `${version}/info.json`,
                    source: JSON.stringify(
                        {
                            version: version,
                            build: {
                                date: now.toISOString(),
                                author: process.env.USER,
                            },
                            git: {
                                branch: gitBranch,
                                hash: currentHash,
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
