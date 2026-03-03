const { Before, After, AfterAll, Status, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

let browser;
let context;
setDefaultTimeout(10 * 1000);

Before(async function () {
    if (!browser) {
        browser = await chromium.launch({
            headless: process.env.CI ? true : true, // Enforce headless safely for now to unblock Github Actions
            slowMo: 50,
            args: [
                '--start-maximized',
                '--force-device-scale-factor=0.8',
                '--high-dpi-support=1'
            ]
        });
        console.log('Browser launched');
    }

    context = await browser.newContext({
        viewport: null
    });
    this.page = await context.newPage();
});

After(async function (scenario) {
    if (this.page && !this.page.isClosed()) {
        try {
            if (scenario.result.status === Status.FAILED) {
                const screenshot = await this.page.screenshot();
                this.attach(screenshot, 'image/png');
                console.log(`Failed: ${scenario.pickle.name} - screenshot saved`);
            }
        } catch (error) {
            console.log('Could not capture screenshot:', error.message);
        }

        try {
            await this.page.close();
            await context.close();
        } catch (error) {
            console.log('Could not close page/context:', error.message);
        }
    }

    this.page = null;
});

AfterAll({ timeout: 30000 }, async function () {
    if (browser) {
        await browser.close();
        browser = null;
        console.log('Browser closed');
    }
});
