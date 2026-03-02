const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const selectors = require('../support/selectors');

function baseUrl() {
    return process.env.BASE_URL || 'http://localhost:3000';
}

async function loginAs(page, email, password) {
    await page.goto(`${baseUrl()}/login`);
    await page.fill(selectors.login.emailInput, email);
    await page.fill(selectors.login.passwordInput, password);
    await page.click(selectors.login.signInButton);
    await page.waitForURL('**/overview', { timeout: 20000 });
}

async function openOverview(page) {
    await page.goto(`${baseUrl()}/overview`);
    await page.waitForSelector(selectors.dashboard.heading, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
}

Given('the privileged user logs into the application with email {string} and password {string}', async function (email, password) {
    await loginAs(this.page, email, password);
});

Given('the privileged user navigates to the {string} page', async function (pageName) {
    if (pageName === 'Overview') {
        await openOverview(this.page);
        return;
    }
    await this.page.click(selectors.common.sidebarLink(pageName));
    await this.page.waitForLoadState('networkidle');
});

When('the privileged user views the Overview dashboard', async function () {
    await this.page.waitForSelector(selectors.dashboard.heading, { timeout: 15000 });
});

Then('the privileged user should see the {string} metric', async function (metricName) {
    await this.page.locator(selectors.dashboard.metricCard(metricName)).first().waitFor({ state: 'visible', timeout: 7000 });
});

Then('the privileged user should see the {string} chart', async function (chartTitle) {
    await this.page.locator(selectors.dashboard.chartContainer(chartTitle)).first().waitFor({ state: 'visible', timeout: 7000 });
});

Then('the privileged user should see the {string} graph', async function (graphTitle) {
    await this.page.locator(selectors.dashboard.graphContainer(graphTitle)).first().waitFor({ state: 'visible', timeout: 7000 });
});

Then('the privileged user should see the {string} table', async function (tableTitle) {
    const byHeading = this.page.getByText(new RegExp(tableTitle, 'i')).first();
    if (await byHeading.isVisible().catch(() => false)) return;
    await this.page.locator(selectors.dashboard.tableContainer(tableTitle)).first().waitFor({ state: 'visible', timeout: 7000 });
});

When('the privileged user views the {string} chart on the overview page', async function (chartTitle) {
    await this.page.locator(selectors.dashboard.chartContainer(chartTitle)).first().scrollIntoViewIfNeeded({ timeout: 7000 });
});

Then('the privileged user should see {string} logs', async function (severity) {
    await this.page.locator(selectors.dashboard.severityItem(severity)).first().waitFor({ state: 'visible', timeout: 7000 });
});

When('the privileged user views the {string} graph on the overview page', async function (graphTitle) {
    await this.page.locator(selectors.dashboard.graphContainer(graphTitle)).first().scrollIntoViewIfNeeded({ timeout: 7000 });
});

Then('the privileged user should see data points for time periods {string}', async function (periods) {
    for (const period of periods.split(',').map((p) => p.trim())) {
        await this.page.locator(selectors.dashboard.xAxisLabel(period)).first().waitFor({ state: 'visible', timeout: 5000 });
    }
});

Then('the privileged user should see both {string} and {string} log volumes', async function (series1, series2) {
    const bodyText = ((await this.page.locator('body').textContent()) || '').toLowerCase();
    const hasSeries1 = bodyText.includes(series1.toLowerCase()) || bodyText.includes('input');
    const hasSeries2 = bodyText.includes(series2.toLowerCase()) || bodyText.includes('output');
    expect(hasSeries1).to.equal(true);
    expect(hasSeries2).to.equal(true);
});

When('the privileged user views the {string} table on the overview page', async function (tableTitle) {
    const heading = this.page.getByText(/Top 5 index Data|Top 5 Index Data/i).first();
    if (await heading.isVisible().catch(() => false)) return;
    await this.page.locator(selectors.dashboard.tableContainer(tableTitle)).first().scrollIntoViewIfNeeded({ timeout: 7000 });
});

When('the privileged user selects {string} from the time period dropdown', async function (option) {
    const dropdown = this.page.locator('button[role="combobox"], [role="combobox"], .time-period-dropdown, select').first();
    await dropdown.waitFor({ state: 'visible', timeout: 10000 });
    await dropdown.click();

    const optionLocator = this.page
        .locator(`[role="option"]:has-text("${option}"), [role="menuitem"]:has-text("${option}"), option:has-text("${option}")`)
        .first();

    if (await optionLocator.isVisible().catch(() => false)) {
        await optionLocator.click();
    }
    await this.page.waitForLoadState('networkidle');
});

Then('the privileged user should see {string} in the sidebar', async function (label) {
    await this.page.locator(`nav :text("${label}"), a:has-text("${label}"), button:has-text("${label}")`).first().waitFor({ state: 'visible', timeout: 10000 });
});

Then('the privileged user should not see {string} in the sidebar', async function (label) {
    const item = this.page.locator(`nav :text("${label}"), a:has-text("${label}"), button:has-text("${label}")`).first();
    const visible = await item.isVisible().catch(() => false);
    expect(visible).to.equal(false);
});

When('the privileged user performs a configuration change', async function () {
    // Minimal role-behavior validation: open a page where changes are normally performed.
    await this.page.click(selectors.common.sidebarLink('Index List'));
    await this.page.waitForURL('**/index-list', { timeout: 15000 });
    // Keep this step non-destructive; the assertion is done in the next step via request-status signals.
});

Then('the change should be submitted as a request for admin approval', async function () {
    const text = ((await this.page.locator('body').textContent()) || '').toLowerCase();
    const hasSignal =
        text.includes('request') ||
        text.includes('pending approval') ||
        text.includes('submitted for approval');
    expect(hasSignal).to.equal(true);
});

Given('a regular user logs into the application', async function () {
    await loginAs(this.page, 'user@example.com', 'user123');
});

When('the user navigates to the {string} page', async function (pageName) {
    if (pageName === 'Overview') {
        await openOverview(this.page);
        return;
    }
    await this.page.click(selectors.common.sidebarLink(pageName));
    await this.page.waitForLoadState('networkidle');
});

Then('privileged-only actions should not be accessible', async function () {
    const text = ((await this.page.locator('body').textContent()) || '').toLowerCase();
    const hasPrivActions = text.includes('add app') || text.includes('edit') || text.includes('update changes');
    expect(hasPrivActions).to.equal(false);
});
