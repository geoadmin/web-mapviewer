#!/usr/bin/env node

const fs = require('fs')
const {google} = require('googleapis');

const googleApiKey = process.env.GOOGLE_API_KEY;

if (!googleApiKey) {
    console.error('Please provide a valid Google API Key through the env variable GOOGLE_API_KEY')
    process.exit(1)
}

const sheets = google.sheets({version: 'v4', auth: googleApiKey});
sheets.spreadsheets.values.get({
    spreadsheetId: '1bRzdX2zwN2VG7LWEdlscrP-wGlp7O46nvrXkQNnFvVY',
    range: 'A:F'
}, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
        const translations = {};
        const langByIndex = []
        rows.forEach((row, rowIndex) => {
            if (rowIndex === 0) {
                row.forEach((lang, langIndex) => {
                    if (langIndex > 0) {
                        translations[lang.toLowerCase()] = {};
                        langByIndex[langIndex] = lang.toLowerCase();
                    }
                })
            } else {
                langByIndex.forEach((lang, index) => {
                    if (index > 0) translations[lang][row[0]] = row[index]
                })
            }
        })
        langByIndex.forEach((lang, index) => {
            if (index > 0) fs.writeFileSync(`src/modules/i18n/locales/${lang}.json`, JSON.stringify(translations[lang]));
        })
        console.log('done');
    } else {
        console.log('No data found.');
    }
});

