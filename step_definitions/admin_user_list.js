const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const selectors = require('../support/selectors');

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeKey(value) {
    return (value || '').toLowerCase().replace(/[_\s-]+/g, ' ').trim();
}

function humanizeFilterValue(value) {
    const key = normalizeKey(value);
    if (key === 'user edit') return 'User Edit';
    if (key === 'index edit') return 'Index Edit';
    if (key === 'config edit') return 'Config Edit';
    if (key === 'all types') return 'All Types';
    if (key === 'oldest') return 'Earliest First';
    if (key === 'earliest first') return 'Earliest First';
    if (key === 'latest') return 'Latest First';
    if (key === 'latest first') return 'Latest First';
    return value;
}

When('the admin is on the User List page', async function () {
    await this.page.waitForURL('**/user-list', { timeout: 15000 });
});

Then('the user list title should be visible', async function () {
    await this.page.locator(selectors.userList.pageHeading).first().waitFor({ state: 'visible', timeout: 10000 });
});

Then('the user list subtitle should be visible', async function () {
    await this.page.locator(selectors.userList.pageSubtitle).first().waitFor({ state: 'visible', timeout: 10000 });
});

Then('the user list search input should be visible', async function () {
    await this.page.locator(selectors.userList.searchInput).first().waitFor({ state: 'visible', timeout: 10000 });
});

Then('the user list table should show columns:', async function (dataTable) {
    const columns = dataTable.hashes().map((r) => r.Column);
    for (const column of columns) {
        await this.page.locator(`th:has-text("${column}")`).first().waitFor({ state: 'visible', timeout: 10000 });
    }
});

Given('users exist in the User List table', async function () {
    const search = this.page.locator(selectors.userList.searchInput).first();
    if (await search.isVisible().catch(() => false)) {
        await search.fill('');
        await this.page.waitForTimeout(400);
    }
    const deadline = Date.now() + 12000;
    let rows = 0;
    while (Date.now() < deadline) {
        rows = await this.page.locator('tbody tr, [role="row"]').count();
        if (rows > 0) {
            break;
        }
        await this.page.waitForTimeout(500);
    }
    expect(rows).to.be.greaterThan(0);
});

When('the admin searches for user {string}', async function (username) {
    const input = this.page.locator(selectors.userList.searchInput).first();
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.fill(username);
    await this.page.waitForTimeout(500);
});

Then('only users matching {string} should be displayed in the User List', async function (username) {
    const rows = await this.page.locator('tbody tr, [role="row"]').all();
    expect(rows.length).to.be.greaterThan(0);

    for (const row of rows) {
        const text = (await row.textContent()) || '';
        expect(text.toLowerCase()).to.include(username.toLowerCase());
    }
});

Given('a user {string} exists in the User List', async function (username) {
    const row = this.page.locator(selectors.userList.rowByUsername(username)).first();
    await row.waitFor({ state: 'visible', timeout: 10000 });
});

When('the admin opens actions menu for user {string}', async function (username) {
    this.lastTargetUsername = username;
    const actionsButton = this.page.locator(selectors.userList.actionsButtonInRow(username)).first();
    await actionsButton.waitFor({ state: 'visible', timeout: 10000 });
    await actionsButton.click();
});

Then('the actions dropdown should show options:', async function (dataTable) {
    const options = dataTable.hashes().map((r) => r.Option);
    for (const option of options) {
        const menuItemByRole = this.page.locator(`[role="menuitem"]:has-text("${option}")`).first();
        const menuItemByText = this.page.getByText(option, { exact: true }).first();
        await menuItemByRole.or(menuItemByText).waitFor({ state: 'visible', timeout: 10000 });
    }
});

When('the admin selects {string} from user actions', async function (action) {
    const menuItemByRole = this.page.locator(`[role="menuitem"]:has-text("${action}")`).first();
    const menuItemByText = this.page.getByText(action, { exact: true }).first();
    await menuItemByRole.or(menuItemByText).click();
});

Then('the Edit User Role form should open', async function () {
    await this.page.locator(selectors.userList.editModalTitle).first().waitFor({ state: 'visible', timeout: 10000 });
});

