import { loadStripe } from '@stripe/stripe-js';
import { environment } from 'src/environments/environment';

const stripePromise = loadStripe(environment.stripePublicKey);
