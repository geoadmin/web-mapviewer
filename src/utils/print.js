import printJS from 'print-js'
/**
 * Creates a new window (popup) with the content given in param. It will copy all the <style> tags
 * from the app in this popup and then trigger a print request to the browser (waiting for any image
 * to finish loading before doing so)
 *
 * The popup will be automatically closed after printing (also closed if the user cancels the print)
 * so that the user may never se the little popup
 *
 * @param {HTMLElement} htmlContent Some HTML, as String, to be added as content for the print popup
 */
const promptUserToPrintHtmlContent = (htmlContent) => {
    printJS({
        printable: htmlContent,
        type: 'html',
    })
}
export default promptUserToPrintHtmlContent