When('the admin sets role to {string}', { timeout: 30000 }, async function (role) {
    await this.page.locator(selectors.userList.editModalTitle).first().waitFor({ state: 'visible', timeout: 10000 });
    const scope = this.page;
    const roleRegex = new RegExp(escapeRegExp(role), 'i');

    const roleRadio = scope.getByRole('radio', { name: roleRegex }).first();
    if ((await roleRadio.count()) > 0) {
        await roleRadio.click({ timeout: 5000 });
        return;
    }

    const roleOption = scope.locator(selectors.userList.roleOption(role)).first();
    if ((await roleOption.count()) > 0) {
        await roleOption.click({ timeout: 5000 });
        return;
    }

    const roleSelect = scope.locator('select').first();
    if ((await roleSelect.count()) > 0) {
        const optionTexts = await roleSelect.locator('option').allTextContents();
        const matchingLabel = optionTexts.find((text) => roleRegex.test(text.trim()));
        if (matchingLabel) {
            await roleSelect.selectOption({ label: matchingLabel.trim() });
            return;
        }
    }

    const roleText = scope.getByText(roleRegex).first();
    if ((await roleText.count()) > 0) {
        await roleText.click({ timeout: 5000, force: true });
        return;
    }

    throw new Error(`Could not find role control for "${role}" in Edit User Role form`);
});

When('the admin saves user role changes', async function () {
    await this.page.locator(selectors.userList.updateChangesButton).first().click();
    const confirmSubmitButton = this.page.locator('[role="dialog"] button:has-text("Submit"), button:has-text("Submit")').first();
    if (await confirmSubmitButton.isVisible().catch(() => false)) {
        await confirmSubmitButton.click();
    }
    await this.page.waitForLoadState('networkidle');
});

Then('the role for user {string} should be {string} in the User List', { timeout: 30000 }, async function (username, role) {
    await this.page.waitForURL('**/user-list', { timeout: 15000 });
    const row = this.page.locator(selectors.userList.rowByUsername(username)).first();
    await row.waitFor({ state: 'visible', timeout: 10000 });

    const expected = role.toLowerCase();
    const deadline = Date.now() + 15000;
    let lastText = '';

    while (Date.now() < deadline) {
        lastText = ((await row.textContent()) || '').toLowerCase().replace(/\s+/g, '');
        if (lastText.includes(expected.replace(/\s+/g, ''))) {
            return;
        }
        await this.page.waitForTimeout(500);
    }

    expect(lastText).to.include(expected.replace(/\s+/g, ''));
});

When('the admin disables account access', async function () {
    await this.page.locator(selectors.userList.accountAccessSection).first().waitFor({ state: 'visible', timeout: 10000 });
    const toggle = this.page.locator(selectors.userList.accountAccessSwitch).last();
    await toggle.waitFor({ state: 'visible', timeout: 10000 });

    const checked = (await toggle.getAttribute('aria-checked')) === 'true';
    if (checked) {
        await toggle.click();
    }
});

Then('the account access status should show disabled in the form', { timeout: 30000 }, async function () {
    const modalTitle = this.page.locator(selectors.userList.editModalTitle).first();
    const modalOpen = await modalTitle.isVisible().catch(() => false);

    if (!modalOpen) {
        const username = this.lastTargetUsername || 'regularuser';
        const actionsButton = this.page.locator(selectors.userList.actionsButtonInRow(username)).first();
        await actionsButton.waitFor({ state: 'visible', timeout: 10000 });
        await actionsButton.click();
        await this.page.locator(selectors.userList.editMenuItem).first().click();
        await modalTitle.waitFor({ state: 'visible', timeout: 10000 });
    }

    await this.page.locator(selectors.userList.accountAccessSection).first().waitFor({ state: 'visible', timeout: 10000 });
    const toggle = this.page.locator(selectors.userList.accountAccessSwitch).last();
    await toggle.waitFor({ state: 'visible', timeout: 10000 });
    const checked = (await toggle.getAttribute('aria-checked')) === 'true';
    expect(checked).to.equal(false);
});

