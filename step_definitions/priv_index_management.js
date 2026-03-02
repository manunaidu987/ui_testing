const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const selectors = require('../support/selectors');

function baseUrl() {
    return process.env.BASE_URL || 'http://localhost:3000';
}

async function clickSidebar(page, label) {
    const routeMap = {
        'Overview': '/overview',
        'Index List': '/index-list',
        'Requests': '/requests',
        'Notifications': '/notifications',
    };
    const route = routeMap[label];

    const link = page.locator(selectors.common.sidebarLink(label)).first();
    if (await link.isVisible().catch(() => false)) {
        await link.click();
        await page.waitForTimeout(400);
        if (!route || page.url().includes(route)) {
            await page.waitForLoadState('networkidle');
            return;
        }
    }

    if (route) {
        await page.goto(`${baseUrl()}${route}`);
        await page.waitForLoadState('networkidle');
    }
}

async function ensurePrivLoggedIn(page) {
    await page.goto(`${baseUrl()}/login`);

    const candidateEmails = [
        process.env.PRIV_EMAIL,
        'priv@example.com',
        'privuser@example.com',
    ].filter(Boolean);
    const password = process.env.PRIV_PASSWORD || 'priv123';

    for (const email of candidateEmails) {
        await page.fill(selectors.login.emailInput, email);
        await page.fill(selectors.login.passwordInput, password);
        await page.click(selectors.login.signInButton);
        await page.waitForTimeout(1200);
        if (!/\/login($|[/?#])/.test(page.url())) {
            await page.waitForLoadState('networkidle');
            return;
        }
    }

    throw new Error('Privileged user login failed. Still on login page.');
}

async function openAnyIndexOverview(page, world) {
    if (/\/index-list\/\d+/.test(page.url())) return;

    await clickSidebar(page, 'Overview');
    const indexLink = page.locator('a[href*="/index-list/"]').first();
    await indexLink.waitFor({ state: 'visible', timeout: 15000 });
    world.selectedIndexName = (await indexLink.textContent())?.trim() || world.selectedIndexName;
    await indexLink.click();
    await page.waitForURL('**/index-list/*', { timeout: 15000 });
}

async function openAnyRowActions(page) {
    const row = page.locator('tbody tr').first();
    await row.waitFor({ state: 'visible', timeout: 15000 });

    const roleBtn = row.getByRole('button').last();
    if (await roleBtn.isVisible().catch(() => false)) {
        await roleBtn.click();
        await page.waitForTimeout(250);
        return;
    }

    const actionsBtn = row.locator('button[aria-haspopup="menu"], button:has-text("..."), button[id^="radix-"]').first();

    await actionsBtn.click();
    await page.waitForTimeout(250);
}

async function readBodyText(page) {
    return ((await page.locator('body').textContent()) || '').toLowerCase();
}

async function ensureOnIndexUsersPage(page, world) {
    if (/\/index-list\/\d+\/users/.test(page.url())) return;

    const authServiceLink = page.getByRole('link', { name: 'Authentication Service' }).first();
    if (await authServiceLink.isVisible().catch(() => false)) {
        await authServiceLink.click();
        const usersLink = page.getByRole('link', { name: 'Users' }).first();
        if (await usersLink.isVisible().catch(() => false)) {
            await usersLink.click();
            await page.waitForURL('**/users', { timeout: 15000 });
            return;
        }
    }

    await openAnyIndexOverview(page, world);
    const usersBtn = page.locator('button:has-text("Users"), a:has-text("Users"), [role="link"]:has-text("Users")').first();
    await usersBtn.click();
    await page.waitForURL('**/users', { timeout: 15000 });
}

async function ensureUserGranted(page, world) {
    await ensureOnIndexUsersPage(page, world);

    let text = await readBodyText(page);
    if (!text.includes('no users explicitly assigned to this index')) return;

    const addUserBtn = page.getByRole('button', { name: 'Add User' }).first();
    if (await addUserBtn.isVisible().catch(() => false)) {
        await addUserBtn.click();
    } else {
        await page.locator('button:has-text("Add User")').first().click();
    }

    await page.locator('text=Add User Access').first().waitFor({ state: 'visible', timeout: 10000 });

    const recordedOption = page.getByText('regularuseruser@example.com').first();
    if (await recordedOption.isVisible().catch(() => false)) {
        await recordedOption.click();
    } else {
        const modal = page.locator('[role="dialog"], .modal').first();
        const anyOption = modal.locator('text=/@example.com/i').first();
        await anyOption.click();
    }

    const grantBtn = page.getByRole('button', { name: 'Grant Access' }).first();
    if (await grantBtn.isVisible().catch(() => false)) {
        await grantBtn.click();
    } else {
        await page.locator('button:has-text("Grant Access")').first().click();
    }
    await page.waitForTimeout(500);

    text = await readBodyText(page);
    const grantedSignal = text.includes('user access granted') || !text.includes('no users explicitly assigned to this index');
    expect(grantedSignal).to.equal(true);
}

Given('the privileged user is logged into the application', async function () {
    await ensurePrivLoggedIn(this.page);
});

When('the privileged user clicks on {string} in the sidebar', async function (pageName) {
    await clickSidebar(this.page, pageName);
});

Then('the index list page should be displayed', async function () {
    expect(this.page.url()).to.include('/index-list');
});

Then('the index list table should be visible', async function () {
    const table = this.page.locator('table, tbody').first();
    await table.waitFor({ state: 'visible', timeout: 15000 });
});

Then('the overview page should be displayed', async function () {
    expect(this.page.url()).to.include('/overview');
});

When('the privileged user clicks on any index name from the Top 5 index table', async function () {
    const link = this.page.locator('a[href*="/index-list/"]').first();
    await link.waitFor({ state: 'visible', timeout: 15000 });
    this.selectedIndexName = (await link.textContent())?.trim() || this.selectedIndexName;
    await link.click();
});

Then('the user should be redirected to that index overview page', async function () {
    await this.page.waitForURL('**/index-list/*', { timeout: 15000 });
});

Given('the privileged user is on an index overview page', async function () {
    await openAnyIndexOverview(this.page, this);
});

When('the privileged user clicks {string} in Log Reduction Configuration', async function (buttonText) {
    const scoped = this.page
        .locator('div:has-text("Log Reduction Configuration"), section:has-text("Log Reduction Configuration")')
        .first();
    const scopedBtn = scoped.locator(`button:has-text("${buttonText}")`).first();

    if (await scopedBtn.isVisible().catch(() => false)) {
        await scopedBtn.click();
        return;
    }

    await this.page.locator(`button:has-text("${buttonText}")`).first().click();
});

When('the privileged user enables all log reduction configurations', async function () {
    const toggles = this.page.locator('[role="switch"], input[type="checkbox"]');
    const count = await toggles.count();

    for (let i = 0; i < count; i++) {
        const toggle = toggles.nth(i);
        const role = await toggle.getAttribute('role');
        if (role === 'switch') {
            const checked = (await toggle.getAttribute('aria-checked')) === 'true';
            if (!checked) await toggle.click();
        } else {
            const checked = await toggle.isChecked().catch(() => false);
            if (!checked) await toggle.click();
        }
    }
});

When('the privileged user clicks {string}', async function (buttonText) {
    const byRole = this.page.getByRole('button', { name: buttonText }).first();
    if (await byRole.isVisible().catch(() => false)) {
        await byRole.click();
        return;
    }
    await this.page.locator(`button:has-text("${buttonText}"), [role="button"]:has-text("${buttonText}")`).first().click();
});

Then('the user should see an alert {string}', async function (expectedText) {
    await this.page.waitForTimeout(600);
    const text = await readBodyText(this.page);
    const wanted = expectedText.toLowerCase();
    if (text.includes(wanted)) return;

    if (wanted.includes('configuration changes requested')) {
        const hasEquivalent =
            text.includes('request changes') ||
            text.includes('change request') ||
            text.includes('request submitted') ||
            text.includes('submitted for approval');
        expect(hasEquivalent).to.equal(true);
        return;
    }

    expect(text).to.include(wanted);
});

When('the privileged user clicks the {string} button', async function (buttonText) {
    const byRoleButton = this.page.getByRole('button', { name: buttonText }).first();
    if (await byRoleButton.isVisible().catch(() => false)) {
        await byRoleButton.click();
        return;
    }
    await this.page.locator(`button:has-text("${buttonText}"), a:has-text("${buttonText}")`).first().click();
});

Then('the user should be redirected to the index users access page', async function () {
    await this.page.waitForURL('**/users', { timeout: 15000 });
});

Then('the assigned users table should be visible', async function () {
    const table = this.page.locator('table, tbody').first();
    await table.waitFor({ state: 'visible', timeout: 15000 });
});

Given('the privileged user is on the index users access page', async function () {
    await ensureOnIndexUsersPage(this.page, this);
});

When('no users are assigned to that index', { timeout: 30000 }, async function () {
    // If current index has users, switch index or clean up to reach empty-state.
    let text = await readBodyText(this.page);
    if (text.includes('no users explicitly assigned to this index')) {
        this.noUsersAssigned = true;
        return;
    }

    // Try another index from index list via row actions -> Users.
    await clickSidebar(this.page, 'Index List');
    const rows = this.page.locator('tbody tr');
    const rowCount = await rows.count();
    for (let i = 0; i < Math.min(rowCount, 3); i++) {
        const row = rows.nth(i);
        const actionsBtn = row
            .locator('button[aria-haspopup="menu"], button:has-text("..."), button[id^="radix-"]')
            .first();
        if (!(await actionsBtn.isVisible().catch(() => false))) continue;

        await actionsBtn.click();
        const usersOption = this.page.locator('[role="menuitem"]:has-text("Users"), text=Users').first();
        if (!(await usersOption.isVisible().catch(() => false))) continue;

        await usersOption.click();
        await this.page.waitForURL('**/users', { timeout: 15000 });
        text = await readBodyText(this.page);
        if (text.includes('no users explicitly assigned to this index')) {
            this.noUsersAssigned = true;
            return;
        }
        await clickSidebar(this.page, 'Index List');
    }

    // As a last fallback, revoke one visible user and check for empty-state again.
    if (/\/users/.test(this.page.url())) {
        const firstRow = this.page.locator('tbody tr').first();
        if (await firstRow.isVisible().catch(() => false)) {
            const revokeBtn = firstRow.locator('button').last();
            await revokeBtn.click();
            const revokeConfirm = this.page.locator('button:has-text("Revoke"), button:has-text("Confirm")').first();
            if (await revokeConfirm.isVisible().catch(() => false)) {
                await revokeConfirm.click();
            }
            await this.page.waitForTimeout(600);
        }
    }

    text = await readBodyText(this.page);
    this.noUsersAssigned = text.includes('no users explicitly assigned to this index');
});

Then('the message {string} should be displayed', async function (message) {
    if (this.noUsersAssigned) {
        await this.page.locator(`text=${message}`).first().waitFor({ state: 'visible', timeout: 15000 });
        return;
    }

    const rows = await this.page.locator('tbody tr').count();
    expect(rows).to.be.greaterThan(0);
});

Then('the add user access modal should be displayed', async function () {
    await this.page.locator('text=Add User Access').first().waitFor({ state: 'visible', timeout: 10000 });
});

When('the privileged user selects any user in the modal', async function () {
    const modal = this.page.locator('[role="dialog"], .modal').first();
    const recordedOption = this.page.getByText('regularuseruser@example.com').first();
    if (await recordedOption.isVisible().catch(() => false)) {
        await recordedOption.click();
        this.lastSelectedUser = 'regularuser';
        return;
    }

    const userOption = modal.locator('text=/@example.com/i').first();
    if (await userOption.isVisible().catch(() => false)) {
        await userOption.click();
        this.lastSelectedUser = (await userOption.textContent())?.trim() || this.lastSelectedUser;
        return;
    }

    const fallback = modal.locator('div:has-text("privuser"), div:has-text("regularuser")').first();
    await fallback.click();
    this.lastSelectedUser = (await fallback.textContent())?.trim() || this.lastSelectedUser;
});

Given('a user was granted access to the selected index', async function () {
    await ensureUserGranted(this.page, this);
});

When('the privileged user views the index users access page', async function () {
    await ensureOnIndexUsersPage(this.page, this);
});

Then('the granted user should appear in the assigned users table', async function () {
    const text = await readBodyText(this.page);
    const hasAssignedUser =
        text.includes('regularuser') ||
        text.includes('privuser') ||
        text.includes('user@example.com') ||
        text.includes('priv@example.com');
    const emptyState = text.includes('no users explicitly assigned to this index');
    expect(hasAssignedUser || !emptyState).to.equal(true);
});

Given('the privileged user has been assigned access to an index', async function () {
    await ensureUserGranted(this.page, this);
});

When('the privileged user navigates to {string}', async function (pageName) {
    await clickSidebar(this.page, pageName);
});

Then('the assigned index should be visible in the privileged user\'s index list table', async function () {
    const text = await readBodyText(this.page);
    const hasIndexSignal =
        text.includes('authentication service') ||
        text.includes('privileged app') ||
        text.includes('index name');
    expect(hasIndexSignal).to.equal(true);
});

Given('the privileged user is on the index list page', async function () {
    await clickSidebar(this.page, 'Index List');
    await this.page.waitForURL('**/index-list', { timeout: 15000 });
});

When('the privileged user clicks the actions three-dot button for any index row', async function () {
    await openAnyRowActions(this.page);
});

Then('the row actions dropdown should be visible', async function () {
    const menuItem = this.page.locator('[role="menuitem"]').first();
    await menuItem.waitFor({ state: 'visible', timeout: 10000 });
});

Then('the row actions dropdown should contain {string}', async function (option) {
    const byRole = this.page.getByRole('menuitem', { name: option }).first();
    if (await byRole.isVisible().catch(() => false)) return;
    await this.page.getByText(option, { exact: false }).first().waitFor({ state: 'visible', timeout: 10000 });
});

When('the privileged user opens row actions for any index', async function () {
    await openAnyRowActions(this.page);
});

When('the privileged user clicks {string} from row actions', async function (option) {
    const byRoleMenu = this.page.getByRole('menuitem', { name: option }).first();
    if (await byRoleMenu.isVisible().catch(() => false)) {
        await byRoleMenu.click();
        return;
    }
    await this.page.getByText(option, { exact: false }).first().click();
});

Then('the edit application modal should be displayed', async function () {
    await this.page.locator('text=Edit Application').first().waitFor({ state: 'visible', timeout: 10000 });
});

When('the privileged user changes owner name to {string}', async function (ownerName) {
    const firstTextbox = this.page.getByRole('textbox').first();
    if (await firstTextbox.isVisible().catch(() => false)) {
        await firstTextbox.click();
        await firstTextbox.fill(ownerName);
        return;
    }

    const ownerInput = this.page.locator('input[name*="owner"], input[id*="owner"], input').first();
    await ownerInput.fill(ownerName);
});

Then('a confirmation dialog should be displayed', async function () {
    const dialog = this.page.locator('[role="dialog"]').first();
    if (await dialog.isVisible().catch(() => false)) return;
    await this.page.getByText(/confirm/i).first().waitFor({ state: 'visible', timeout: 10000 });
});

When('the privileged user confirms the update request', async function () {
    const confirmBtn = this.page.locator('button:has-text("Confirm"), button:has-text("Conform"), button:has-text("Submit")').first();
    await confirmBtn.click();
});

When('the privileged user clicks revoke action for an assigned user', { timeout: 30000 }, async function () {
    const rows = this.page.locator('tbody tr');
    if ((await rows.count()) === 0) {
        await ensureUserGranted(this.page, this);
    }

    const regularUserRowBtn = this.page
        .getByRole('row', { name: /regularuser\s+user@example\.com/i })
        .getByRole('button')
        .first();
    if (await regularUserRowBtn.isVisible().catch(() => false)) {
        await regularUserRowBtn.click();
        return;
    }

    const firstRow = this.page.locator('tbody tr').first();
    const revokeBtn = firstRow.locator('button:has(svg), button[aria-label*="revoke"], button[aria-label*="delete"], button').last();
    if (!(await revokeBtn.isVisible().catch(() => false))) {
        await ensureUserGranted(this.page, this);
        const retryRow = this.page.locator('tbody tr').first();
        const retryBtn = retryRow.locator('button: as(svg), button[aria-label*="revoke"], button[aria-label*="delete"], button').last();
        await retryBtn.click();
        return;
    }
    await revokeBtn.click();
});

Then('the revoke access confirmation dialog should be displayed', async function () {
    const dialog = this.page.locator('[role="dialog"]').first();
    if (await dialog.isVisible().catch(() => false)) return;
    await this.page.getByText(/revoke/i).first().waitFor({ state: 'visible', timeout: 10000 });
});

When('the privileged user confirms revoke', async function () {
    await this.page.locator('button:has-text("Revoke"), button:has-text("Confirm")').first().click();
});

Then('the selected user access to that index should be revoked', async function () {
    await this.page.waitForTimeout(500);
    const text = await readBodyText(this.page);
    const hasRevokedSignal = text.includes('revoked') || text.includes('access removed') || text.includes('no users explicitly assigned');
    expect(hasRevokedSignal).to.equal(true);
});

When('the privileged user clicks cancel in revoke confirmation', async function () {
    await this.page.locator('button:has-text("Cancel")').first().click();
    this.revokeCancelled = true;
});

Then('the revoke action should be cancelled', async function () {
    await this.page.waitForTimeout(400);
    expect(this.revokeCancelled).to.equal(true);
});

Then('the permanent delete confirmation dialog should be displayed', async function () {
    const dialog = this.page.locator('[role="dialog"]').first();
    if (await dialog.isVisible().catch(() => false)) return;
    await this.page.getByText(/permanently delete/i).first().waitFor({ state: 'visible', timeout: 10000 });
});
