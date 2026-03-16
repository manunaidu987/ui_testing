Feature: Admin User List Management
  As an Admin
  I want to manage users and their roles
  So that I can control access to the platform

  Background:
    Given the admin is logged into the HSBC application
    And the admin navigates to the "User List" page from the sidebar

  @user-list @view
  Scenario: Admin views User List page and table
    When the admin is on the User List page
    Then the user list title should be visible
    And the user list subtitle should be visible
    And the user list search input should be visible
    And the user list table should show columns:
      | Column     |
      | User       |
      | Department |
      | Role       |
      | Actions    |

  @user-list @search
  Scenario: Admin searches user by username
    Given users exist in the User List table
    When the admin searches for user "regularuser"
    Then only users matching "regularuser" should be displayed in the User List

  @user-list @actions
  Scenario: Admin sees Edit and Delete in actions menu
    Given a user "regularuser" exists in the User List
    When the admin opens actions menu for user "regularuser"
    Then the actions dropdown should show options:
      | Option |
      | Edit   |
      | Delete |

  @user-list @edit-role
  Scenario: Admin edits user role
    Given a user "regularuser" exists in the User List
    When the admin opens actions menu for user "regularuser"
    And the admin selects "Edit" from user actions
    Then the Edit User Role form should open
    When the admin sets role to "Privileged"
    And the admin saves user role changes
    Then the role for user "regularuser" should be "Privileged" in the User List

  @user-list @account-access
  Scenario: Admin disables account access in Edit User Role form
    Given a user "regularuser" exists in the User List
    When the admin opens actions menu for user "regularuser"
    And the admin selects "Edit" from user actions
    Then the Edit User Role form should open
    When the admin disables account access
    And the admin saves user role changes
    Then the account access status should show disabled in the form

  @user-list @account-access @login-block
  Scenario: Disabled user should not be able to login
    Given the admin disabled account access for user "regularuser"
    When the disabled user tries to login with email "regularuser@example.com" and password "user123"
    Then login should be blocked for the disabled user

  @user-list @approvals
  Scenario: Admin validates approval filters from sidebar
    When the admin navigates to the "Approvals" page from the sidebar
    And the admin selects approvals action filter "user_edit"
    And the admin selects approvals action filter "index_edit"
    And the admin selects approvals sort order "oldest"
    Then the approvals history tab should be visible and clickable
