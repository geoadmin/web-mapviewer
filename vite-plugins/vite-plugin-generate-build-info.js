import { exec as execCallback } from 'node:child_process'
import { promisify } from 'node:util'

import gitconfig from 'gitconfig'

const exec = promisify(execCallback)

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
async function getGitBranch(gitHash) {
    const headRefs = (await exec('git show-ref --heads')).stdout.trim().split('\n')
    // we now do a grep-like operation, only keeping refs that have the hash found in gitHash
    // we also have to remove all prefixes on the branch, i.e. /refs/tags or /origin/ etc...
    const branches = headRefs
        .filter((ref) => ref.indexOf(gitHash) !== -1)
        .map((matchingRef) => matchingRef.substring(matchingRef.lastIndexOf('/') + 1)) // +1 so that we skip the /
    // only taking into account the last item (like doing a head -1)
    return branches[0]
}

async function getGitUser() {
    return await gitconfig.get('user.name', { location: 'global' })
}

async function getGitUserEmail() {
    return await gitconfig.get('user.email', { location: 'global' })
}

/**
 * Small Rollout / Vite plugin that writes a JSON containing build information, such as date or app
 * version.
 *
 * The app version is received as parameter of the plugin (when added to vite plugin array)
 */
export default function generateBuildInfo(staging, version) {
    return {
        name: 'vite-plugin-generate-build-info',
        buildEnd: {
            order: 'post',
            async handler() {
                if (process.env.TEST) {
                    return
                }
                const currentHash = (await exec('git rev-parse HEAD')).stdout.trim()

                // We take the version from GIT_BRANCH but if not set, then take it from git show-ref
                let gitBranch = process.env.GIT_BRANCH
                if (!gitBranch) {
                    gitBranch = await getGitBranch(currentHash)
                }

                const now = new Date()
                const localChanges = (await exec('git status --porcelain')).stdout.trim()

                let author = process.env.COMMIT_INFO_AUTHOR
                if (!author) {
                    author = await getGitUser()
                }
                let authorEmail = process.env.COMMIT_INFO_EMAIL
                if (!authorEmail) {
                    authorEmail = await getGitUserEmail()
                }

                this.emitFile({
                    type: 'asset',
                    fileName: `${version}/info.json`,
                    source: JSON.stringify(
                        {
                            project: 'web-mapviewer',
                            staging,
                            version: version,
                            build: {
                                date: now.toISOString(),
                                author,
                                authorEmail,
                            },
                            git: {
                                branch: gitBranch,
                                hash: currentHash,
                                dirty: !!localChanges,
                                localChanges: localChanges,
                                prNumber: process.env.PULL_REQUEST_ID,
                            },
                        },
                        null,
                        2
                    ),
                })
                console.log(`Created ${version}/info.json`)
            },
        },
    }
}
