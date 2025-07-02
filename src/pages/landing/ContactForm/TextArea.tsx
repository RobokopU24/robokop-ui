import { toKebabCase } from '@/utils/toKebabCase';
import styles from './ContactForm.module.css';
import type { Path, UseFormRegister, Validate } from 'react-hook-form';
import type { IForm } from './ContactForm';

interface TextAreaProps {
  label: Path<IForm>;
  register: UseFormRegister<IForm>;
  required?: boolean;
  validate?: Validate<string, IForm> | Record<string, Validate<string, IForm>>;
  rows?: number;
}

export const TextArea = ({ label, register, required, validate, rows }: TextAreaProps) => {
  return (
    <div className={styles.inputGroup}>
      <label htmlFor={toKebabCase(label)}>{label}</label>
      <textarea
        {...register(label, { validate, required })}
        name={label}
        id={toKebabCase(label)}
        rows={rows}
        required={required}
      ></textarea>
    </div>
  );
};
