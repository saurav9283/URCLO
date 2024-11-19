const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(idToken) {
    try {
        const ticket = await client.verifyIdToken({
            idToken, 
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        // Extract and return the payload
        return ticket.getPayload();
    } catch (error) {
        console.error("Error verifying Google ID token:", error.message);
        throw new Error("Invalid Google ID token");
    }
}

module.exports = { verifyGoogleToken };
