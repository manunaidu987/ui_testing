const report = require('multiple-cucumber-html-reporter');

report.generate({
    jsonDir: 'reports/',
    reportPath: 'reports/html-report/',
    metadata: {
        browser: {
            name: 'chrome',
            version: '120'
        },
        device: 'Local Machine',
        platform: {
            name: 'Windows',
            version: '11'
        }
    },
    customData: {
        title: 'Login Test Execution Report',
        data: [
            { label: 'Project', value: 'HSBC Login UI Testing' },
            { label: 'Release', value: '1.0.0' },
            { label: 'Executed', value: new Date().toLocaleString() }
        ]
    },
    displayDuration: true,
    pageTitle: 'HSBC Login Test Report',
    reportName: 'Cucumber Test Report'
});
