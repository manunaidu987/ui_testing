Feature: Privileged(user)Login - Sign in to your account

  Background:
    Given the user navigates to the login page

  # HAPPY PATH
  @smoke @login
  Scenario: Successful login with valid credentials
    When the user enters email "priv@example.com" and password "priv123"
    And the user clicks the "Sign In" button
    Then the user should be redirected to the overview

  #  INVALID CREDENTIALS
  @regression @login
  Scenario: Login fails with wrong password
    When the user enters email "priv1@example.com" and password "priv1234"
    And the user clicks the "Sign In" button
    Then the user should see an error message 'Invalid email or password'

  #  EMPTY FIELDS
  @regression @validation
  Scenario: Login fails when fields are empty
    When the user clicks the "Sign In" button
    Then the user should see a validation error on the email field
    And the user should see a validation error on the password field

  #  INVALID EMAIL FORMAT
  @regression @validation
  Scenario: Login fails with invalid email format
    When the user enters email "notanemail" and password "priv123"
    And the user clicks the "Sign In" button
    Then the user should see an email format error

  #  PASSWORD VISIBILITY TOGGLE
  @regression @ui
  Scenario: User toggles password visibility
    When the user enters email "priv@example.com" and password "priv123"
    And the user clicks the password visibility toggle
    Then the password field should show the text as plain text

  #  CREATE ACCOUNT LINK
  @regression @navigation
  Scenario: User navigates to Create an account page
    When the user clicks the "Create an account" link
    Then the user should be redirected to the register page

  # FORGOT PASSWORD LINK
  @regression @navigation
  Scenario: User navigates to Forgot Password page
    When the user clicks the "Forgot password?" link
    Then the user should be redirected to the forgot password page


