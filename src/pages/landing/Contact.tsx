import React from 'react';
import { Section } from './Section/Section';
import { ContactForm } from './ContactForm/ContactForm';
import { RecaptchaProvider } from './ContactForm/recaptcha-context';

function Contact() {
  return (
    <RecaptchaProvider publicKey="6LcMQR4lAAAAAB5Ilnu7XYiXyb3uY7mHh44fhBk0">
      <Section title="Contact" index={6}>
        <ContactForm />
      </Section>
    </RecaptchaProvider>
  );
}

export default Contact;
