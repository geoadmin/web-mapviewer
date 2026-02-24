/**
 * Vite plugin that validates the service worker registration path and emits a build validation file.
 *
 * This plugin:
 * 1. Finds chunks containing service worker registration code from the virtual:pwa-register module
 * 2. Validates that the registration path remains "./service-workers.js" (root scope-safe path)
 * 3. Emits a validation file (sw-ready.json) to indicate successful configuration
 * 4. Warns if no SW registration pattern is found (validation failure)
 */
export default function versionServiceWorkerPath(appVersion, staging) {
    let swPatternFound = false
    let outputDir = ''

    return {
        name: 'vite-plugin-version-sw-path',
        enforce: 'post',

        configResolved(config) {
            outputDir = config.build.outDir
        },

        generateBundle(options, bundle) {
            // eslint-disable-next-line no-console
            console.log('[vite-plugin-version-sw-path] Scanning bundles for SW registration...')

            for (const fileName in bundle) {
                const chunk = bundle[fileName]

                if (chunk.type === 'chunk' && chunk.code) {
                    // Pattern 1: Look for Workbox registration with root SW path
                    // Example: new Workbox("./service-workers.js", {...})
                    const workboxPattern = /new\s+(\w+)\("\.\/service-workers\.js"/g

                    if (workboxPattern.test(chunk.code)) {
                        // eslint-disable-next-line no-console
                        console.log(
                            `[vite-plugin-version-sw-path] Found SW registration in ${fileName}`
                        )
                        swPatternFound = true
                    }

                    // Pattern 2: Look for standalone string references to the root SW path
                    if (chunk.code.includes('"./service-workers.js"')) {
                        // eslint-disable-next-line no-console
                        console.log(
                            `[vite-plugin-version-sw-path] Found SW path reference in ${fileName}`
                        )
                        swPatternFound = true
                    }
                }
            }

            if (!swPatternFound) {
                this.warn(
                    '[vite-plugin-version-sw-path] WARNING: No service worker registration pattern found in bundle! ' +
                        'SW versioning may have failed. Offline functionality may not work correctly.'
                )
            }
        },

        async writeBundle() {
            const fs = await import('fs/promises')
            const path = await import('path')

            // Emit validation file indicating whether SW versioning succeeded
            const validationData = {
                swVersioned: swPatternFound,
                swPath: swPatternFound ? 'service-workers.js' : null,
                timestamp: new Date().toISOString(),
                staging,
                version: appVersion,
            }

            const validationFilePath = path.join(outputDir, appVersion, 'sw-ready.json')

            try {
                // Ensure directory exists
                await fs.mkdir(path.dirname(validationFilePath), { recursive: true })

                await fs.writeFile(
                    validationFilePath,
                    JSON.stringify(validationData, null, 2),
                    'utf-8'
                )
                // eslint-disable-next-line no-console
                console.log(
                    `[vite-plugin-version-sw-path] Validation file written: ${validationFilePath}`
                )

                if (!swPatternFound) {
                    // eslint-disable-next-line no-console
                    console.error(
                        '[vite-plugin-version-sw-path] ERROR: SW versioning validation FAILED'
                    )
                }
            } catch (error) {
                this.error(
                    `[vite-plugin-version-sw-path] Failed to write validation file: ${error.message}`
                )
            }
        },
    }
}