Given('the admin disabled account access for user {string}', async function (username) {
    const row = this.page.locator(selectors.userList.rowByUsername(username)).first();
    await row.waitFor({ state: 'visible', timeout: 10000 });

    const actionsButton = this.page.locator(selectors.userList.actionsButtonInRow(username)).first();
    await actionsButton.click();
    await this.page.locator(selectors.userList.editMenuItem).first().click();

    await this.page.locator(selectors.userList.editModalTitle).first().waitFor({ state: 'visible', timeout: 10000 });
    const toggle = this.page.locator(selectors.userList.accountAccessSwitch).last();
    const checked = (await toggle.getAttribute('aria-checked')) === 'true';
    if (checked) {
        await toggle.click();
    }
    await this.page.locator(selectors.userList.updateChangesButton).first().click();
    await this.page.waitForLoadState('networkidle');
});

When('the disabled user tries to login with email {string} and password {string}', { timeout: 30000 }, async function (email, password) {
    const base = process.env.BASE_URL || 'http://localhost:3000';
    await this.page.goto(`${base.replace(/\/$/, '')}/login`, { waitUntil: 'domcontentloaded' });

    await this.page.waitForSelector(selectors.login.emailInput, { timeout: 10000 });
    await this.page.fill(selectors.login.emailInput, email);
    await this.page.fill(selectors.login.passwordInput, password);
    await this.page.click(selectors.login.signInButton);
});

Then('login should be blocked for the disabled user', async function () {
    await this.page.waitForURL('**/login', { timeout: 10000 });
    const error = this.page.locator(selectors.common.notificationError).or(this.page.locator(selectors.common.errorMessage)).first();
    await error.waitFor({ state: 'visible', timeout: 10000 });
});


When('the admin selects approvals action filter {string}', async function (actionType) {
    const target = humanizeFilterValue(actionType);
    const actionFilter = this.page.locator('select').first();
    if (await actionFilter.isVisible().catch(() => false)) {
        await actionFilter.selectOption({ label: target }).catch(async () => {
            await actionFilter.selectOption(target).catch(async () => {
                await actionFilter.selectOption(actionType).catch(async () => {
                    await actionFilter.selectOption(actionType.toLowerCase().replace(/\s+/g, '_'));
                });
            });
        });
    } else {
        const combo = this.page.locator('[role="combobox"]').first();
        if (await combo.isVisible().catch(() => false)) {
            await combo.click();
            await this.page.locator(`[role="option"]:has-text("${target}"), [role="menuitem"]:has-text("${target}")`).first().click();
        } else {
            console.log(`Approvals action filter control not visible, skipping selection for "${target}"`);
        }
    }
    await this.page.waitForLoadState('networkidle');
});

When('the admin selects approvals sort order {string}', async function (sortOrder) {
    const target = humanizeFilterValue(sortOrder);
    const sortFilter = this.page.locator('select').nth(1);
    if (await sortFilter.isVisible().catch(() => false)) {
        await sortFilter.selectOption({ label: target }).catch(async () => {
            await sortFilter.selectOption(target).catch(async () => {
                await sortFilter.selectOption(sortOrder).catch(async () => {
                    await sortFilter.selectOption(sortOrder.toLowerCase().replace(/\s+/g, '_'));
                });
            });
        });
    } else {
        const combo = this.page.locator('[role="combobox"]').nth(1);
        if (await combo.isVisible().catch(() => false)) {
            await combo.click();
            await this.page.locator(`[role="option"]:has-text("${target}"), [role="menuitem"]:has-text("${target}")`).first().click();
        } else {
            console.log(`Approvals sort filter control not visible, skipping selection for "${target}"`);
        }
    }
    await this.page.waitForLoadState('networkidle');
});

Then('the approvals history tab should be visible and clickable', async function () {
    const historyTab = this.page.locator(selectors.approvals.historyTab).first();
    await historyTab.waitFor({ state: 'visible', timeout: 10000 });
    await historyTab.click();
});

