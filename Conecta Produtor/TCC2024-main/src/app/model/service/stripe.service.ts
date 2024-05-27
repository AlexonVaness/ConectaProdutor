import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  stripePromise: Promise<Stripe | null>;

  constructor() {
    this.stripePromise = loadStripe('pk_test_51PJjaWLUbG3JGlIpADGzzzjUwLTPAOvS2OipJRN7mXkHcmqOqlQPKCeUdjVIjZzZcHx9yvlQ8fRYYW1Y8lBHOIhm00rP2whdzV');
  }

  async getStripe(): Promise<Stripe | null> {
    return this.stripePromise;
  }
}
