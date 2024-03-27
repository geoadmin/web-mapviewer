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
                const name = split[0].substring(
                    split[0].indexOf('name="') + 6, // removing the 6 chars from name="
                    split[0].length - 1 // removing trailing "
                )
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
