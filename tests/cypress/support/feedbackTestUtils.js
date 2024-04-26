function getFormDataBoundary(request) {
    const contentType = request.headers['content-type']
    const boundaryMatch = contentType.match(/boundary=([\w-]+)/)
    return boundaryMatch && boundaryMatch[1]
}

export function parseFormData(request) {
    const boundary = getFormDataBoundary(request)
    const formDataParts = request.body.split(boundary)
    return (
        formDataParts
            .filter((part) => part.indexOf('Content-Disposition') !== -1)
            .map((rawPart) => {
                const split = rawPart
                    .split(/\r?\n/)
                    .filter((split) => split !== '--' && split.length > 0)
                let name = split[0].substring(
                    split[0].indexOf('name="') + 6, // removing the 6 chars from name="
                    split[0].length - 1 // removing trailing "
                )
                // Special handling for attachment, only the filename will be checked
                if (name.includes('attachment') && name.includes('filename')) {
                    const fileName = name.substring(name.indexOf('filename="') + 10) // removing the 10 chars from filename="
                    // no need to remove trailing, since it's the end of the string
                    name = 'attachment'
                    return {
                        [name]: fileName,
                    }
                }
                return {
                    [name]: split[1],
                }
            })
            // flatten array of params into a single object (with param name as keys)
            .reduce((accumulator, param) => Object.assign(accumulator, param))
    )
}

export function interceptFeedback(success) {
    cy.intercept('POST', '**/api/feedback', (req) => {
        req.reply({
            body: {
                success,
            },
            delay: 1000,
        })
    }).as('feedback')
}
