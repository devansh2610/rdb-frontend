import { 
  changePassword, 
  updateUserName, 
  submitContactForm, 
  submitDeveloperContact,
  verifyPassword,
  deleteAccount
} from '../api/profileService';

// Helper function to log test results
const logTestResult = (testName, success, result = null, error = null) => {
  console.group(`API Test: ${testName}`);
  console.log(`Status: ${success ? 'SUCCESS ✅' : 'FAILED ❌'}`);
  if (result) console.log('Result:', result);
  if (error) console.error('Error:', error);
  console.groupEnd();
};

// Test changePassword API
export const testChangePassword = async (currentPassword, newPassword) => {
  try {
    const result = await changePassword(currentPassword, newPassword);
    logTestResult('Change Password', true, result);
    return { success: true, result };
  } catch (error) {
    logTestResult('Change Password', false, null, error);
    return { success: false, error };
  }
};

// Test verifyPassword API
export const testVerifyPassword = async (password) => {
  try {
    const result = await verifyPassword(password);
    logTestResult('Verify Password', true, result);
    return { success: true, result };
  } catch (error) {
    logTestResult('Verify Password', false, null, error);
    return { success: false, error };
  }
};

// Test deleteAccount API
export const testDeleteAccount = async () => {
  try {
    const result = await deleteAccount();
    logTestResult('Delete Account', true, result);
    return { success: true, result };
  } catch (error) {
    logTestResult('Delete Account', false, null, error);
    return { success: false, error };
  }
};

// Test updateUserName API
export const testUpdateUserName = async (firstName, lastName) => {
  try {
    const result = await updateUserName(firstName, lastName);
    logTestResult('Update User Name', true, result);
    return { success: true, result };
  } catch (error) {
    logTestResult('Update User Name', false, null, error);
    return { success: false, error };
  }
};

// Test submitContactForm API
export const testSubmitContactForm = async (fullname, email, message) => {
  try {
    const result = await submitContactForm(fullname, email, message);
    logTestResult('Submit Contact Form', true, result);
    return { success: true, result };
  } catch (error) {
    logTestResult('Submit Contact Form', false, null, error);
    return { success: false, error };
  }
};

// Test submitDeveloperContact API
export const testSubmitDeveloperContact = async (name, email, organizationName, contactNumber, query) => {
  try {
    const result = await submitDeveloperContact(name, email, organizationName, contactNumber, query);
    logTestResult('Submit Developer Contact', true, result);
    return { success: true, result };
  } catch (error) {
    logTestResult('Submit Developer Contact', false, null, error);
    return { success: false, error };
  }
};

// Execute all tests with test data
export const runAllTests = async () => {
  console.log('Starting API tests...');
  
  await testChangePassword('currentPassword123', 'newPassword456');
  await testVerifyPassword('testPassword123');
  // Skip deleteAccount test by default as it's destructive
  // Uncomment the next line if you want to test it
  // await testDeleteAccount();
  await testUpdateUserName('John', 'Doe');
  await testSubmitContactForm('John Doe', 'john@example.com', 'Test message');
  await testSubmitDeveloperContact('John Doe', 'john@example.com', 'ACME Inc', '1234567890', 'Test query');
  
  console.log('API tests completed.');
};

// For browser console testing
window.apiTests = {
  changePassword: testChangePassword,
  verifyPassword: testVerifyPassword,
  deleteAccount: testDeleteAccount,
  updateUserName: testUpdateUserName,
  submitContactForm: testSubmitContactForm,
  submitDeveloperContact: testSubmitDeveloperContact,
  runAllTests
}; 