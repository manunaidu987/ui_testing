Feature: Admin My Profile and Sign Out
  As an Admin
  I want to manage my profile details and sign out securely
  So that my account information stays updated and my session can be ended safely

  Background:
    Given the admin is logged into the HSBC application

  @my-profile @navigation
  Scenario: Admin navigates to My Profile page from sidebar
    When the admin navigates to the "My Profile" page from the sidebar
    Then the admin should be on the My Profile page
    And the My Profile page title should be visible
    And the My Profile subtitle should be visible

  @my-profile @view
  Scenario: Admin sees profile details and editable fields
    Given the admin is on the My Profile page
    Then the profile avatar section should be visible
    And the Username field should be visible
    And the Email address field should be visible
    And the Role field should be visible
    And the Save Changes button should be visible

  @my-profile @update
  Scenario: Admin updates username and email successfully
    Given the admin is on the My Profile page
    When the admin updates username to "manohar test"
    And the admin updates email to "manohar.test@example.com"
    And the admin clicks Save Changes
    Then the profile update success alert should be visible
    And the success alert should contain "Profile updated successfully"

  @my-profile @validation
  Scenario: Admin sees validation error for invalid email format
    Given the admin is on the My Profile page
    When the admin updates email to "invalid-email-format"
    And the admin clicks Save Changes
    Then an email validation error should be visible

  @my-profile @validation
  Scenario: Admin sees validation error when username is empty
    Given the admin is on the My Profile page
    When the admin clears the Username field
    And the admin clicks Save Changes
    Then a username validation error should be visible

  @my-profile @signout
  Scenario: Admin signs out from sidebar and is redirected to Sign In page
    When the admin clicks "Sign Out" from the sidebar
    Then the admin should be redirected to the Sign In page
    And the Sign In form should be visible

  @my-profile @signout
  Scenario: Signed-out admin cannot access My Profile page directly
    Given the admin has signed out of the application
    When the admin tries to open "/me" directly
    Then the admin should be redirected to the Sign In page
