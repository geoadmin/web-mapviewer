import { ErrorMessage } from '@geoadmin/log/Message'

function getDefaultErrorMessage(query: string, urlParamName: string): ErrorMessage {
    return new ErrorMessage('url_parameter_error', {
        param: urlParamName,
        value: query,
    })
}

export interface ValidationResponse {
    valid: boolean
    errors?: ErrorMessage[]
}

/**
 * Return the standard feedback for most parameters given in the URL: if the query is validated, it
 * can proceed and be set in the store.
 *
 * @param query The value of the URL parameter given
 * @param isValid Is the value valid or not
 * @param urlParamName Name of this parameter in the URL
 */
export function getDefaultValidationResponse(
    query: string,
    isValid: boolean,
    urlParamName: string
): ValidationResponse {
    let errors: ErrorMessage[] | undefined
    if (!isValid) {
        errors = [getDefaultErrorMessage(query, urlParamName)]
    }
    return {
        valid: isValid,
        errors,
    }
}
