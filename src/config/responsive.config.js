/**
 * Horizontal threshold for the phone view. (min-width for tablet) This will change the menu and
 * also some interactions.
 *
 * The value is taken from the "sm" breakpoint from Bootstrap. If this value is modified, the
 * variable with the same name defined in 'src/scss/media-query.mixin' must also be modified.
 *
 * @type {Number}
 */
export const BREAKPOINT_PHONE_WIDTH = 576

/**
 * Horizontal threshold for the phone view. (min-height for tablet) The height is needed to catch
 * landscape view on mobile.
 *
 * If this value is modified, the variable with the same name defined in
 * 'src/scss/media-query.mixin' must also be modified.
 *
 * @type {Number}
 */
export const BREAKPOINT_PHONE_HEIGHT = 500

/**
 * Horizontal threshold for the tablet view. (min-width for desktop)
 *
 * If this value is modified, the variable with the same name defined in
 * 'src/scss/media-query.mixin' must also be modified.
 *
 * @type {Number}
 */
export const BREAKPOINT_TABLET = 768

/**
 * The width under which we no longer use floating tooltips and enforce infoboxes.
 *
 * Found empirically, taking the tooltip width of 350px into account
 *
 * @type {Number}
 */
export const MAX_WIDTH_SHOW_FLOATING_TOOLTIP = 400
