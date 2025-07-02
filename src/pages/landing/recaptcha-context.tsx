// "use client"

// import Script from "next/script";
// import {
//   createContext,
//   useState,
//   useContext,
// } from "react"

// interface IRecaptcha {
//   ready: Function;
//   render: Function;
//   reset: Function;
//   getResponse: Function;
//   execute: Function;
// }

// declare global {
//   interface Window {
//     grecaptcha?: IRecaptcha;
//   }
// }

// const RecaptchaContext = createContext<((action: string) => Promise<string>) | null>(null);
// export const useRecaptchaContext = () => {
//   const context = useContext(RecaptchaContext)
//   if (context === undefined)
//     throw new Error("useRecaptchaContext must be used under a RecaptchaProvider")
//   return context;
// };

// interface RecaptchaProviderProps {
//   publicKey?: string;
//   children: React.ReactNode;
// }

// export const RecaptchaProvider = ({ publicKey, children }: RecaptchaProviderProps) => {
//   if (!publicKey) {
//     throw new Error("RecaptchaProvider missing public key");
//   }

//   const [execute, setExecute] = useState<((action: string) => Promise<string>) | null>(null);

//   const onScriptLoad = () => {
//     if (!window.grecaptcha) {
//       throw new Error("Script loaded, but grecaptcha object isn't available on window")
//     }

//     window.grecaptcha.ready(() => {
//       setExecute(() => (action: string) => {
//         return window.grecaptcha!.execute(publicKey, { action });
//       });
//     })
//   }

//   return <RecaptchaContext.Provider value={execute}>
//     <Script src={`https://www.google.com/recaptcha/api.js?render=${publicKey}`} onLoad={onScriptLoad} />
//     {children}
//   </RecaptchaContext.Provider>
// }
