// Importe apenas a função necessária do Firebase
import { initializeApp } from "firebase/app";

// Configuração do ambiente
export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: "AIzaSyA4ou9GiWuOUR6MsJ9q7tndc52WRhmpe84",
  authDomain: "tcc2024-359bc.firebaseapp.com",
  projectId: "tcc2024-359bc",
  storageBucket: "tcc2024-359bc.appspot.com",
  messagingSenderId: "650262169621",
  appId: "1:650262169621:web:1d385a9d1b5d90d423a61c",
  measurementId: "G-F3KNL3Z7J9"
  },

  stripePublicKey: "pk_test_51PJjaWLUbG3JGlIpADGzzzjUwLTPAOvS2OipJRN7mXkHcmqOqlQPKCeUdjVIjZzZcHx9yvlQ8fRYYW1Y8lBHOIhm00rP2whdzV"
};

// Inicialize o Firebase com as configurações fornecidas
const app = initializeApp(environment.firebaseConfig);
