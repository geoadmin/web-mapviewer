// https://gist.github.com/dcollien/76d17f69afe748afad7ff3a15ff9a08a

class Parser {
    constructor(byteArray, boundary) {
        this.byteArray = byteArray
        this.current = null
        this.index = 0
        this.boundary = boundary
    }

    skipPastNextBoundary() {
        let index = 0
        let isBoundary = false

        while (!isBoundary) {
            if (this.next() === null) {
                return false
            }

            if (this.current === this.boundary[index]) {
                index++
                if (index === this.boundary.length) {
                    isBoundary = true
                }
            } else {
                index = 0
            }
        }

        return true
    }

    parseHeader() {
        let header = ''
        const skipUntilNextLine = () => {
            header += this.next()
            while (this.current !== '\n' && this.current !== null) {
                header += this.next()
            }
            if (this.current === null) {
                return null
            }
        }

        let hasSkippedHeader = false
        while (!hasSkippedHeader) {
            skipUntilNextLine()
            header += this.next()
            if (this.current === '\r') {
                header += this.next() // skip
            }

            if (this.current === '\n') {
                hasSkippedHeader = true
            } else if (this.current === null) {
                return null
            }
        }

        return header
    }

    next() {
        if (this.index >= this.byteArray.byteLength) {
            this.current = null
            return null
        }

        this.current = String.fromCharCode(this.byteArray[this.index])
        this.index++
        return this.current
    }
}

function processSections(byteArray, sections) {
    for (const section of sections) {
        if (section.header['content-type'] === 'text/plain') {
            const slice = byteArray.slice(section.bodyStart, section.end)
            section.text = Array.from(slice)
                .map((byte) => String.fromCharCode(byte))
                .join('')
        } else {
            const slice = byteArray.slice(section.bodyStart, section.end)
            section.file = new Blob([slice], { type: section.header['content-type'] })
            const fileNameMatching =
                /\bfilename="([^"]*)"/g.exec(section.header['content-disposition']) || []
            section.fileName = fileNameMatching[1] || ''
        }
        const matching = /\bname="([^"]*)"/g.exec(section.header['content-disposition']) || []
        section.name = matching[1] || ''

        delete section.headerStart
        delete section.bodyStart
        delete section.end
    }

    return sections
}

function multiparts(byteArray, boundary) {
    boundary = '--' + boundary
    const parser = new Parser(byteArray, boundary)

    let sections = []
    while (parser.skipPastNextBoundary()) {
        const header = parser.parseHeader()

        if (header !== null) {
            const headerParts = header.trim().split('\n')

            const headerObj = {}
            for (let i = 0; i !== headerParts.length; ++i) {
                const parts = headerParts[i].split(':')
                headerObj[parts[0].trim().toLowerCase()] = (parts[1] || '').trim()
            }

            sections.push({
                bodyStart: parser.index,
                header: headerObj,
                headerStart: parser.index - header.length,
            })
        }
    }

    // add dummy section for end
    sections.push({
        headerStart: byteArray.byteLength - boundary.length - 2, // 2 hyphens at end
    })
    for (let i = 0; i !== sections.length - 1; ++i) {
        sections[i].end = sections[i + 1].headerStart - boundary.length - 2
    }
    // remove dummy section
    sections.pop()

    return processSections(byteArray, sections)
}

export function parse(byteArray, boundary) {
    return multiparts(byteArray, boundary).reduce((hash, section) => {
        hash[section.name] = {
            blob: section.file,
            fileName: section.fileName,
        }

        return hash
    }, {})
}

export function parseInterception(interception) {
    const byteArray = new Uint8Array(interception.request.body)
    const boundary = interception.request.headers['content-type'].split('boundary=')[1]
    return parse(byteArray, boundary)
}
