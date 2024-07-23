const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');

const app = express();
const port = 3000;

const APP_SECRET = 'YOUR_APP_SECRET'; // Replace with your app secret

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/deletion-callback', (req, res) => {
    const signedRequest = req.body.signed_request;

    if (!signedRequest) {
        return res.status(400).send('Invalid signed request');
    }

    const userId = verifySignedRequest(signedRequest, APP_SECRET);

    if (!userId) {
        return res.status(400).send('Invalid signed request');
    }

    // Process the deletion request (e.g., remove user data from database)
    // Generate a confirmation number
    const confirmationNumber = crypto.randomUUID();

    // Generate a status link
    const statusLink = `https://yourapp.com/deletion-status?confirmation=${confirmationNumber}`;

    // Return the status link and confirmation number
    res.json({ confirmation_number: confirmationNumber, status_link: statusLink });
});

function verifySignedRequest(signedRequest, appSecret) {
    const [encodedSignature, encodedPayload] = signedRequest.split('.');
    
    if (!encodedSignature || !encodedPayload) {
        return null;
    }

    const signature = base64UrlDecode(encodedSignature);
    const payload = base64UrlDecode(encodedPayload);
    const expectedSignature = crypto.createHmac('sha256', appSecret).update(encodedPayload).digest();

    if (!crypto.timingSafeEqual(Buffer.from(signature), expectedSignature)) {
        return null;
    }

    const data = JSON.parse(payload);

    return data.user_id;
}

function base64UrlDecode(str) {
    return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
}

// Serve the status page
app.get('/deletion-status', (req, res) => {
    res.sendFile(path.join(__dirname, 'status.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
