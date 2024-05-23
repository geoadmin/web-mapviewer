import fs from 'fs'
import path from 'path'

// regex constants
const re_explicit = /[$.]t\([`'].+[`']\)/g
const re_non_explicit = /[.$]t\((?!['`]).+\)/g

// path constants
const reportDir = 'translation_reports'
const reportFile = 'report'
const jsonFilePath = `${reportDir}/${reportFile}.json`
const txtFilePath = `${reportDir}/${reportFile}.txt`
const noExplicitUseTxtFilePath = `${reportDir}/translations_not_explicitly_used.txt`

// language constants
const langs = ['de', 'fr', 'it', 'en', 'rm']
const translation_files_generic_path = 'src/modules/i18n/locales/lang.json'

// dict used to store the current translation
const translations = {}
// dict used to store the usage data for the translation keys
const translation_usage = {}

// it's used to make the txt report a little bit more readable
const translation_separator = '--------------------------------------------------------------\n'

/** Read the I18n jsons used for translation and make a dictionary out of them to use in the code. */
function init_translation_dictionary() {
    langs.forEach((lang) => {
        translations[lang] = JSON.parse(
            fs.readFileSync(translation_files_generic_path.replace('lang', lang), {
                encoding: 'utf-8',
                flag: 'r',
            })
        )
    })
}

/**
 * If there is no entry in the `translation_usage` for the key, we create one. Then we increment the
 * number of occurrences of the key appearing in the file If the key is not a variable, we add the
 * translations to the dictionary
 *
 * @param {str} key The translation key we are checking
 * @param {str} filePath In which file we found it
 * @param {boolean} isNotAVariable Is it a variable called by the code
 */
function increaseTranslationCount(key, filePath, isNotAVariable = true) {
    if (!translation_usage[key]) {
        translation_usage[key] = {
            occurrences_by_file: {},
            skipTranslationInReport: !isNotAVariable,
            en: isNotAVariable ? translations.en[key] : null,
            rm: isNotAVariable ? translations.rm[key] : null,
            fr: isNotAVariable ? translations.fr[key] : null,
            it: isNotAVariable ? translations.it[key] : null,
            de: isNotAVariable ? translations.de[key] : null,
        }
    }
    if (!translation_usage[key].occurrences_by_file[filePath]) {
        translation_usage[key].occurrences_by_file[filePath] = 0
    }
    translation_usage[key].occurrences_by_file[filePath] += 1
}

/**
 * Recursive function which search for typescripts, vue and js files, and look for translations
 * inside
 *
 * @param {str} directoryPath The root directory from which we start searching
 */
function searchDirectory(directoryPath) {
    const files = fs.readdirSync(directoryPath)
    files.forEach((file) => {
        const filePath = `${directoryPath}/${file}`
        if (
            path.extname(file) === '.js' ||
            path.extname(file) === '.vue' ||
            path.extname(file) === '.ts'
        ) {
            const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8', flag: 'r' })

            // Check the file for use of explicit translations, either fully static or a mix
            // of a variable and of a string (example : .t(`draw_${drawingType.value}`))
            const explicit_array = fileContent.match(re_explicit) ?? []
            const dynamic_element = /\$\{.+\}/
            explicit_array.forEach((translation_key) => {
                let key = translation_key
                    .replace("'", '`')
                    .replace("'", '`')
                    .replace('$t(`', '')
                    .replace('.t(`', '')
                    .replace('`)', '')
                if (key.match(dynamic_element)) {
                    key = key.replace(key.match(dynamic_element)[0], '\\.+')
                }
                const re = RegExp(key)

                for (const json_key of Object.keys(translations.en)) {
                    if (json_key.match(re)) {
                        increaseTranslationCount(json_key, filePath)
                    }
                }
            })

            // Check the file for use of non explicit translations, which are variables only
            // and not realistically easy to find a translation key for. (example : .t(category.id))
            const variable_array = (fileContent.match(re_non_explicit) ?? []).concat(
                fileContent.match(re_non_explicit) ?? []
            )

            variable_array.forEach((key) => {
                const strippedKey = key
                    .replace('.t(', '')
                    .replace('$t(', '')
                    .replace(')', '')
                    .replace(')', '')
                    .replace(')', '')
                increaseTranslationCount(strippedKey, filePath, false)
            })
        } else if (fs.statSync(`${directoryPath}/${file}`).isDirectory()) {
            // if we are in a directory, we go further in
            searchDirectory(`${directoryPath}/${file}`)
        }
    })
}

/**
 * Some translations are not called explicitly by the code. We create a separate record so we can
 * check manually if they are called or not.
 */
function createNonExplicitlyUsedTranslationsReport() {
    for (const key of Object.keys(translation_usage)) {
        langs.forEach((lang) => {
            delete translations[lang][key]
        })
    }
    fs.writeFileSync(noExplicitUseTxtFilePath, '')
    for (const key of Object.keys(translations.en)) {
        fs.appendFileSync(
            noExplicitUseTxtFilePath,
            '********************************************************\n'
        )

        fs.appendFileSync(
            noExplicitUseTxtFilePath,
            'The following key has no explicit translation usage in the mapviewer\n\n'
        )
        fs.appendFileSync(noExplicitUseTxtFilePath, key)
        fs.appendFileSync(noExplicitUseTxtFilePath, '\n\n')
        langs.forEach((lang) => {
            fs.appendFileSync(noExplicitUseTxtFilePath, translation_separator)
            fs.appendFileSync(
                noExplicitUseTxtFilePath,
                `The ${lang} Translation is: \n\n`
                    .replace('it', 'Italian')
                    .replace('en', 'English')
                    .replace('rm', 'Rumantsch')
                    .replace('de', 'German')
                    .replace('fr', 'French')
            )
            fs.appendFileSync(noExplicitUseTxtFilePath, translations[lang][key] ?? '')
            fs.appendFileSync(noExplicitUseTxtFilePath, '\n\n')
        })
        fs.appendFileSync(
            noExplicitUseTxtFilePath,
            '********************************************************\n'
        )
    }
}

/**
 * Takes an entry in the 'translations' dictionary and format it for the txt report
 *
 * @param {string} key The translation key
 * @param {Object} data The translations and occurrences of the key in the code
 */
function addEntryToTextReport(key, data) {
    fs.appendFileSync(txtFilePath, '********************************************************\n')
    fs.appendFileSync(txtFilePath, key)
    fs.appendFileSync(txtFilePath, '\n\n')
    fs.appendFileSync(txtFilePath, 'Number of occurences in files :\n')

    for (const [fileName, count] of Object.entries(data.occurrences_by_file)) {
        fs.appendFileSync(txtFilePath, `  ${fileName} : ${count}\n`)
    }
    if (data.skipTranslationInReport) {
        fs.appendFileSync(
            txtFilePath,
            'This key is a variable found in the files. We cannot be sure of which translation key it refers to. \n\n'
        )
    } else {
        langs.forEach((lang) => {
            fs.appendFileSync(txtFilePath, translation_separator)
            fs.appendFileSync(
                txtFilePath,
                `The ${lang} Translation is: \n\n`
                    .replace('it', 'Italian')
                    .replace('en', 'English')
                    .replace('rm', 'Rumantsch')
                    .replace('de', 'German')
                    .replace('fr', 'French')
            )
            fs.appendFileSync(txtFilePath, data[lang] ?? '')
            fs.appendFileSync(txtFilePath, '\n\n')
        })
    }
    fs.appendFileSync(txtFilePath, '********************************************************\n')
}

init_translation_dictionary()
searchDirectory('src')
searchDirectory('tests')

if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir)
}

// creating a simple json file which contains all translations keys used and their corresponding data

fs.writeFileSync(jsonFilePath, JSON.stringify(translation_usage, null, '    '))

// creating the txt report that shows all translations 'explicitly' called in code.
// since some of theme are called by a mix between variables and static string
// there is a chance some are not used.

fs.writeFileSync(txtFilePath, '')
for (const [key, value] of Object.entries(translation_usage)) {
    addEntryToTextReport(key, value)
}

// creating the report that shows all translations that are not explicitly called in code
// this might be because they're not used, or because they're called by a variable
createNonExplicitlyUsedTranslationsReport()
