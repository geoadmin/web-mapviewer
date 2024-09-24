import ErrorMessage from '@/utils/ErrorMessage.class'

export function getStandardErrorMessage(query, urlParamName) {
    return new ErrorMessage('url_parameter_error', {
        param: urlParamName,
        value: query,
    })
}

/**
 * Return the standard feedback for most parameters given in the URL: if the query is validated, it
 * can proceed and be set in the store.
 *
 * @param {any} query The value of the URL parameter given
 * @param {Boolean} is_valid Is the value valid or not
 * @returns
 */
export function getStandardValidationResponse(query, is_valid, urlParamName) {
    return {
        valid: is_valid,
        errors: is_valid ? null : getStandardErrorMessage(query, urlParamName),
    }
}
