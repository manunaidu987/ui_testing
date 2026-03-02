const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const selectors = require('../support/selectors');

// ─────────────────────────────────────────
// GIVEN
// ─────────────────────────────────────────

Given('the user navigates to the login page', async function () {
    await this.page.goto('http://localhost:3000/login');

    // Wait for the Sign In heading to confirm page loaded
    await this.page.locator(selectors.login.emailInput).first().waitFor({ state: 'visible', timeout: 10000 });
    await this.page.locator(selectors.login.passwordInput).first().waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Login page loaded');
});

// ─────────────────────────────────────────
// WHEN
// ─────────────────────────────────────────

When('the user enters email {string} and password {string}', async function (email, password) {
    // Fill Email field
    await this.page.fill(selectors.login.emailInput, email);

    // Fill Password field
    await this.page.fill(selectors.login.passwordInput, password);

    console.log(`📝 Entered email: ${email}`);
});

When('the user clicks the {string} button', async function (buttonText) {
    await this.page.click(selectors.common.button(buttonText));
    console.log(`🖱️ Clicked button: ${buttonText}`);
});

When('the user clicks the {string} link', async function (linkText) {
    await this.page.click(`a:has-text("${linkText}")`);
    console.log(`🔗 Clicked link: ${linkText}`);
});

When('the user clicks the password visibility toggle', async function () {
    // The eye icon button next to password field
    await this.page.click('input[placeholder="Enter password"] ~ button');
    console.log('👁️ Clicked password visibility toggle');
});

// ─────────────────────────────────────────
// THEN
// ─────────────────────────────────────────

Then('the user should be redirected to the overview', async function () {
    await this.page.waitForURL('**/overview', { timeout: 5000 });
    const url = this.page.url();
    expect(url).to.include('/overview');
    console.log('✅ Redirected to overview');
});

Then('the user should see an error message {string}', async function (expectedMessage) {
    // Specifically wait for the text to appear on the page
    const textLocator = this.page.locator(`text=${expectedMessage}`).first();

    // Increased timeout to 10s as login can be slow
    await textLocator.waitFor({ state: 'visible', timeout: 10000 });
    const actualMessage = await textLocator.textContent();

    expect(actualMessage.trim()).to.include(expectedMessage);
    console.log(`❌ Error shown: ${actualMessage.trim()}`);
});

Then('the user should see a validation error on the email field', async function () {
    const emailError = this.page.locator('input[placeholder="Enter email"] ~ span.error, input[placeholder="Enter email"]:invalid');
    await emailError.waitFor({ timeout: 3000 });
    const isVisible = await emailError.isVisible();
    expect(isVisible).to.be.true;
    console.log('⚠️ Email validation error shown');
});

Then('the user should see a validation error on the password field', async function () {
    const passwordError = this.page.locator(`${selectors.login.passwordInput} ~ span.error, ${selectors.login.passwordInput}:invalid`);
    await passwordError.waitFor({ timeout: 3000 });
    const isVisible = await passwordError.isVisible();
    expect(isVisible).to.be.true;
    console.log('⚠️ Password validation error shown');
});

Then('the user should see an email format error', async function () {
    const emailInput = this.page.locator(selectors.login.emailInput);
    // Check HTML5 native validity OR custom error message
    const validationMessage = await emailInput.evaluate(el => el.validationMessage);
    expect(validationMessage).to.not.be.empty;
    console.log(`⚠️ Email format error: ${validationMessage}`);
});

Then('the password field should show the text as plain text', async function () {
    const inputType = await this.page.locator(selectors.login.passwordInput).getAttribute('type');
    expect(inputType).to.equal('text');
    console.log('👁️ Password is now visible as plain text');
});

Then('the user should be redirected to the register page', async function () {
    await this.page.waitForURL('**/register', { timeout: 5000 });
    const url = this.page.url();
    expect(url).to.include('/register');
    console.log('✅ Redirected to register page');
});

Then('the user should be redirected to the forgot password page', async function () {
    await this.page.waitForURL('**/forgot-password', { timeout: 5000 });
    const url = this.page.url();
    expect(url).to.include('/forgot-password');
    console.log('✅ Redirected to forgot password page');
});

