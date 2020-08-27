
// Loading filesystem API
const { resolve } = require('path');
const fs = require('fs');

/**
 * Perform a deep scan (recursive) of a directory, and returns (through an asynchronous iterator) all file paths found in this folder
 * @param dir a path (relative or absolute) to a directory to be scanned
 * @returns {any} an Asynchronous Iterators returning all file paths of the directory, paths will be absolute even if dir param is relative
 */
async function* getFiles(dir) {
    const directoryEntries = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const entry of directoryEntries) {
        const resolvedEntry = resolve(dir, entry.name);
        if (entry.isDirectory()) {
            yield* getFiles(resolvedEntry);
        } else {
            yield resolvedEntry;
        }
    }
}

function fileExists(file) {
    try {
        return fs.existsSync(file);
    } catch (err) {
        return false;
    }
}

module.exports = {
    getFiles,
    fileExists
}
