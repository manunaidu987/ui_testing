    @privileged @dashboard @regression
Feature: Privileged User Overview Dashboard Verification
  As a Privileged User
  I want to verify overview dashboard elements and role-specific navigation
  So that I can monitor metrics and submit changes that require admin approval

  Background:
    Given the privileged user logs into the application with email "priv@example.com" and password "priv123"
    And the privileged user navigates to the "Overview" page

  @smoke
  Scenario: Verify metric cards and charts visibility for privileged user
    When the privileged user views the Overview dashboard
    Then the privileged user should see the "Amount Saved" metric
    And the privileged user should see the "Total Indexes Connected" metric
    And the privileged user should see the "Avg. Reduction Rate" metric
    And the privileged user should see the "Input Log Throughput" metric
    And the privileged user should see the "Log Severity Distribution after Reduction" chart
    And the privileged user should see the "Input Logs vs Output Logs Trend" graph
    And the privileged user should see the "Top 5 Index Data" table

  Scenario: Verify log severity distribution details for privileged user
    When the privileged user views the "Log Severity Distribution after Reduction" chart on the overview page
    Then the privileged user should see "Info" logs
    And the privileged user should see "Warn" logs
    And the privileged user should see "Error" logs
    And the privileged user should see "Fatal" logs
    And the privileged user should see "Debug" logs

  Scenario: Verify traffic trend graph data points for privileged user
    When the privileged user views the "Input Logs vs Output Logs Trend" graph on the overview page
    Then the privileged user should see data points for time periods "12am, 4am, 8am, 12pm, 4pm"
    And the privileged user should see both "Input" and "Output" log volumes

  Scenario: Verify Top 5 Index Data table structure for privileged user
    When the privileged user views the "Top 5 Index Data" table on the overview page
    Then the table should display columns for "Index Name", "Input Logs Count", "Input Logs Size (MB)", "Reduction %", "Amount Saved"
    And the table should show up to 5 indexes

  Scenario: Check dashboard refresh on time period change for privileged user
    When the privileged user selects "1 hr" from the time period dropdown
    Then the dashboard metrics should refresh
    And the privileged user should see the "Top 5 Index Data" table
    And the table should show up to 5 indexes

  @navigation @role
  Scenario: Privileged user sees Requests instead of Approvals in sidebar
    Then the privileged user should see "Requests" in the sidebar
    And the privileged user should not see "Approvals" in the sidebar

  @role @access
  Scenario: Privileged user change actions require admin approval
    When the privileged user performs a configuration change
    Then the change should be submitted as a request for admin approval

  @role @access
  Scenario: Regular User role has no access to privileged dashboard actions
    Given a regular user logs into the application
    When the user navigates to the "Overview" page
    Then privileged-only actions should not be accessible
