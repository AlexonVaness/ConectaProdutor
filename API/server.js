const stripe = require('stripe')('sk_test_51PJjaWLUbG3JGlIp3dGhG7YKejQU4pJ0HLVKGBGFyU4dMkafZNHBXlQrXbXtO0oXcqU5iyz83euheUfkT3WBmhmH00MvurRYDi');
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const YOUR_DOMAIN = 'http://localhost:4242';

app.post('/create-checkout-session', async (req, res) => {
  const { items } = req.body;

  const line_items = items.map(item => ({
    price_data: {
      currency: 'brl',
      product_data: {
        name: item.title,
      },
      unit_amount: item.price * 100, // Price in cents
    },
    quantity: item.quantity,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/success.html`,
      cancel_url: `${YOUR_DOMAIN}/cancel.html`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).send(`Failed to create session: ${error.message}`);
  }
});

app.get('/success.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

app.get('/cancel.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cancel.html'));
});

app.listen(4242, () => console.log('Running on port 4242'));
