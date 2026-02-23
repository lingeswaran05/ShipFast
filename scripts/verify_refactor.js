
import { mockService } from '../src/mock/mockService.js';

async function testRefactor() {
    console.log("Testing Auth...");
    try {
        const user = await mockService.login('customer@shipfast.com', 'customer');
        console.log("Login Success:", user.id === 'u1' && user.role === 'customer' ? 'PASS' : 'FAIL', user);
    } catch (e) {
        console.error("Login Failed:", e.message);
    }

    console.log("\nTesting Shipments...");
    try {
        const shipments = await mockService.getShipments('u1');
        if (shipments.length > 0) {
            const s = shipments[0];
            console.log("Fetch Shipments Success:", 
                s.id.startsWith('TRK') && 
                s.status && 
                s.sender.name && 
                s.cost !== undefined ? 'PASS' : 'FAIL', 
                s
            );
        } else {
            console.log("Fetch Shipments: No shipments found (might be PASS if empty)");
        }
    } catch (e) {
        console.error("Fetch Shipments Failed:", e.message);
    }

    console.log("\nTesting Create Shipment...");
    try {
        const newShipment = await mockService.createShipment({
            userId: 'u1',
            sender: { name: 'Test Sender', phone: '123', address: '123 St', city: 'NY', pincode: '10001' },
            receiver: { name: 'Test Receiver', phone: '456', address: '456 St', city: 'LA', pincode: '90001' },
            weight: 1.5,
            cost: 100,
            type: 'Electronics',
            service: 'Standard',
            paymentMode: 'upi',
            transactionId: 'txn_test_123'
        });
        console.log("Create Shipment Success:", 
            newShipment.id.startsWith('TRK') && 
            newShipment.status === 'Booked' ? 'PASS' : 'FAIL', 
            newShipment
        );
    } catch (e) {
        console.error("Create Shipment Failed:", e.message);
    }
}

testRefactor();
