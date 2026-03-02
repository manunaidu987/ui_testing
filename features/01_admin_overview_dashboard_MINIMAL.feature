@admin @dashboard @regression
Feature: Admin Overview Dashboard Verification
  As an Admin
  I want to verify the dashboard elements and their responsiveness to time period changes
  So that I can monitor the system metrics accurately

  Background:
    Given the admin is logged into the application
    And the admin navigates to the "Overview" page

  @smoke
  Scenario: Verify Metric Cards and Charts Visibility
    When the admin views the Overview dashboard
    Then the admin should see the "Amount Saved" metric
    And the admin should see the "Total Indexes Connected" metric
    And the admin should see the "Avg. Reduction Rate" metric
    And the admin should see the "Input Log Throughput" metric
    And the admin should see the "Log Severity Distribution after Reduction" chart
    And the admin should see the "Input Logs vs Output Logs Trend" graph
    And the admin should see the "Top 5 Index Data" table

  Scenario: Verify Log Severity Distribution Details
    When the admin views the "Log Severity Distribution after Reduction" chart on the overview page
    Then the admin should see "Info" logs
    And the admin should see "Warn" logs
    And the admin should see "Error" logs
    And the admin should see "Fatal" logs
    And the admin should see "Debug" logs

  Scenario: Verify Traffic Trend Graph Data Points
    When the admin views the "Input Logs vs Output Logs Trend" graph on the overview page
    Then the admin should see data points for time periods "12am, 4am, 8am, 12pm, 4pm"
    And the admin should see both "Input" and "Output" log volumes

  Scenario: Verify Top 5 Index Data Table Structure
    When the admin views the "Top 5 Index Data" table on the overview page
    Then the table should display columns for "Index Name", "Input Logs Count", "Input Logs Size (MB)", "Reduction %", "Amount Saved"
    And the table should show up to 5 indexes

  Scenario: Check Dashboard Refresh on Time Period Change
    When the admin selects "1 hr" from the time period dropdown
    Then the dashboard metrics should refresh
    And the admin should see the "Top 5 Index Data" table
    And the table should show up to 5 indexes
