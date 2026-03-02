Feature: Admin Approvals Management
  As an Admin
  I want to review and manage approval requests
  So that I can approve or reject changes safely

  Background:
    Given the admin is logged into the HSBC application
    And the admin navigates to the "Approvals" page from the sidebar

  @approvals @view
  Scenario: Admin views Approvals page with Pending and History tabs
    Then the admin should be on the Approvals page
    And the approvals page title should be visible
    And the Pending tab should be visible
    And the History tab should be visible
    And the "All Types" filter should be visible
    And the "Latest First" sort dropdown should be visible

  @approvals @filters
  Scenario: Admin opens All Types filter dropdown
    When the admin opens the "All Types" filter dropdown
    Then the approvals type dropdown should show options:
      | Option      |
      | All Types   |
      | Config Edit |
      | User Edit   |
      | Index Edit  |

  @approvals @filters
  Scenario: Admin sees empty state when selected request type has no pending approvals
    When the admin opens the "All Types" filter dropdown
    And the admin selects approvals request type "User Edit"
    Then the approvals pending list should show "No pending approvals found."

  @approvals @sort
  Scenario: Admin opens sort dropdown and changes order
    When the admin opens the approvals sort dropdown
    Then the approvals sort dropdown should show options:
      | Option       |
      | Latest First |
      | Earliest First |
    When the admin selects approvals sort order "Earliest First"
    Then the approvals list should be sorted by "Earliest   First"

  @approvals @request-overview
  Scenario: Admin opens a pending request to view details
    Given pending approval requests are available
    When the admin opens the first pending approval request
    Then the request details panel should be visible
    And the request overview should display app name and request id
    And the proposed changes table should be visible
    And the "Approve" action should be visible
    And the "Reject" action should be visible

  @approvals @decision
  Scenario: Admin approves a pending request from details panel
    Given pending approval requests are available
    And the admin opens the first pending approval request
    When the admin clicks "Approve" for the selected request
    Then the selected request should be marked as approved

  @approvals @decision
  Scenario: Admin rejects a pending request from details panel
    Given pending approval requests are available
    And the admin opens the first pending approval request
    When the admin clicks "Reject" for the selected request
    Then the selected request should be marked as rejected
