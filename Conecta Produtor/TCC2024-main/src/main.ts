import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { loadStripe } from '@stripe/stripe-js';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

const stripePromise = loadStripe(environment.stripePublicKey);
if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
