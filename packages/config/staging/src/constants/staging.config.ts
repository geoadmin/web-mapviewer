/** The URL to the Github repository. */
export const GITHUB_REPOSITORY: string = 'https://github.com/geoadmin/web-mapviewer'

/** Display a big development banner on all but these hosts. */
export const NO_WARNING_BANNER_HOSTNAMES: string[] = ['test.map.geo.admin.ch', 'map.geo.admin.ch']

/**
 * Display a warning ribbon ('TEST') on the top-left (mobile) or bottom-left (desktop) corner on all
 * these hosts.
 */
export const WARNING_RIBBON_HOSTNAMES: string[] = ['test.map.geo.admin.ch']

/** Display Give Feedback on all these hosts */
export const GIVE_FEEDBACK_HOSTNAMES: string[] = [
    'localhost',
    'sys-map.dev.bgdi.ch',
    'test.map.geo.admin.ch',
]

/** Display Report Problem on all these hosts */
export const REPORT_PROBLEM_HOSTNAMES: string[] = [
    'localhost',
    'sys-map.dev.bgdi.ch',
    'sys-map.int.bgdi.ch',
    'sys-map.prod.bgdi.ch',
    'map.geo.admin.ch',
]
