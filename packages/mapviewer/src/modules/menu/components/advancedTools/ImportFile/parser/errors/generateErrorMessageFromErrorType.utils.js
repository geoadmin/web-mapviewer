import { ErrorMessage } from '@geoadmin/log/Message'
import { AxiosError } from 'axios'

import EmptyFileContentError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/EmptyFileContentError.error'
import OutOfBoundsError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/OutOfBoundsError.error'
import UnknownProjectionError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/UnknownProjectionError.error'

/**
 * Generates an error message from the type of error received from a FileParser (or the parseAll
 * function).
 *
 * @param {Error} error An error raised by a FileParser, or the parseAll
 * @param {AbstractLayer} layer The layer which originated the error
 * @returns {ErrorMessage}
 */
export default function generateErrorMessageFromErrorType(error, layer) {
    if (error instanceof AxiosError || /fetch/.test(error.message)) {
        return new ErrorMessage({
            msg: 'loading_error_network_failure',
            sourceId: layer?.id,
        })
    } else if (error instanceof OutOfBoundsError) {
        return new ErrorMessage({
            msg: 'imported_file_out_of_bounds',
            sourceId: layer?.id,
        })
    } else if (error instanceof EmptyFileContentError) {
        return new ErrorMessage({ msg: 'kml_gpx_file_empty', sourceId: layer?.id })
    } else if (error instanceof UnknownProjectionError) {
        return new ErrorMessage({
            msg: 'unknown_projection_error',
            params: { epsg: error.epsg },
            sourceId: layer?.id,
        })
    }
    return new ErrorMessage({ msg: 'invalid_import_file_error', sourceId: layer?.id })
}
