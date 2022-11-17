import printJS from 'print-js'

/**
 * Prints the content of the given HTML element through the browser print prompt. The user can then
 * decide to export that as a PDF or print it physically.
 *
 * @param {HTMLElement} htmlContent Some HTML, to be printed separately (no app GUI)
 */
const promptUserToPrintHtmlContent = (htmlContent) => {
    printJS({
        printable: htmlContent,
        type: 'html',
    })
}
export default promptUserToPrintHtmlContent
