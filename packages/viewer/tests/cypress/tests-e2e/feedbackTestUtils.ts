import type { CyHttpMessages } from 'cypress/types/net-stubbing'

interface FormDataPart {
    [key: string]: string | undefined
}

interface CyRequest {
    headers: Record<string, string>
    body: string
}

function getFormDataBoundary(
    request: CyRequest | CyHttpMessages.IncomingRequest
): string | undefined {
    const contentType = request.headers['content-type']
    const boundaryMatch =
        typeof contentType === 'string' ? contentType.match(/boundary=([\w-]+)/) : undefined
    return (boundaryMatch && boundaryMatch[1]) || undefined
}

export function parseFormData(request: CyRequest | CyHttpMessages.IncomingRequest): FormDataPart {
    const boundary = getFormDataBoundary(request)
    if (!boundary) {
        throw new Error('No boundary found in form data')
    }

    const formDataParts = request.body.split(boundary)
    return (
        formDataParts
            .filter((part: string) => part.indexOf('Content-Disposition') !== -1)
            .map((rawPart: string) => {
                const split = rawPart
                    .split(/\r?\n/)
                    .filter((split: string) => split !== '--' && split.length > 0)
                if (split.length === 0) {
                    return {}
                }
                let name = split[0]!.substring(
                    split[0]!.indexOf('name="') + 6, // removing the 6 chars from name="
                    split[0]!.length - 1 // removing trailing "
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
            .reduce((accumulator: FormDataPart, param: FormDataPart) =>
                Object.assign(accumulator, param)
            )
    )
}

interface FeedbackOptions {
    delay?: number
    alias?: string
}

interface FeedbackResponse {
    success: boolean
}

export function interceptFeedback(success: boolean, options: FeedbackOptions = {}): void {
    const { delay = 1000, alias = 'feedback' } = options
    cy.intercept('POST', '**/api/feedback', (req: CyHttpMessages.IncomingHttpRequest) => {
        req.reply({
            body: {
                success,
            } as FeedbackResponse,
            delay,
        })
    }).as(alias)
}
