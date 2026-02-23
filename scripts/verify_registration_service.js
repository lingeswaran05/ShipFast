
import { mockService } from '../src/mock/mockService.js';

async function verifyService() {
  console.log('Verifying mockService registration...');
  const testEmail = `service_test${Date.now()}@test.com`;
  
  try {
     const user = await mockService.register({
         name: 'Service Test',
         email: testEmail,
         password: 'pass',
         phone: '555-5555'
     });
     
     console.log('Registered User:', user);
     
     if (user.role === 'customer') {
         console.log('SUCCESS: mockService added role "customer".');
     } else {
         console.error('FAILURE: Role missing in mockService response.');
     }
     
  } catch (error) {
      console.error('Test Failed:', error.message);
  }
}

verifyService();
