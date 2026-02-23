
import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function verify() {
  console.log('Starting verification...');

  try {
    // 1. Get Users
    console.log('1. Fetching users...');
    const usersRes = await axios.get(`${API_URL}/users`);
    console.log(`   Found ${usersRes.data.length} users.`);

    // 2. Create Shipment
    console.log('2. Creating shipment...');
    const newShipment = {
      trackingId: `TEST-${Date.now()}`,
      status: 'BOOKED',
      sender: { name: 'Test Sender' },
      receiver: { name: 'Test Receiver' }
    };
    const createRes = await axios.post(`${API_URL}/shipments`, newShipment);
    console.log('   Shipment created:', createRes.data);
    const shipmentId = createRes.data.id;

    // 3. Verify Persistence
    console.log('3. Verifying persistence...');
    const verifyRes = await axios.get(`${API_URL}/shipments/${shipmentId}`);
    if (verifyRes.data.trackingId === newShipment.trackingId) {
        console.log('   SUCCESS: Shipment persisted.');
    } else {
        console.error('   FAILURE: Shipment not found or mismatched.');
    }

    // 4. Update Status
    console.log('4. Updating status...');
    await axios.patch(`${API_URL}/shipments/${shipmentId}`, { status: 'IN_TRANSIT' });
    const updateRes = await axios.get(`${API_URL}/shipments/${shipmentId}`);
    if (updateRes.data.status === 'IN_TRANSIT') {
        console.log('   SUCCESS: Status updated.');
    } else {
        console.error('   FAILURE: Status update failed.');
    }

  } catch (error) {
    console.error('Verification failed:', error.message);
    if (error.response) {
        console.error('Response data:', error.response.data);
    }
  }
}

verify();
