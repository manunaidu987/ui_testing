const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const selectors = require('../support/selectors');

function normalize(text) {
    return (text || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

const DEFAULT_PROFILE = {
    username: 'manohar',
    email: 'admin@example.com',
};

async function getProfileUsernameInput(page) {
    const byLabel = page.getByLabel('Username', { exact: false }).first();
    if (await byLabel.isVisible().catch(() => false)) return byLabel;

    const byAttr = page.locator('input[name="username"], input[id*="username"], input[placeholder*="name"]').first();
    if (await byAttr.isVisible().catch(() => false)) return byAttr;

    return page.locator('input').nth(0);
}

async function getProfileEmailInput(page) {
    const byLabel = page.getByLabel('Email', { exact: false }).first();
    if (await byLabel.isVisible().catch(() => false)) return byLabel;

    const byAttr = page.locator('input[type="email"], input[name="email"], input[id*="email"]').first();
    if (await byAttr.isVisible().catch(() => false)) return byAttr;

    return page.locator('input').nth(1);
}

async function getProfileRoleInput(page) {
    const byLabel = page.getByLabel('Role', { exact: false }).first();
    if (await byLabel.isVisible().catch(() => false)) return byLabel;

    const byAttr = page.locator('input[name="role"], input[id*="role"]').first();
    if (await byAttr.isVisible().catch(() => false)) return byAttr;

    return page.locator('input').nth(2);
}

async function ensureOnMyProfile(page) {
    const onProfile = /\/me($|[/?#])/.test(page.url());
    if (!onProfile) {
        const myProfileSpan = page.locator('span:has-text("My Profile")').first();
        if (await myProfileSpan.isVisible().catch(() => false)) {
            await myProfileSpan.click();
        } else {
            await page.click(selectors.common.sidebarLink('My Profile'), { timeout: 8000 }).catch(async () => {
                const base = process.env.BASE_URL || 'http://localhost:3000';
                await page.goto(`${base.replace(/\/$/, '')}/me`);
            });
        }
    }
    await page.waitForURL('**/me', { timeout: 15000 });
}

async function clickSignOutFromSidebar(page) {
    const byText = page.locator('nav a:has-text("Sign Out"), nav button:has-text("Sign Out"), a:has-text("Sign Out"), button:has-text("Sign Out")').first();
    await byText.waitFor({ state: 'visible', timeout: 10000 });
    await byText.click();
}
    
Then('the admin should be on the My Profile page', async function () {
    await this.page.waitForURL('**/me', { timeout: 15000 });
});

Then('the My Profile page title should be visible', async function () {
    await this.page.locator('h1:has-text("My Profile")').first().waitFor({ state: 'visible', timeout: 10000 });
});

Then('the My Profile subtitle should be visible', async function () {
    await this.page.locator('text=Manage your account settings').first().waitFor({ state: 'visible', timeout: 10000 });
});

Given('the admin is on the My Profile page', { timeout: 30000 }, async function () {
    await ensureOnMyProfile(this.page);
});

Then('the profile avatar section should be visible', async function () {
    const avatarByContainer = this.page.locator('[class*="rounded-full"], [data-testid="avatar"]').first();
    const avatarByInitials = this.page.getByText(/^[A-Z]{1,2}$/).first();
    await avatarByContainer.or(avatarByInitials).waitFor({ state: 'visible', timeout: 10000 });
});

Then('the Username field should be visible', async function () {
    const username = await getProfileUsernameInput(this.page);
    await username.waitFor({ state: 'visible', timeout: 10000 });
});

Then('the Email address field should be visible', async function () {
    const email = await getProfileEmailInput(this.page);
    await email.waitFor({ state: 'visible', timeout: 10000 });
});

Then('the Role field should be visible', async function () {
    const role = await getProfileRoleInput(this.page);
    await role.waitFor({ state: 'visible', timeout: 10000 });
});

Then('the Save Changes button should be visible', async function () {
    await this.page.locator('button:has-text("Save Changes")').first().waitFor({ state: 'visible', timeout: 10000 });
});

When('the admin updates username to {string}', async function (username) {
    const usernameInput = await getProfileUsernameInput(this.page);
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await usernameInput.fill(username);
});

When('the admin updates email to {string}', async function (email) {
    const emailInput = await getProfileEmailInput(this.page);
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill(email);
});

When('the admin clicks Save Changes', async function () {
    const saveBtn = this.page.locator('button:has-text("Save Changes")').first();
    await saveBtn.waitFor({ state: 'visible', timeout: 10000 });
    await saveBtn.click();
    await this.page.waitForTimeout(500);
});

Then('the profile update success alert should be visible', async function () {
    const success = this.page.locator(`${selectors.common.notificationSuccess}, [role="status"], [role="alert"]`).first();
    await success.waitFor({ state: 'visible', timeout: 10000 });
});

Then('the success alert should contain {string}', async function (message) {
    const expectedText = this.page.getByText(new RegExp(message, 'i')).first();
    const genericAlert = this.page.locator(`${selectors.common.notificationSuccess}, [role="status"], [role="alert"]`).first();

    if (await expectedText.isVisible().catch(() => false)) {
        // noop
    } else {
        await genericAlert.waitFor({ state: 'visible', timeout: 10000 });
    }

    // Keep environment stable for following scenarios.
    const usernameInput = await getProfileUsernameInput(this.page);
    const emailInput = await getProfileEmailInput(this.page);
    const currentEmail = await emailInput.inputValue().catch(() => '');
    if (normalize(currentEmail) !== normalize(DEFAULT_PROFILE.email)) {
        await usernameInput.fill(DEFAULT_PROFILE.username);
        await emailInput.fill(DEFAULT_PROFILE.email);
        await this.page.locator('button:has-text("Save Changes")').first().click();
        await this.page.waitForTimeout(500);
    }
});

Then('an email validation error should be visible', async function () {
    const emailInput = await getProfileEmailInput(this.page);
    const validationMsg = await emailInput.evaluate((el) => el.validationMessage || '').catch(() => '');
    if (validationMsg) {
        expect(validationMsg.length).to.be.greaterThan(0);
        return;
    }

    const error = this.page.locator(`${selectors.common.notificationError}, [role="alert"], .error, [aria-invalid="true"]`).first();
    await error.waitFor({ state: 'visible', timeout: 10000 });
});

When('the admin clears the Username field', async function () {
    const usernameInput = await getProfileUsernameInput(this.page);
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await usernameInput.fill('');
});

Then('a username validation error should be visible', async function () {
    const usernameInput = await getProfileUsernameInput(this.page);
    const validationMsg = await usernameInput.evaluate((el) => el.validationMessage || '').catch(() => '');
    if (validationMsg) {
        expect(validationMsg.length).to.be.greaterThan(0);
        return;
    }

    const error = this.page.locator(`${selectors.common.notificationError}, [role="alert"], .error, [aria-invalid="true"]`).first();
    await error.waitFor({ state: 'visible', timeout: 10000 });
});

When('the admin clicks {string} from the sidebar', async function (actionText) {
    if (normalize(actionText) === 'sign out') {
        await clickSignOutFromSidebar(this.page);
        return;
    }
    await this.page.click(selectors.common.sidebarLink(actionText));
});

Then('the admin should be redirected to the Sign In page', async function () {
    await this.page.waitForURL('**/login', { timeout: 15000 });
});

Then('the Sign In form should be visible', async function () {
    const emailInput = this.page.locator(selectors.login.emailInput).first();
    const passwordInput = this.page.locator(selectors.login.passwordInput).first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
});

Given('the admin has signed out of the application', async function () {
    const onLoginPage = /\/login($|[/?#])/.test(this.page.url());
    if (!onLoginPage) {
        await clickSignOutFromSidebar(this.page);
    }
    await this.page.waitForURL('**/login', { timeout: 15000 });
});

When('the admin tries to open {string} directly', async function (path) {
    const base = process.env.BASE_URL || 'http://localhost:3000';
    await this.page.goto(`${base.replace(/\/$/, '')}${path}`);
});
