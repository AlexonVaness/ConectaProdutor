document.addEventListener("DOMContentLoaded", async () => {
  const stripe = Stripe("pk_test_51PJjaWLUbG3JGlIpADGzzzjUwLTPAOvS2OipJRN7mXkHcmqOqlQPKCeUdjVIjZzZcHx9yvlQ8fRYYW1Y8lBHOIhm00rP2whdzV");

  const urlParams = new URLSearchParams(window.location.search);
  const items = JSON.parse(decodeURIComponent(urlParams.get('items')));
  const producerName = decodeURIComponent(urlParams.get('producerName'));

  const { clientSecret } = await fetch("https://api-conecta-produtor.web.app/create-payment-intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ items, producerName })
  }).then(r => r.json());

  const elements = stripe.elements();
  const paymentElement = elements.create("card");
  paymentElement.mount("#payment-element");

  const form = document.getElementById("payment-form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: paymentElement,
      }
    });

    if (error) {
      console.error("Payment failed:", error);
    } else {
      console.log("Payment successful!");
      document.getElementById("payment-message").classList.remove("hidden");
      document.getElementById("payment-message").textContent = "Payment successful!";
    }
  });

  // Display purchase details
  const itemsList = document.getElementById("items-list");
  let totalAmount = 0;

  items.forEach(item => {
    const itemElement = document.createElement("div");
    itemElement.textContent = `${item.quantity} x ${item.title} - ${item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
    itemsList.appendChild(itemElement);
    totalAmount += item.price * item.quantity;
  });

  document.getElementById("total-amount").textContent = totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
});
