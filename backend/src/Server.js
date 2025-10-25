import express from 'express';
import cors from 'cors';
import getSystemStatus from './checks.js';


const port = 9200;

const app = express();

const allowedOrigins = [
  "http://localhost:9100",
  "http://penguinore.net:9100",
  "http://status.penguinore.net:9100"
];

// We are sending this back in all responses saying it's allowed to be used by our client
// If we didn't provide this, the browser would see the origins were different ports and immediately reject it
// This is like our stamp of approval in the response: "Hey Browser, we allow things to be sent back to port X."
app.use(
  cors({
    origin: allowedOrigins
  })
);

// Does the parsing for the req.body
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

app.get('/status', async (req, res) => {
    const status = await getSystemStatus();
	console.log("Status retrieved");
    res.json(status);
});

app.listen(port, () => {
	console.log(`Status-Server is now running on ${port}`);
});
