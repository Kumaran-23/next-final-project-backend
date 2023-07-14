import express from 'express';
import stripe from 'stripe';

const router = express.Router();
const stripeSecretKey = process.env.STRIPE_PRIVATE_KEY;
const stripePayment = stripe(stripeSecretKey);

router.post('/', async (req, res) => {
  try {
    const { unit_amount: bookingPrice } = req.body; // Access the unit_amount from the request body
    const session = await stripePayment.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'MYR',
            product_data: {
              name: 'Provider Services',
            },
            unit_amount: bookingPrice,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173',
    });

    res.json({ sessionUrl: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});



export default router