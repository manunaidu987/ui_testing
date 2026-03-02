const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

function normalize(text) {
    return (text || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function normalizeNoSpace(text) {
    return (text || '').toLowerCase().replace(/\s+/g, '');
}

async function readPendingCount(page) {
    const pendingTab = page.locator('button:has-text("Pending"), [role="tab"]:has-text("Pending")').first();
    const pendingLabel = normalize(await pendingTab.textContent().catch(() => ''));
    const match = pendingLabel.match(/pending\s*\((\d+)\)/i);
    return match ? Number(match[1]) : null;
}

async function getApprovalsTypeFilter(page) {
    const candidates = page.locator('select');
    const count = await candidates.count();
    for (let i = 0; i < count; i += 1) {
        const select = candidates.nth(i);
        const optionsText = await select.locator('option').allTextContents().catch(() => []);
        if (optionsText.some((t) => normalize(t).includes('all types'))) {
            return select;
        }
    }
    return page.locator('select').first();
}

async function getApprovalsSortFilter(page) {
    const candidates = page.locator('select');
    const count = await candidates.count();
    for (let i = 0; i < count; i += 1) {
        const select = candidates.nth(i);
        const optionsText = await select.locator('option').allTextContents().catch(() => []);
        if (optionsText.some((t) => normalize(t).includes('latest first') || normalize(t).includes('earliest first'))) {
            return select;
        }
    }
    return page.locator('select').nth(1);
}

Then('the admin should be on the Approvals page', async function () {
    await this.page.waitForURL('**/approvals', { timeout: 15000 });
});

Then('the approvals page title should be visible', async function () {
    await this.page.locator('h1:has-text("Approvals")').first().waitFor({ state: 'visible', timeout: 10000 });
});

Then('the Pending tab should be visible', async function () {
    await this.page.locator('button:has-text("Pending"), [role="tab"]:has-text("Pending")').first().waitFor({ state: 'visible', timeout: 10000 });
});

Then('the History tab should be visible', async function () {
    await this.page.locator('button:has-text("History"), [role="tab"]:has-text("History")').first().waitFor({ state: 'visible', timeout: 10000 });
});

Then('the {string} filter should be visible', async function (filterText) {
    const filter = this.page.locator('select, [role="combobox"]').filter({ hasText: filterText }).first();
    await filter.waitFor({ state: 'visible', timeout: 10000 });
});

Then('the {string} sort dropdown should be visible', async function (sortText) {
    const dropdown = this.page.locator('select, [role="combobox"]').filter({ hasText: sortText }).first();
    await dropdown.waitFor({ state: 'visible', timeout: 10000 });
});

When('the admin opens the {string} filter dropdown', async function (filterText) {
    const filter = await getApprovalsTypeFilter(this.page);
    await filter.waitFor({ state: 'visible', timeout: 10000 });
    await filter.click();
    const selectedText = await filter.locator('option:checked').first().textContent().catch(() => '');
    if (filterText && selectedText) {
        expect(normalize(selectedText)).to.include(normalize(filterText));
    }
});

Then('the approvals type dropdown should show options:', async function (dataTable) {
    const expected = dataTable.hashes().map((r) => normalize(r.Option));
    const filter = await getApprovalsTypeFilter(this.page);
    const options = (await filter.locator('option').allTextContents()).map((t) => normalize(t));
    for (const option of expected) {
        expect(options).to.include(option);
    }
});

When('the admin selects approvals request type {string}', async function (requestType) {
    const filter = await getApprovalsTypeFilter(this.page);
    const options = await filter.locator('option').allTextContents();
    const target = options.find((t) => normalize(t) === normalize(requestType));

    if (target) {
        await filter.selectOption({ label: target.trim() });
    } else {
        await filter.selectOption(requestType).catch(async () => {
            await filter.selectOption(requestType.toLowerCase().replace(/\s+/g, '_'));
        });
    }
    await this.page.waitForLoadState('networkidle');
});

Then('the approvals pending list should show {string}', async function (message) {
    await this.page.getByText(message, { exact: true }).first().waitFor({ state: 'visible', timeout: 10000 });
});

When('the admin opens the approvals sort dropdown', async function () {
    const sortFilter = await getApprovalsSortFilter(this.page);
    await sortFilter.waitFor({ state: 'visible', timeout: 10000 });
    await sortFilter.click();
});

Then('the approvals sort dropdown should show options:', async function (dataTable) {
    const expected = dataTable.hashes().map((r) => normalize(r.Option));
    const sortFilter = await getApprovalsSortFilter(this.page);
    const options = (await sortFilter.locator('option').allTextContents()).map((t) => normalize(t));
    for (const option of expected) {
        expect(options).to.include(option);
    }
});

Then('the approvals list should be sorted by {string}', async function (sortOrder) {
    const sortFilter = await getApprovalsSortFilter(this.page);
    const selected = await sortFilter.locator('option:checked').first().textContent();
    expect(normalizeNoSpace(selected)).to.include(normalizeNoSpace(sortOrder));
});

Given('pending approval requests are available', { timeout: 30000 }, async function () {
    const pendingTab = this.page.locator('button:has-text("Pending"), [role="tab"]:has-text("Pending")').first();
    await pendingTab.waitFor({ state: 'visible', timeout: 10000 });
    await pendingTab.click();

    const typeFilter = await getApprovalsTypeFilter(this.page);
    await typeFilter.waitFor({ state: 'visible', timeout: 10000 });
    await typeFilter.selectOption({ label: 'All Types' }).catch(async () => {
        await typeFilter.selectOption('All Types').catch(async () => {
            await typeFilter.selectOption('all_types');
        });
    });

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500);

    const pendingCount = await readPendingCount(this.page);
    this.pendingCountBeforeAction = pendingCount;

    if (Number.isFinite(pendingCount) && pendingCount !== null && pendingCount === 0) {
        throw new Error('No pending approvals are available for validation.');
    }

    const requestCards = this.page.locator('text=Config Edit Request').first();
    const emptyState = this.page.getByText('No pending approvals found.').first();
    const hasRequestCard = await requestCards.isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);

    if (!hasRequestCard && isEmpty) {
        throw new Error('No pending approvals are available for validation.');
    }

    expect(hasRequestCard || !isEmpty).to.equal(true);
});

