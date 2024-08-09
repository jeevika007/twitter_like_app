require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(helmet());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const plans = {
  free: { price: 0, tweets: 1 },
  bronze: { price: 100, tweets: 3 },
  silver: { price: 300, tweets: 5 },
  gold: { price: 1000, tweets: 'unlimited' },
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
async function run() {
    try {
        await client.connect();
        const postCollection = client.db("database").collection("posts");
        const userCollection = client.db("database").collection("users");

        app.get('/user', async (req, res) => {
            try {
                const user = await userCollection.find().toArray();
                res.send(user);
            } catch (error) {
                res.status(500).send('Error fetching users');
            }
        });

        app.get('/loggedInUser', async (req, res) => {
            try {
                const email = req.query.email;
                const user = await userCollection.find({ email }).toArray();
                res.send(user);
            } catch (error) {
                res.status(500).send('Error fetching logged in user');
            }
        });

        app.get('/post', async (req, res) => {
            try {
                const post = (await postCollection.find().toArray()).reverse();
                res.send(post);
            } catch (error) {
                res.status(500).send('Error fetching posts');
            }
        });

        app.get('/userPost', async (req, res) => {
            try {
                const email = req.query.email;
                const post = (await postCollection.find({ email }).toArray()).reverse();
                res.send(post);
            } catch (error) {
                res.status(500).send('Error fetching user posts');
            }
        });

        app.post('/register', async (req, res) => {
            try {
                const user = req.body;
                const result = await userCollection.insertOne(user);
                res.send(result);
            } catch (error) {
                res.status(500).send('Error registering user');
            }
        });

        app.post('/post', async (req, res) => {
            try {
                const post = req.body;
                const result = await postCollection.insertOne(post);
                res.send(result);
            } catch (error) {
                res.status(500).send('Error creating post');
            }
        });

        app.patch('/userUpdates/:email', async (req, res) => {
            try {
                const { email } = req.params;
                const profile = req.body;
                const options = { upsert: true };
                const updateDoc = { $set: profile };
                const result = await userCollection.updateOne({ email }, updateDoc, options);
                res.send(result);
            } catch (error) {
                res.status(500).send('Error updating user');
            }
        });

        // Razorpay Routes
        app.post('/create-order', async (req, res) => {
            const { plan } = req.body;

            // Restricting payment to 10-11 AM IST
            const now = new Date();
            const currentHourIST = (now.getUTCHours() + 5.5) % 24;
            if (currentHourIST < 10 || currentHourIST >= 11) {
                return res.status(403).send('Payments are allowed only between 10-11 AM IST');
            }

            if (!plans[plan]) {
                return res.status(400).send('Invalid plan selected');
            }

            try {
                const order = await razorpay.orders.create({
                    amount: plans[plan].price * 100,
                    currency: 'INR',
                    receipt: `receipt_${Date.now()}`,
                });
                res.json(order);
            } catch (error) {
                res.status(500).send('Error creating order');
            }
        });

        app.post('/verify-payment', async (req, res) => {
            const { paymentId, orderId, signature, plan, email } = req.body;

            try {
                const isValid = razorpay.validateWebhookSignature(
                    `${orderId}|${paymentId}`,
                    signature,
                    process.env.RAZORPAY_WEBHOOK_SECRET
                );

                if (!isValid) {
                    return res.status(400).send('Invalid payment signature');
                }

                // Send email with invoice
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: 'Subscription Successful',
                    text: `You have successfully subscribed to the ${plan} plan. Details: ${JSON.stringify(plans[plan])}`,
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return res.status(500).send('Error sending email');
                    }
                    res.status(200).send('Payment verified and email sent');
                });
            } catch (error) {
                res.status(500).send('Error verifying payment');
            }
        });
    } catch (error) {
        console.log(error);
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello from Twitter Clone!');
});

app.listen(port, () => {
    console.log(`Twitter clone is listening on port ${port}`);
});
app.post('/switch-language', async (req, res) => {
    const { language, user } = req.body;
    let otpSent = false;
  
    if (language === 'fr') {
      // Send OTP to email
      otpSent = await sendOtpToEmail(user.email);
    } else {
      // Send OTP to mobile
      otpSent = await sendOtpToMobile(user.phone);
    }
  
    if (otpSent) {
      // Store language preference and proceed
      res.status(200).send('OTP sent, please verify');
    } else {
      res.status(500).send('Error sending OTP');
    }
  });
  