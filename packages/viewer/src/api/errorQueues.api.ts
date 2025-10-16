import { ErrorMessage } from '@swissgeo/log/Message'

function getStandardErrorMessage(queryValue: string | undefined, urlParamName: string) {
    return new ErrorMessage('url_parameter_error', {
        param: urlParamName,
        value: queryValue,
    })
}

interface ValidationResponse {
    valid: boolean
    errors: ErrorMessage[]
}

/**
 * Return the standard feedback for most parameters given in the URL: if the query is validated, it
 * can proceed and be set in the store.
 *
 * @param queryValue The value of the URL parameter given
 * @param isValid Is the value valid or not
 * @param urlParamName The name of the URL parameter
 */
export function getStandardValidationResponse(
    queryValue: string | undefined,
    isValid: boolean,
    urlParamName: string
): ValidationResponse {
    return {
        valid: isValid,
        errors: isValid ? [] : [getStandardErrorMessage(queryValue, urlParamName)],
    }
}
