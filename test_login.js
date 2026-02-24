fetch('http://localhost:8085/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'lee.customer@gmail.com', password: 'ShipFast@123' })
}).then(res => {
  res.text().then(text => {
    console.log("Status:", res.status);
    console.log("Headers:", Array.from(res.headers.entries()));
    console.log("Body:", text);
  });
}).catch(console.error);
