// 'use client';

// import styles from './ContactForm.module.css';
// import { Button } from '../Button/Button';
// import { SendIcon } from '../icons/SendIcon';
// import { useRecaptchaContext } from '@/providers/recaptcha-context';
// import { SubmitHandler, useForm } from 'react-hook-form';
// import { Input } from './Input';
// import { TextArea } from './TextArea';
// import { useEffect, useState } from 'react';

// const GOOGLE_APPS_SCRIPT_LINK =
//   'https://script.google.com/macros/s/AKfycbwIBuJuogIRNXLOD2x6MwzoGXflnVIrDbvwCyfzJujQUKp9TEGE--79Kp_HVB9Wf7da-w/exec';

// export interface IForm {
//   Name: string;
//   Email: string;
//   Subject: string;
//   Message: string;
// }

// export const ContactForm = () => {
//   const execute = useRecaptchaContext();
//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { isSubmitting },
//   } = useForm<IForm>();
//   const [response, setResponse] = useState('');

//   useEffect(() => {
//     const id = setTimeout(() => setResponse(''), 10_000);
//     return () => clearTimeout(id);
//   }, [response]);

//   const onSubmit: SubmitHandler<IForm> = async (data) => {
//     if (execute === null) {
//       // this should never reach as the submit button should be disabled
//       throw new Error('Captcha is not ready yet');
//     }

//     const token = await execute('submit_form');

//     const form = new FormData();
//     Object.entries(data).forEach(([label, response]) => {
//       form.append(label, response);
//     });
//     form.append('token', token);

//     const res = await fetch(GOOGLE_APPS_SCRIPT_LINK, {
//       body: form,
//       method: 'post',
//     });

//     if (res.status !== 200) {
//       setResponse(res.statusText);
//     } else {
//       setResponse('Your message has been submitted!');
//     }

//     reset();
//   };

//   return (
//     <>
//       {response !== '' && <div className={styles.responseMessage}>{response}</div>}
//       <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
//         <div className={styles.nameEmailGroup}>
//           <Input label="Name" required type="text" register={register} />

//           <Input label="Email" required type="email" register={register} />
//         </div>

//         <Input label="Subject" required type="text" register={register} />

//         <TextArea label="Message" required rows={10} register={register} />

//         <div className={styles.submitButtonWrapper}>
//           <p>
//             This site is protected by reCAPTCHA and the Google{' '}
//             <a href="https://policies.google.com/privacy" target="_blank">
//               Privacy Policy
//             </a>{' '}
//             and{' '}
//             <a href="https://policies.google.com/terms" target="_blank">
//               Terms of Service
//             </a>{' '}
//             apply.
//           </p>
//           <Button type="submit" icon={<SendIcon />} disabled={!execute || isSubmitting}>
//             Send
//           </Button>
//         </div>
//       </form>
//     </>
//   );
// };
