import { LayerErrorMessage } from '@geoadmin/layers'
import { AxiosError } from 'axios'

import EmptyFileContentError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/EmptyFileContentError.error'
import OutOfBoundsError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/OutOfBoundsError.error'
import UnknownProjectionError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/UnknownProjectionError.error'

/**
 * Generates an error message from the type of error received from a FileParser (or the parseAll
 * function).
 *
 * @param {Error} error An error raised by a FileParser, or the parseAll
 * @returns {ErrorMessage}
 */
export default function generateErrorMessageFromErrorType(error) {
    if (error instanceof AxiosError || /fetch/.test(error.message)) {
        return new LayerErrorMessage('loading_error_network_failure')
    } else if (error instanceof OutOfBoundsError) {
        return new LayerErrorMessage('imported_file_out_of_bounds')
    } else if (error instanceof EmptyFileContentError) {
        return new LayerErrorMessage('kml_gpx_file_empty')
    } else if (error instanceof UnknownProjectionError) {
        return new LayerErrorMessage('unknown_projection_error', { epsg: error.epsg })
    }
    return new LayerErrorMessage('invalid_import_file_error')
}
