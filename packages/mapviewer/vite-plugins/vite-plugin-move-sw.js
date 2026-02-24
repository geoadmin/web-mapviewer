/**
 * Vite plugin that moves the generated service worker file to a versioned directory.
 *
 * This plugin:
 *
 * 1. Runs after VitePWA generates the service worker file at the root of dist
 * 2. Moves service-workers.js to ${appVersion}/service-workers.js
 * 3. Moves service-workers.js.map if it exists
 * 4. Updates source map references in the moved JS file
 * 5. Warns if the expected files are not found
 */
export default function moveServiceWorkerFile(appVersion) {
    let outputDir = ''

    return {
        name: 'vite-plugin-move-sw',
        writeBundle: {
            order: 'post',
            async handler() {
                const fs = await import('fs/promises')
                const path = await import('path')

                // eslint-disable-next-line no-console
                console.log('[vite-plugin-move-sw] Moving service worker to versioned directory...')

                const swFileName = 'service-workers.js'
                const swMapFileName = 'service-workers.js.map'

                const oldSwPath = path.join(outputDir, swFileName)
                const newSwPath = path.join(outputDir, appVersion, swFileName)

                const oldSwMapPath = path.join(outputDir, swMapFileName)
                const newSwMapPath = path.join(outputDir, appVersion, swMapFileName)

                try {
                    // Check if SW file exists
                    await fs.access(oldSwPath)

                    // Ensure target directory exists
                    await fs.mkdir(path.dirname(newSwPath), { recursive: true })

                    // Move the service worker file
                    await fs.rename(oldSwPath, newSwPath)
                    // eslint-disable-next-line no-console
                    console.log(`[vite-plugin-move-sw] Moved ${swFileName} to ${appVersion}/`)

                    // Handle source map if it exists
                    try {
                        await fs.access(oldSwMapPath)

                        // Move the source map file
                        await fs.rename(oldSwMapPath, newSwMapPath)
                        // eslint-disable-next-line no-console
                        console.log(
                            `[vite-plugin-move-sw] Moved from ${swMapFileName} to ${appVersion}/`
                        )

                        // Update source map reference in the JS file
                        const swContent = await fs.readFile(newSwPath, 'utf-8')
                        const updatedContent = swContent.replace(
                            /\/\/# sourceMappingURL=service-workers\.js\.map/g,
                            `//# sourceMappingURL=${appVersion}/service-workers.js.map`
                        )

                        await fs.writeFile(newSwPath, updatedContent, 'utf-8')
                        // eslint-disable-next-line no-console
                        console.log('[vite-plugin-move-sw] Updated source map reference')
                    } catch (mapError) {
                        // Source map doesn't exist, which is fine
                        // eslint-disable-next-line no-console
                        console.log(
                            '[vite-plugin-move-sw] No source map found (this is OK)',
                            mapError
                        )
                    }
                    // eslint-disable-next-line no-console
                    console.log('[vite-plugin-move-sw] Service worker relocation complete')
                } catch (error) {
                    this.warn(
                        `[vite-plugin-move-sw] WARNING: Failed to move service worker file: ${error.message}. ` +
                            `Expected file at: ${oldSwPath}. SW versioning may have failed.`
                    )
                }
            },
        },

        configResolved(config) {
            outputDir = config.build.outDir
        },
    }
}
