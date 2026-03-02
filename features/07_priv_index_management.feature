Feature: Privileged User - Index Management
  As a privileged user
  I want to manage index configurations and user access
  So that I can request changes and control who can access an index

  Background:
    Given the privileged user is logged into the application

  @priv-index
  Scenario: Privileged user opens Index List and sees index table
    When the privileged user clicks on "Index List" in the sidebar
    Then the index list page should be displayed
    And the index list table should be visible

  @priv-index
  Scenario: Privileged user opens an index from Top 5 table in Overview
    When the privileged user clicks on "Overview" in the sidebar
    Then the overview page should be displayed
    When the privileged user clicks on any index name from the Top 5 index table
    Then the user should be redirected to that index overview page

  @priv-index
  Scenario: Privileged user enables log reduction configuration and requests changes
    Given the privileged user is on an index overview page
    When the privileged user clicks "Edit" in Log Reduction Configuration
    And the privileged user enables all log reduction configurations
    And the privileged user clicks "Request Changes"
    Then the user should see an alert "Configuration changes requested"

  @priv-index
  Scenario: Privileged user opens Users page from index overview
    Given the privileged user is on an index overview page
    When the privileged user clicks the "Users" button
    Then the user should be redirected to the index users access page
    And the assigned users table should be visible

  @priv-index
  Scenario: Empty-state message is shown when no users are assigned to an index
    Given the privileged user is on the index users access page
    When no users are assigned to that index
    Then the message "No users explicitly assigned to this index." should be displayed

  @priv-index
  Scenario: Privileged user grants access to a user from Add User modal
    Given the privileged user is on the index users access page
    When the privileged user clicks "Add User"
    Then the add user access modal should be displayed
    When the privileged user selects any user in the modal
    And the privileged user clicks "Grant Access"
    Then the user should see an alert "User access granted"

  @priv-index
  Scenario: Granted user appears in assigned users table for the selected index
    Given a user was granted access to the selected index
    When the privileged user views the index users access page
    Then the granted user should appear in the assigned users table

  @priv-index
  Scenario: Assigned index is visible to the privileged user in Index List
    Given the privileged user has been assigned access to an index
    When the privileged user navigates to "Index List"
    Then the assigned index should be visible in the privileged user's index list table

  @priv-index
  Scenario: Privileged user can open row actions and view Edit Users Delete options
    Given the privileged user is on the index list page
    When the privileged user clicks the actions three-dot button for any index row
    Then the row actions dropdown should be visible
    And the row actions dropdown should contain "Edit"
    And the row actions dropdown should contain "Users"
    And the row actions dropdown should contain "Delete"

  @priv-index
  Scenario: Privileged user submits edit request update from row actions
    Given the privileged user is on the index list page
    When the privileged user opens row actions for any index
    And the privileged user clicks "Edit" from row actions
    Then the edit application modal should be displayed
    When the privileged user changes owner name to "test"
    And the privileged user clicks "Request Update"
    Then a confirmation dialog should be displayed
    When the privileged user confirms the update request
    Then the user should see an alert "Update request submitted"

  @priv-index
  Scenario: Privileged user opens users page from row actions and can revoke or cancel revoke
    Given the privileged user is on the index list page
    When the privileged user opens row actions for any index
    And the privileged user clicks "Users" from row actions
    Then the user should be redirected to the index users access page
    And the assigned users table should be visible
    When the privileged user clicks revoke action for an assigned user
    Then the revoke access confirmation dialog should be displayed
    When the privileged user confirms revoke
    Then the selected user access to that index should be revoked
    When the privileged user clicks revoke action for an assigned user
    And the privileged user clicks cancel in revoke confirmation
    Then the revoke action should be cancelled

  @priv-index
  Scenario: Privileged user cannot permanently delete index and sees admin access required
    Given the privileged user is on the index list page
    When the privileged user opens row actions for any index
    And the privileged user clicks "Delete" from row actions
    Then the permanent delete confirmation dialog should be displayed
    When the privileged user clicks "Delete Permanently"
    Then the user should see an alert "Admin access required"
