
# Feature: Admin Index List Management
# This feature covers admin's ability to manage application index connections

Feature: Admin Index List Management
  As an Admin
  I want to manage application index connections
  So that I can monitor and control log ingestion routing

  Background:
    Given the admin is logged into the HSBC application
    And the admin navigates to the "Index List" page from the sidebar

  # ==================== VIEW INDEX LIST PAGE SCENARIOS ====================

  @smoke @index @view
  Scenario: Admin views the Index List page
    When the admin is on the Index List page
    Then the page title should display "Index List"
    And the page subtitle should display "Manage applications and log ingestion routing"
    And the admin should see a search bar with placeholder "Search indexes..."
    And the admin should see an "Add App" button in the top right corner
    And the admin should see a table with the following columns:
      | Column Name    |
      | Index Name     |
      | Owner Name     |
      | Target System  |
      | Splunk Index   |
      | Actions        |

  @index @view
  Scenario: Admin views existing index entries
    Given the Index List page contains existing applications
    When the admin views the index list table
    Then the admin should see multiple index entries displayed
    And each entry should show:
      | Field          | Example Value           |
      | Index Name     | Authentication Service  |
      | Owner Name     | security                |
      | Target System  | Splunk                  |
      | Splunk Index   | auth-prod               |
      | Actions        | ... (three dots menu)   |

  # ==================== SEARCH FUNCTIONALITY SCENARIOS ====================

  @index @search @positive
  Scenario: Admin searches for a specific index
    Given multiple indexes exist in the Index List
    When the admin enters "Payment" in the search field
    Then only indexes containing "Payment" in their name should be displayed
    And other indexes should be filtered out

  @index @search @positive
  Scenario: Admin searches for index by owner name
    Given multiple indexes exist in the Index List
    When the admin enters "security" in the search field
    Then only indexes with "security" as owner name should be displayed

  @index @search @negative
  Scenario: Admin searches for non-existent index
    Given multiple indexes exist in the Index List
    When the admin enters "NonExistentIndex123" in the search field
    Then no results should be displayed
    

  @index @search @positive
  Scenario: Admin clears search results
    Given the admin has performed a search for "Payment"
    And filtered results are displayed
    When the admin clears the search field
    Then all indexes should be displayed again

  # ==================== CREATE NEW APPLICATION SCENARIOS ====================

  @index @create @positive
  Scenario: Admin successfully adds a new application with valid data
    When the admin clicks the "Add App" button
    Then the "Add New Application" modal should be displayed
    And the modal title should show "Add New Application"
    And the modal subtitle should show "Add a new application for log ingestion."
    When the admin enters the following application details:
      | Field                      | Value                    |
      | Owner Name (Namespace)*    | manohar_qa             |
      | App Name*                  | cucumber              |
      | POD Name                   | payment-gateway-7d8f9    |
      | Target system              | Splunk                   |
      | Splunk Index               | payment-prod             |
      | Token                      | splunk-1234567890   |
    And the admin clicks the "Submit" button
    Then the modal should close
    And the new application "cucumber" should appear in the Index List
    And a success notification should be displayed

  @index @create @positive
  Scenario: Admin successfully adds application with minimum required fields
    When the admin clicks the "Add App" button
    And the admin enters the following application details:
      | Field                      | Value                    |
      | Owner Name (Namespace)*    | manohar|
      | App Name*                  | Superalign|
    And the admin clicks the "Submit" button
    Then the new application should be created successfully
    And it should appear in the Index List

  @index @create @positive
  Scenario: Admin adds application with all optional fields filled
    When the admin clicks the "Add App" button
    And the admin enters the following application details:
      | Field                      | Value                    |
      | Owner Name (Namespace)*    | finance-prod             |
      | App Name*                  | Finance Dashboard        |
      | POD Name                   | finance-dashboard-001    |
      | Target system              | Splunk                   |
      | Splunk Index               | finance-prod-index       |
      | Token                      | abcd-efgh-ijkl-mnop      |
    And the admin clicks the "Submit" button
    Then the application should be created with all provided details
    And all fields should be visible in the index list

  # ==================== CREATE - VALIDATION ERROR SCENARIOS ====================

  @index @create @negative @validation
  Scenario: Admin attempts to submit form with empty required fields
    When the admin clicks the "Add App" button
    And the admin leaves all fields empty
    And the admin clicks the "Submit" button
    Then the system should display an error notification "App Name and Owner Name (Namespace) are required"
    And the modal should remain open
    And the application should not be created

  @index @create @negative @validation
  Scenario: Admin attempts to submit with only Owner Name filled
    When the admin clicks the "Add App" button
    And the admin enters "test-owner" in the "Owner Name (Namespace)" field
    And the admin leaves the "App Name" field empty
    And the admin clicks the "Submit" button
    Then the system should display an error notification "App Name and Owner Name (Namespace) are required"
    And the form should not be submitted

  @index @create @negative @validation
  Scenario: Admin attempts to submit with only App Name filled
    When the admin clicks the "Add App" button
    And the admin enters "Test App" in the "App Name" field
    And the admin leaves the "Owner Name (Namespace)" field empty
    And the admin clicks the "Submit" button
    Then the system should display an error notification "App Name and Owner Name (Namespace) are required"
    And the form should not be submitted

  @index @create @negative @validation
  Scenario: Admin enters invalid characters in Owner Name field
    When the admin clicks the "Add App" button
    And the admin enters "fghj23456" in the "Owner Name (Namespace)" field
    And the admin enters "Valid App Name" in the "App Name" field
    And the admin clicks the "Submit" button
    Then the system should display "Please enter a valid owner name" notification
    And the form should not be submitted
    And the "Owner Name (Namespace)" field should be highlighted

  @index @create @negative @validation
  Scenario: Admin enters invalid characters in App Name field
    When the admin clicks the "Add App" button
    And the admin enters "valid-namespace" in the "Owner Name (Namespace)" field
    And the admin enters "fghj23456@#$" in the "App Name" field
    And the admin clicks the "Submit" button
    Then the system should display "Please enter a valid application name" notification
    And the form should not be submitted
    And the "App Name" field should be highlighted

  @index @create @negative @validation
  Scenario: Admin enters only special characters in required fields
    When the admin clicks the "Add App" button
    And the admin enters "@#$%^&*" in the "Owner Name (Namespace)" field
    And the admin enters "!@#$%^&" in the "App Name" field
    And the admin clicks the "Submit" button
    Then the system should display "Please enter valid values for all required fields" notification
    And the form should not be submitted

  @index @create @negative @validation
  Scenario: Admin enters only spaces in required fields
    When the admin clicks the "Add App" button
    And the admin enters "   " in the "Owner Name (Namespace)" field
    And the admin enters "   " in the "App Name" field
    And the admin clicks the "Submit" button
    Then the system should display "App Name and Owner Name (Namespace) are required" notification
    And the form should not be submitted

 
  @index @create @negative @validation
  Scenario: Admin enters excessively long values in fields
    When the admin clicks the "Add App" button
    And the admin enters a 300-character string in the "Owner Name (Namespace)" field
    And the admin enters a valid "App Name"
    And the admin clicks the "Submit" button
    Then the system should display "Owner Name exceeds maximum character limit" notification
    And the form should not be submitted


  @index @create @negative @validation
  Scenario: Admin enters numeric-only values in name fields
    When the admin clicks the "Add App" button
    And the admin enters "12345" in the "Owner Name (Namespace)" field
    And the admin enters "67890" in the "App Name" field
    And the admin clicks the "Submit" button
    Then the system should display "Please enter valid names with alphabetic characters" notification
    And the form should not be submitted

  # ==================== CREATE - CANCEL SCENARIOS ====================

  @index @create @positive @cancel
  Scenario: Admin closes modal using X button
    When the admin clicks the "Add App" button
    And the "Add New Application" modal is displayed
    And the admin enters some data in the form fields
    And the admin clicks the "X" close button on the modal
    Then the modal should close
    And no new application should be added
    And the entered data should be discarded

  # ==================== CREATE - REAL-TIME VALIDATION SCENARIOS ====================

  @index @validation @realtime
  Scenario: Admin sees real-time validation on Owner Name field
    When the admin clicks the "Add App" button
    And the admin enters "fghj23456" in the "Owner Name (Namespace)" field
    And the admin moves focus away from the field
    Then the field should show a validation error indicator
    And an inline error message should appear below the field stating "Please enter a valid owner name"

  @index @validation @realtime
  Scenario: Admin sees real-time validation on App Name field
    When the admin clicks the "Add App" button
    And the admin enters special characters "!@#$%" in the "App Name" field
    And the admin moves focus away from the field
    Then the field should show a validation error indicator
    And an inline error message should appear stating "Please enter a valid application name"

  @index @validation @realtime
  Scenario: Admin sees validation error clear when entering valid data
    When the admin clicks the "Add App" button
    And the admin enters "12345" in the "Owner Name (Namespace)" field
    And the admin moves focus away from the field
    And a validation error is displayed
    When the admin clears the field and enters "valid-namespace"
    Then the validation error should disappear
    And the field should show a success indicator

  # ==================== ACTIONS MENU SCENARIOS ====================

  @index @actions @positive
  Scenario: Admin views available actions for an index entry
    Given an index "Authentication Service" exists in the Index List
    When the admin clicks the "..." (three dots) actions button for "Authentication Service"
    Then a dropdown menu should appear with the following options:
      | Action Option |
      | Edit          |
      | Users         |
      | Delete        |

  @index @actions @positive
  Scenario: Admin closes actions menu by clicking the button again
    Given an index "Payment Gateway" exists in the Index List
    When the admin clicks the "..." actions button for "Payment Gateway"
    And the actions dropdown menu is displayed
    And the admin clicks the "..." actions button again
    Then the dropdown menu should close

  # ==================== EDIT APPLICATION SCENARIOS ====================

  @index @edit @positive
  Scenario: Admin successfully opens edit application form
    Given an index "Authentication Service" exists in the Index List
    When the admin clicks the "..." actions button for "Authentication Service"
    And the admin selects "Edit" from the dropdown menu
    Then the "Edit Application" modal should be displayed
    And the modal title should show "Edit Application"
    And the form should be pre-populated with the following current values:
      | Field         | Current Value           |
      | Owner Name    | security                |
      | App Name      | Authentication Service  |
      | POD Name      | auth-pod-01            |
      | Splunk Index  | auth-prod              |
      | Token         | splunk-auth-123        |
    And all fields should be editable

  @index @edit @positive
  Scenario: Admin successfully edits Owner Name field
    Given the admin has opened the edit form for "Authentication Service"
    When the admin clears the "Owner Name" field
    And the admin enters "security-prod" in the "Owner Name" field
    And the admin clicks the "Submit" button
    Then the modal should close
    And the system should display a success notification
    And the index list should refresh
    And the "Authentication Service" entry should show "security-prod" as Owner Name

  @index @edit @positive
  Scenario: Admin successfully edits App Name field
    Given the admin has opened the edit form for "Payment Gateway"
    When the admin changes the "App Name" to "Payment Gateway V2"
    And the admin clicks the "Submit" button
    Then the modal should close
    And the changes should be saved successfully
    And the updated App Name should be reflected in the index list

  @index @edit @positive
  Scenario: Admin successfully edits POD Name field
    Given the admin has opened the edit form for "Authentication Service"
    When the admin changes the "POD Name" to "auth-pod-02"
    And the admin clicks the "Submit" button
    Then the modal should close
    And the changes should be saved successfully
    And the updated POD Name should be reflected in the index list

  @index @edit @positive
  Scenario: Admin successfully edits Splunk Index field
    Given the admin has opened the edit form for "Authentication Service"
    When the admin changes the "Splunk Index" to "auth-prod-v2"
    And the admin clicks the "Submit" button
    Then the modal should close
    And the system should display "Application updated successfully" notification
    And the index list should show the updated Splunk Index value

  @index @edit @positive
  Scenario: Admin successfully edits Token field
    Given the admin has opened the edit form for "Payment Gateway"
    When the admin updates the "Token" field to "xxxx-yyyy-zzzz-aaaa"
    And the admin clicks the "Submit" button
    Then  the 
    Then the token should be updated successfully
  

  @index @edit @positive
  Scenario: Admin edits multiple fields simultaneously
    Given the admin has opened the edit form for "Authentication Service"
    When the admin updates the following fields:
      | Field         | New Value           |
      | Owner Name    | security-updated    |
      | POD Name      | auth-pod-03        |
      | Splunk Index  | auth-prod-latest   |
    And the admin clicks the "Submit" button
    Then all changes should be saved successfully
    And the index list should reflect all updated values

  @index @edit @positive
  Scenario: Admin edits only one field and leaves others unchanged
    Given the admin has opened the edit form for "Payment Gateway"
    When the admin changes only the "Splunk Index" to "payment-prod-new"
    And the admin clicks the "Submit" button
    Then only the Splunk Index should be updated
    And all other fields should remain unchanged

  # ==================== EDIT - VALIDATION ERROR SCENARIOS ====================

  @index @edit @negative
  Scenario: Admin attempts to save edit form with empty Owner Name
    Given the admin has opened the edit form for "Authentication Service"
    When the admin clears the "Owner Name" field completely
    And the admin clicks the "Submit" button
    Then the system should display "Owner Name is required" notification
    And the form should not be submitted
    And the modal should remain open

  @index @edit @negative
  Scenario: Admin attempts to save edit form with invalid Owner Name format
    Given the admin has opened the edit form for "Payment Gateway"
    When the admin enters "invalid@#$%" in the "Owner Name" field
    And the admin clicks the "Submit" button
    Then the system should display "Please enter a valid owner name" notification
    And the changes should not be saved

  @index @edit @negative
  Scenario: Admin attempts to save edit form with empty App Name
    Given the admin has opened the edit form for "Authentication Service"
    When the admin clears the "App Name" field
    And the admin clicks the "Submit" button
    Then the system should display "App Name is required" notification
    And the form should not be submitted

  @index @edit @negative
  Scenario: Admin attempts to save with invalid token format
    Given the admin has opened the edit form for "Authentication Service"
    When the admin enters "invalidtoken123" in the "Token" field
    And the admin clicks the "Submit" button
    Then the system should display "Please enter a valid token format" notification
    And the form should not be submitted

  @index @edit @negative
  Scenario: Admin attempts to save with special characters in POD Name
    Given the admin has opened the edit form for "Payment Gateway"
    When the admin enters "pod@#$name" in the "POD Name" field
    And the admin clicks the "Submit" button
    Then the system should display "Please enter a valid POD name" notification
    And the form should not be submitted

  @index @edit @negative
  Scenario: Admin attempts to save with empty spaces only
    Given the admin has opened the edit form for "Authentication Service"
    When the admin enters "     " in the "Owner Name" field
    And the admin clicks the "Submit" button
    Then the system should display "Owner Name cannot be empty" notification
    And the form should not be submitted

  # ==================== EDIT - CANCEL SCENARIOS ====================

  @index @edit @negative
  Scenario: Admin cancels editing without saving changes
    Given the admin has opened the edit form for "Authentication Service"
    When the admin modifies the "Owner Name" to "new-owner"
    And the admin clicks the "Cancel" button
    Then the modal should close
    And no changes should be saved
    And the index list should show the original "security" as Owner Name

  @index @edit @positive @close
  Scenario: Admin closes edit modal using X button
    Given the admin has opened the edit form for "Authentication Service"
    When the admin makes some changes to the fields
    And the admin clicks the "X" close button on the modal
    Then the modal should close
    And no changes should be saved
    And the user should return to the Index List page

  @index @edit @negative
  Scenario: Admin closes edit modal without saving after making changes
    Given the admin has opened the edit form for "Payment Gateway"
    When the admin updates multiple fields with new values
    And the admin clicks the "Cancel" button
    Then a confirmation dialog may appear asking "Discard unsaved changes?"
    When the admin confirms discarding changes
    Then the modal should close
    And no changes should be applied

  # ==================== INDEX OVERVIEW/DETAILS PAGE SCENARIOS ====================

  @index @overview @navigation @positive
  Scenario: Admin navigates to index overview page by clicking index name
    Given the admin is on the Index List page
    And an index "Authentication Service" exists with Splunk Index "auth-prod"
    When the admin clicks on the index name "Authentication Service"
    Then the admin should be redirected to the overview page
    And the URL should change to "localhost:3000/index-list/1"
    And the page title should display "Overview / auth-prod"
    And the page subtitle should display "Real-time ingestion and filtering rules."

  @index @overview @positive
  Scenario: Admin views index overview metrics
    Given the admin is on the overview page for "auth-prod"
    Then the admin should see the following metric cards:
      | Metric                    |
      | Logs Ingested             |
      | Logs After Reduction      |
      | Logs Saved                |
      | Estimated Cost Saved      |
    And each metric should display a numeric value
    And each metric should show a percentage change indicator

  # ==================== OVERVIEW - CHARTS SCENARIOS ====================

  @index @overview @chart @positive
  Scenario: Admin views log severity distribution chart
    Given the admin is on the overview page for "auth-prod"
    When the admin scrolls to view the charts section
    Then the admin should see a "Log Severity Distribution after Reduction" donut chart
    And the chart should display the following severity levels:
      | Severity | Count   |
      | Debug    | 0       |
      | Info     | 88,813  |
      | Warn     | 3,896   |
      | Error    | 1,491   |
      | Fatal    | 0       |

  @index @overview @chart @positive
  Scenario: Admin views input vs output logs trend chart
    Given the admin is on the overview page for "auth-prod"
    Then the admin should see an "Input Logs vs Output Logs Trend" bar chart
    And the chart should display data for time intervals: 12am, 4am, 8am, 12pm, 4pm
    And the chart should show two series:
      | Series |
      | Input  |
      | Output |

  @index @overview @chart @positive
  Scenario: Admin views chart legend
    Given the admin is on the overview page for "auth-prod"
    When the admin views the "Log Severity Distribution after Reduction" chart
    Then the chart legend should display all severity levels with their respective colors
    And clicking on a legend item should toggle that severity level's visibility

  # ==================== OVERVIEW - USERS BUTTON SCENARIOS ====================

  @index @overview @users @positive
  Scenario: Admin navigates to users section from overview page
    Given the admin is on the overview page for "auth-prod"
    When the admin clicks the "Users" button in the top right corner
    Then the admin should be redirected to the users management page for this index

  # ==================== LOG REDUCTION CONFIGURATION SCENARIOS ====================

  @index @configuration @view @positive
  Scenario: Admin views log reduction configuration section
    Given the admin is on the overview page for "auth-prod"
    When the admin scrolls down to the "Log Reduction Configuration" section
    Then the section title should display "Log Reduction Configuration"
    And the section subtitle should display "Active policy rules by severity level"
    And the admin should see an "Edit" button
    And the admin should see a configuration table with columns:
      | Column       |
      | Severity     |
      | Filtering    |
      | Aggregation  |
      |Deduplication |

  @index @configuration @view @positive
  Scenario: Admin views current configuration settings
    Given the admin is on the Log Reduction Configuration section
    Then the admin should see the following severity levels with their settings:
      | Severity | Filtering | Aggregation | Deduplication |
      | Debug    | Off       | On          |  On           |
      | Info     | Off       | On          |  On           |
      | Warn     | On        | Off         |  Off          |
      | Error    | Off       | Off         |  Off         |
      | Fatal    | Off       | Off         |   Off      |

  # ==================== CONFIGURATION - EDIT MODAL SCENARIOS ====================

  @index @configuration @edit @positive
  Scenario: Admin opens edit configuration modal
    Given the admin is on the Log Reduction Configuration section
    When the admin clicks the "Edit" button
    Then the "Edit Configuration" modal should be displayed
    And the modal should show tabs: "Severity", "Filtering", "Aggregation", "Deduplication"
    And the configuration settings should be displayed as toggles
    And the admin should see a "Submit Update" button at the bottom
    And the admin should see a "Cancel" button at the bottom

  @index @configuration @edit @positive
  Scenario: Admin views configuration toggles in edit modal
    Given the admin has opened the Edit Configuration modal
    Then the admin should see the following severity levels with toggle switches:
      | Severity | Filtering | Aggregation | Deduplication |
      | Debug    | Off       | On          | Off           |
      | Info     | Off       | On          | On            |
      | Warn     | On        | Off         | Off           |
      | Error    | Off       | Off         | Off           |
      | Fatal    | Off       | Off         | Off           |

  @index @configuration @edit @positive
  Scenario: Admin successfully enables filtering for Debug level
    Given the admin has opened the Edit Configuration modal
    When the admin toggles "Filtering" to "On" for "Debug" severity
    And the admin clicks the "Submit Update" button
    Then the modal should close
    And the system should display "Configuration updated successfully" notification
    And the configuration table should show "Filtering" as "On" for Debug level

  @index @configuration @edit @positive
  Scenario: Admin successfully enables aggregation for Warn level
    Given the admin has opened the Edit Configuration modal
    When the admin toggles "Aggregation" to "On" for "Warn" severity
    And the admin clicks the "Submit Update" button
    Then the changes should be saved successfully
    And the updated configuration should be reflected in the table

  @index @configuration @edit @positive
  Scenario: Admin successfully disables deduplication for Info level
    Given the admin has opened the Edit Configuration modal
    And the "Info" severity currently has "Deduplication" set to "On"
    When the admin toggles "Deduplication" to "Off" for "Info" severity
    And the admin clicks the "Submit Update" button
    Then the configuration should be updated
    And the system should display a success notification
    And the Info row should show Deduplication as "Off"

  @index @configuration @edit @positive
  Scenario: Admin successfully disables aggregation for Debug level
    Given the admin has opened the Edit Configuration modal
    And the "Debug" severity currently has "Aggregation" set to "On"
    When the admin toggles "Aggregation" to "Off" for "Debug" severity
    And the admin clicks the "Submit Update" button
    Then the configuration should be updated
    And the Debug row should show Aggregation as "Off"

  @index @configuration @edit @positive
  Scenario: Admin modifies multiple severity configurations
    Given the admin has opened the Edit Configuration modal
    When the admin makes the following changes:
      | Severity | Setting       | New State |
      | Debug    | Aggregation   | Off       |
      | Info     | Deduplication | Off       |
      | Warn     | Filtering     | Off       |
      | Error    | Filtering     | On        |
    And the admin clicks the "Submit Update" button
    Then all changes should be saved successfully
    And the configuration table should reflect all updated settings

  @index @configuration @edit @positive
  Scenario: Admin enables filtering for all severity levels
    Given the admin has opened the Edit Configuration modal
    When the admin toggles "Filtering" to "On" for all severity levels:
      | Severity |
      | Debug    |
      | Info     |
      | Warn     |
      | Error    |
      | Fatal    |
    And the admin clicks the "Submit Update" button
    Then the system should display "Configuration updated successfully" notification
    And all severity levels should show "Filtering" as "On" in the configuration table

  @index @configuration @edit @positive
  Scenario: Admin disables all configurations for a severity level
    Given the admin has opened the Edit Configuration modal
    And "Info" severity has multiple settings enabled
    When the admin toggles all settings to "Off" for "Info" severity:
      | Setting       |
      | Filtering     |
      | Aggregation   |
      | Deduplication |
    And the admin clicks the "Submit Update" button
    Then all settings for "Info" should be disabled
    And the changes should be saved successfully

  @index @configuration @edit @positive
  Scenario: Admin enables all configurations for Error level
    Given the admin has opened the Edit Configuration modal
    When the admin toggles all settings to "On" for "Error" severity:
      | Setting       |
      | Filtering     |
      | Aggregation   |
      | Deduplication |
    And the admin clicks the "Submit Update" button
    Then all settings for "Error" should be enabled
    And the changes should be saved successfully

  # ==================== CONFIGURATION - CANCEL SCENARIOS ====================

  @index @configuration @edit @negative
  Scenario: Admin cancels configuration changes
    Given the admin has opened the Edit Configuration modal
    When the admin toggles "Filtering" to "On" for "Debug" severity
    And the admin toggles "Aggregation" to "On" for "Error" severity
    And the admin clicks the "Cancel" button
    Then the modal should close
    And no changes should be saved
    And the configuration table should show the original settings

  @index @configuration @edit @negative
  Scenario: Admin closes configuration modal using X button
    Given the admin has opened the Edit Configuration modal
    When the admin makes several configuration changes
    And the admin clicks the "X" close button on the modal
    Then the modal should close
    And no changes should be saved
    And the configuration should remain unchanged

  # ==================== USERS ACTION SCENARIOS ====================

  @index @users @positive
  Scenario: Admin accesses users management from actions menu
    Given an index "Authentication Service" exists in the Index List
    When the admin clicks the "..." actions button for "Authentication Service"
    And the admin selects "Users" from the dropdown menu
    Then the admin should be redirected to the users management page for this index
    And the page should display users associated with "Authentication Service"

  # ==================== DELETE ACTION SCENARIOS ====================

  @index @delete @positive
  Scenario: Admin successfully deletes an index from actions menu
    Given an index "Test Application" exists in the Index List
    When the admin clicks the "..." actions button for "Test Application"
    And the admin selects "Delete" from the dropdown menu
    Then a confirmation dialog should appear
    And the dialog should display "Are you sure you want to delete this application?"
    When the admin clicks "Confirm" on the dialog
    Then the system should display "Application deleted successfully" notification
    And the index "Test Application" should be removed from the Index List

  @index @delete @negative
  Scenario: Admin cancels deletion from actions menu
    Given an index "Payment Gateway" exists in the Index List
    When the admin clicks the "..." actions button for "Payment Gateway"
    And the admin selects "Delete" from the dropdown menu
    And a confirmation dialog appears
    And the admin clicks "Cancel" on the dialog
    Then the dialog should close
    And the index "Payment Gateway" should remain in the Index List
    And no deletion should occur

  @index @delete @positive
  Scenario: Admin closes delete confirmation dialog using X button
    Given an index "Authentication Service" exists in the Index List
    When the admin clicks the "..." actions button for "Authentication Service"
    And the admin selects "Delete" from the dropdown menu
    And a confirmation dialog appears
    And the admin clicks the "X" button on the dialog
    Then the dialog should close
    And the index should remain in the list

  @index @delete @negative
  Scenario: Admin attempts to delete a critical system index
    Given a critical index "System Logs" exists in the Index List
    When the admin clicks the "..." actions button for "System Logs"
    And the admin selects "Delete" from the dropdown menu
    Then a warning dialog should appear
    And the dialog should display "This is a critical system index. Deletion is restricted."
    And the "Confirm" button should be disabled

 