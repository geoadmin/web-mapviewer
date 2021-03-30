import jQuery from 'jquery'
/**
 * Creates a new window (popup) with the content given in param. It will copy all the <style> tags
 * from the app in this popup and then trigger a print request to the browser (waiting for any image
 * to finish loading before doing so)
 *
 * The popup will be automatically closed after printing (also closed if the user cancels the print)
 * so that the user may never se the little popup
 *
 * @param {String} htmlContent Some HTML, as String, to be added as content for the print popup
 */
const promptUserToPrintHtmlContent = (htmlContent) => {
    const hiddenWindowWithContent = window.open('', '', 'height=500, width=500')
    const document = hiddenWindowWithContent.document
    document.write('<html><head>')
    // grabbing all styles from main document and copying them here (to have the same styling)
    jQuery('style').each(function () {
        document.write(jQuery(this).clone()[0].outerHTML)
    })
    document.write('</head><body>')
    document.write(htmlContent)
    document.write('</body></html>')
    document.close()

    const printAndClose = () => {
        hiddenWindowWithContent.print()
        hiddenWindowWithContent.close()
    }
    // checking if there are images or iframe in the content
    let pendingImageOriFrameLoading = 0
    const images = jQuery(document).find('img,iframe')
    if (images.length > 0) {
        // if so we wait for them to load before printing
        images.each(function () {
            pendingImageOriFrameLoading++
            this.onload = () => {
                pendingImageOriFrameLoading--
                if (pendingImageOriFrameLoading === 0) {
                    printAndClose()
                }
            }
        })
    } else {
        printAndClose()
    }
}
export default promptUserToPrintHtmlContent
