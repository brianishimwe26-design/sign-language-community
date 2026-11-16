import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PasswordInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return <div className="relative">
    <input {...props} type={visible ? 'text' : 'password'} className={cn(className, 'pr-12')} />
    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2" aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} title={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible((value) => !value)}>
      {visible ? <EyeOff /> : <Eye />}
    </Button>
  </div>;
}