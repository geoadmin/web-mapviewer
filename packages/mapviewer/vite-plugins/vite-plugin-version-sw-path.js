/**
 * Vite plugin that versions the service worker path in generated bundles.
 *
 * This plugin:
 * 1. Finds chunks containing service worker registration code from the virtual:pwa-register module
 * 2. Replaces "./service-workers.js" with the versioned path (e.g., "./v1.59.0/service-workers.js")
 * 3. Injects scope configuration {scope:"/"} to ensure SW controls the entire origin
 * 4. Emits a validation file (sw-ready.json) to indicate successful configuration
 * 5. Warns if no SW registration pattern is found (validation failure)
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
                    // Pattern 1: Look for Workbox registration with the SW path
                    // Example: new Workbox("./service-workers.js", {...})
                    const workboxPattern = /new\s+(\w+)\("\.\/service-workers\.js"/g

                    if (workboxPattern.test(chunk.code)) {
                        // eslint-disable-next-line no-console
                        console.log(
                            `[vite-plugin-version-sw-path] Found SW registration in ${fileName}`
                        )
                        swPatternFound = true

                        // Replace the SW path with versioned path
                        chunk.code = chunk.code.replace(
                            /new\s+(\w+)\("\.\/service-workers\.js"/g,
                            `new $1("./${appVersion}/service-workers.js"`
                        )

                        // Pattern 2: Also check for scope configuration and inject if needed
                        // Look for the options object: new Workbox("path", {scope:"./", type:"classic"})
                        // We need to ensure scope is set to "/" for root-level control
                        const scopePattern = /new\s+(\w+)\("\.\/[^"]+",\s*\{([^}]*)\}/g

                        chunk.code = chunk.code.replace(scopePattern, (match, constructor, opts) => {
                            // Check if scope is already defined
                            if (opts.includes('scope:')) {
                                // Replace existing scope with "/"
                                const newOpts = opts.replace(/scope:\s*"[^"]*"/, 'scope:"/"')
                                return `new ${constructor}("./${appVersion}/service-workers.js",{${newOpts}}`
                            } else {
                                // Inject scope if not present
                                return `new ${constructor}("./${appVersion}/service-workers.js",{scope:"/",${opts}}`
                            }
                        })
                    }

                    // Pattern 3: Look for standalone string references to the SW path
                    // (in case registration uses a different pattern)
                    if (chunk.code.includes('"./service-workers.js"')) {
                        // eslint-disable-next-line no-console
                        console.log(
                            `[vite-plugin-version-sw-path] Found SW path reference in ${fileName}`
                        )
                        swPatternFound = true

                        chunk.code = chunk.code.replace(
                            /"\.\/service-workers\.js"/g,
                            `"./${appVersion}/service-workers.js"`
                        )
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
                swPath: swPatternFound ? `${appVersion}/service-workers.js` : null,
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
