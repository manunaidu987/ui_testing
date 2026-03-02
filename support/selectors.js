/**
 * Centralized repository for locators used in the project.
 */
module.exports = {
    login: {
        emailInput: '#email, input[placeholder="Enter email"], input[aria-label="Email address"]',
        passwordInput: '#password, input[placeholder="Enter password"], input[aria-label="Password"]',
        signInButton: 'button[type="submit"], button:has-text("Sign in"), button:has-text("Sign In")',
        pageHeading: 'text=Sign in to your account, text=Sign In',
    },

    common: {
        sidebarLink: (name) => `a[role="link"]:has-text("${name}"), nav a:has-text("${name}"), nav button:has-text("${name}")`,
        button: (text) => `button:has-text("${text}"), [role="button"]:has-text("${text}")`,
        closeButton: 'button[aria-label="Close"], button:has-text("Close")',
        notification: '.notification, .toast, .alert, [role="status"], [role="alert"]',
        notificationError: '.notification.error, .toast.error, .alert.error, [role="alert"]',
        notificationSuccess: '.notification.success, .toast.success, .alert.success, [role="status"]',
        errorMessage: '.error-message, .alert.error, [role="alert"]',
        pageTitle: 'h1, [data-testid="page-title"]',
        pageSubtitle: '[data-testid="page-subtitle"], .subtitle, p',
        modalContainer: '[role="dialog"], .modal, [data-radix-dialog-content]',
        modalTitle: '[role="dialog"] h1, [role="dialog"] h2, .modal h1, .modal h2',
        modalSubtitle: '[role="dialog"] p, .modal .subtitle',
    },

    dashboard: {
        heading: 'h1:has-text("Overview"), h1:has-text("Dashboard")',
        metricCard: (name) => `div:has-text("${name}")`,
        metricValue: '.metric-value',
        chartContainer: (title) => `.chart-container:has-text("${title}"), [data-testid*="chart"], div:has-text("${title}")`,
        graphContainer: (title) => `.graph-container:has-text("${title}"), [data-testid*="graph"], div:has-text("${title}")`,
        tableContainer: (title) => `.table-container:has-text("${title}"), table:has-text("${title}")`,
        severityItem: (severity) => `div:has-text("${severity}")`,
        xAxisLabel: (period) => `.x-axis-label:has-text("${period}"), .recharts-cartesian-axis-tick-value:has-text("${period}")`,
        legendItem: (name) => `.legend-item:has-text("${name}"), .recharts-legend-item:has-text("${name}")`,
        timeDropdown: 'button[role="combobox"], [role="combobox"], .time-period-dropdown',
        dropdownItem: (text) => `[role="option"]:has-text("${text}"), .dropdown-item:has-text("${text}"), [role="menuitem"]:has-text("${text}")`,
    },

    indexList: {
        emptyState: '.empty-state, [data-testid="empty-state"]',
        tableRow: 'tbody tr',
        searchInput: 'input[type="search"], input[placeholder*="Search"]',
        pagination: '.pagination, [data-testid="pagination"]',
        paginationDropdown: '.pagination select, [data-testid="items-per-page"]',
        rowByName: (name) => `tr:has-text("${name}")`,
        actionsMenuButton: 'button[id^="radix-"], button[aria-haspopup="menu"]',
        checkboxInRow: (name) => `tr:has-text("${name}") input[type="checkbox"]`,
        bulkActions: '.bulk-actions, [data-testid="bulk-actions"]',
        addAppButton: 'button:has-text("+ Add App"), button:has-text("Add App")',
        ownerNameField: 'input[placeholder*="e.g. payment-prod"], input[aria-label*="Owner"], input[name*="owner"], input[id*="owner"]',
        appNameField: 'input[placeholder*="e.g. Payment Gateway"], input[aria-label*="App Name"], input[name*="app"], input[id*="app"]',
        podNameField: 'input[placeholder*="POD"], input[aria-label*="POD"], input[placeholder*="payment-gateway"]',
        splunkIndexField: 'input[placeholder*="Index name"], input[name*="splunkIndex"]',
        tokenField: 'input[placeholder*="Token"], input[name*="token"]',
        submitButton: 'button:has-text("Submit")',
        cancelButton: 'button:has-text("Cancel")',
    },

    userList: {
        pageHeading: 'h1:has-text("User List")',
        pageSubtitle: 'text=Manage platform users and their roles',
        searchInput: 'input[placeholder="Search users..."], input[placeholder*="Search users"]',
        tableHeaderUser: 'th:has-text("User")',
        tableHeaderDepartment: 'th:has-text("Department")',
        tableHeaderRole: 'th:has-text("Role")',
        tableHeaderActions: 'th:has-text("Actions")',
        tableRow: 'tbody tr',
        rowByUsername: (username) => `tbody tr:has-text("${username}")`,
        actionsButtonInRow: (username) => `tbody tr:has-text("${username}") button[id^="radix-"], tbody tr:has-text("${username}") button[aria-haspopup="menu"], tbody tr:has-text("${username}") button:has-text("...")`,
        editMenuItem: '[role="menuitem"]:has-text("Edit")',
        deleteMenuItem: '[role="menuitem"]:has-text("Delete")',
        editModalTitle: 'h2:has-text("Edit User Role"), h1:has-text("Edit User Role")',
        roleOption: (role) => `[role="radio"]:has-text("${role}"), label:has-text("${role}")`,
        accountAccessSwitch: '[role="switch"], .w-11',
        accountAccessSection: 'text=Account Access',
        updateChangesButton: 'button:has-text("Update Changes")',
        signOutButton: 'button:has-text("Sign Out"), a:has-text("Sign Out")',
    },

    approvals: {
        historyTab: 'button:has-text("History")',
        actions: async (page) => {
            await page.locator('div').nth(1).click();
            await page.getByRole('link', { name: 'Approvals' }).click();
            await page.getByRole('button', { name: 'History (0)' }).click();
            await page.getByRole('button', { name: 'Pending (3)' }).click();
            await page.getByRole('combobox').first().selectOption('config_edit');
            await page.getByRole('combobox').nth(1).selectOption('oldest');
            await page.getByRole('button', { name: 'REQ config edit Request(Authentication Service) Requester ID: 2 Feb 17, 2026,' }).click();
            await page.getByRole('button', { name: 'REQ config edit Request(Authentication Service) Requester ID: 2 Feb 17, 2026,' }).press('ControlOrMeta+-');
            await page.getByRole('button', { name: 'REQ config edit Request(Authentication Service) Requester ID: 2 Feb 17, 2026,' }).press('ControlOrMeta+-');
            await page.getByRole('button', { name: 'REQ config edit Request(Authentication Service) Requester ID: 2 Feb 17, 2026,' }).press('ControlOrMeta+-');
            await page.getByRole('button', { name: 'Approve' }).click();
        }
    },

    logReduction: {
        configHeading: 'h2:has-text("Log Reduction Configuration"), h3:has-text("Log Reduction Configuration")',
        editButton: 'button:has-text("Edit")',
        switches: '[role="switch"], button[role="switch"], .peer, input[type="checkbox"]',
    }
}