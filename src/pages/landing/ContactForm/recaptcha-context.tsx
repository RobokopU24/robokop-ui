'use client';

import { createContext, useState, useContext, useEffect } from 'react';

interface IRecaptcha {
  enterprise: {
    ready: Function;
    render: Function;
    reset: Function;
    getResponse: Function;
    execute: Function;
  };
}

declare global {
  interface Window {
    grecaptcha?: IRecaptcha;
  }
}

const RecaptchaContext = createContext<((action: string) => Promise<string>) | null>(null);
export const useRecaptchaContext = () => {
  const context = useContext(RecaptchaContext);
  if (context === undefined)
    throw new Error('useRecaptchaContext must be used under a RecaptchaProvider');
  return context;
};

interface RecaptchaProviderProps {
  publicKey?: string;
  children: React.ReactNode;
}

export const RecaptchaProvider = ({ publicKey, children }: RecaptchaProviderProps) => {
  useEffect(() => {
    const script = document.createElement('script');

    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${publicKey}`;
    script.async = true;
    script.onload = onScriptLoad;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  if (!publicKey) {
    throw new Error('RecaptchaProvider missing public key');
  }

  const [execute, setExecute] = useState<((action: string) => Promise<string>) | null>(null);

  const onScriptLoad = () => {
    if (!window.grecaptcha) {
      throw new Error("Script loaded, but grecaptcha object isn't available on window");
    }

    window.grecaptcha.enterprise.ready(() => {
      setExecute(() => (action: string) => {
        return window.grecaptcha!.enterprise.execute(publicKey, { action });
      });
    });
  };

  return <RecaptchaContext.Provider value={execute}>{children}</RecaptchaContext.Provider>;
};