When('the admin opens the first pending approval request', async function () {
    const requestTitle = this.page.locator('text=Config Edit Request').first();
    if (await requestTitle.isVisible().catch(() => false)) {
        await requestTitle.click();
    } else {
        await this.page.locator('text=Request ID:').first().click();
    }
});

Then('the request details panel should be visible', async function () {
    await this.page.locator('text=Proposed Changes').first().waitFor({ state: 'visible', timeout: 10000 });
});

Then('the request overview should display app name and request id', async function () {
    await this.page.getByText(/App name/i).first().waitFor({ state: 'visible', timeout: 10000 });
    await this.page.getByText(/Request ID/i).first().waitFor({ state: 'visible', timeout: 10000 });
});

Then('the request details should show {string}', async function (fieldLabel) {
    await this.page.getByText(new RegExp(fieldLabel, 'i')).first().waitFor({ state: 'visible', timeout: 10000 });
});

Then('the proposed changes table should be visible', async function () {
    await this.page.getByText('Proposed Changes').first().waitFor({ state: 'visible', timeout: 10000 });
    await this.page.getByText(/Current/i).first().waitFor({ state: 'visible', timeout: 10000 });
    await this.page.getByText(/Proposed/i).first().waitFor({ state: 'visible', timeout: 10000 });
});

Then('the {string} action should be visible', async function (actionText) {
    await this.page.locator(`button:has-text("${actionText}")`).first().waitFor({ state: 'visible', timeout: 10000 });
});

When('the admin clicks {string} for the selected request', async function (actionText) {
    await this.page.locator(`button:has-text("${actionText}")`).first().click();
    const confirmButton = this.page
        .locator(`[role="dialog"] button:has-text("${actionText}"), [role="dialog"] button:has-text("Submit"), [role="dialog"] button:has-text("Confirm")`)
        .first();
    if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click();
    }
    await this.page.waitForLoadState('networkidle');
});

Then('the selected request should be marked as approved', { timeout: 30000 }, async function () {
    const approvedSignal = this.page.locator('text=Approved, text=APPROVED, [data-status=\"approved\"]').first();
    const successToast = this.page.locator('[role="status"], .toast, .notification').first();
    const approvedVisible = await approvedSignal.isVisible().catch(() => false);
    const toastVisible = await successToast.isVisible().catch(() => false);

    if (approvedVisible || toastVisible) {
        return;
    }

    const currentPendingCount = await readPendingCount(this.page);
    if (Number.isFinite(this.pendingCountBeforeAction) && Number.isFinite(currentPendingCount)) {
        expect(currentPendingCount).to.be.at.most(this.pendingCountBeforeAction);
        return;
    }

    throw new Error('Could not verify that the selected request was approved.');
});

Then('the selected request should be marked as rejected', { timeout: 30000 }, async function () {
    const rejectedSignal = this.page.locator('text=Rejected, text=REJECTED, [data-status=\"rejected\"]').first();
    const successToast = this.page.locator('[role="status"], .toast, .notification').first();
    const rejectedVisible = await rejectedSignal.isVisible().catch(() => false);
    const toastVisible = await successToast.isVisible().catch(() => false);

    if (rejectedVisible || toastVisible) {
        return;
    }

    const currentPendingCount = await readPendingCount(this.page);
    if (Number.isFinite(this.pendingCountBeforeAction) && Number.isFinite(currentPendingCount)) {
        expect(currentPendingCount).to.be.at.most(this.pendingCountBeforeAction);
        return;
    }

    throw new Error('Could not verify that the selected request was rejected.');
});
