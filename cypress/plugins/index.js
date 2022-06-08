// https://docs.cypress.io/guides/guides/plugins-guide.html

// if you need a custom webpack configuration you can uncomment the following import
// and then use the `file:preprocessor` event
// as explained in the cypress docs
// https://docs.cypress.io/api/plugins/preprocessors-api.html#Examples
const { startDevServer } = require('@cypress/vite-dev-server')

require('dotenv').config()
const { cypressBrowserPermissionsPlugin } = require('cypress-browser-permissions')

const fs = require('fs')
const path = require('path')
const vite = require('vite')

const cache = {}

module.exports = (on, config) => {
    config = cypressBrowserPermissionsPlugin(on, config)

    on('task', {
        getFiles(folderName) {
            return new Promise((resolve, reject) => {
                fs.readdir(folderName, (err, files) => {
                    if (err) {
                        return reject(err)
                    }

                    resolve(files)
                })
            })
        },
        clearFolder(folderName) {
            // eslint-disable-next-line no-console
            console.log('clearing folder %s', folderName)

            return new Promise((resolve, reject) => {
                try {
                    const files = fs.readdirSync(folderName)
                    files.forEach((file) => {
                        fs.unlinkSync(path.join(folderName, file))
                    })
                    resolve(true)
                } catch (err) {
                    reject(err)
                }
            })
        },
        findFiles({ folderName, extension }) {
            return new Promise((resolve, reject) => {
                fs.readdir(folderName, (err, files) => {
                    if (err) {
                        return reject(err)
                    }
                    files = files.filter((f) => {
                        const position = f.length - extension.length - 1
                        return f.includes(`.${extension}`, position)
                    })

                    resolve(files)
                })
            })
        },
    })

    on('dev-server:start', (options) => {
        return startDevServer({
            options,
            viteConfig: {
                configFile: path.resolve(__dirname, '..', '..', 'vite.config.js'),
            },
        })
    })

    // heavily inspired by https://adamlynch.com/preprocess-cypress-tests-with-vite/
    // in order to be able to use Vite as the preprocessor (instead of webpack)
    // while using Cypress, there is some wiring to be done
    on('file:preprocessor', async (file) => {
        const { filePath, outputPath, shouldWatch } = file

        if (cache[filePath]) {
            return cache[filePath]
        }

        const filename = path.basename(outputPath)
        const filenameWithoutExtension = path.basename(outputPath, path.extname(outputPath))

        const viteConfig = {
            build: {
                emptyOutDir: false,
                minify: false,
                outDir: path.dirname(outputPath),
                sourcemap: true,
                write: true,
            },
        }

        if (filename.endsWith('.html')) {
            viteConfig.build.rollupOptions = {
                input: {
                    [filenameWithoutExtension]: filePath,
                },
            }
        } else {
            viteConfig.build.lib = {
                entry: filePath,
                fileName: () => filename,
                formats: ['es'],
                name: filenameWithoutExtension,
            }
        }

        if (shouldWatch) {
            viteConfig.build.watch = true
        }

        const watcher = await vite.build(viteConfig)

        if (shouldWatch) {
            watcher.on('event', (event) => {
                if (event.code === 'END') {
                    file.emit('rerun')
                }
            })
            file.on('close', () => {
                delete cache[filePath]
                watcher.close()
            })
        }

        cache[filePath] = outputPath
        await vite.build(viteConfig)
        return outputPath
    })

    return Object.assign({}, config, {
        fixturesFolder: 'cypress/fixtures',
        integrationFolder: 'cypress/integration',
        screenshotsFolder: 'cypress/screenshots',
        videosFolder: 'cypress/videos',
        supportFile: 'cypress/support/index.js',
    })
}
