import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, Ref } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva("inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50", {
  variants: {
    variant: {
      primary: "bg-primary text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:bg-primary/90",
      default: "bg-primary text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:bg-primary/90",
      accent: "bg-accent text-accent-foreground shadow-sm hover:-translate-y-0.5 hover:bg-accent/85",
      outline: "border border-border bg-background text-foreground hover:border-primary/30 hover:text-primary",
      secondary: "bg-muted text-foreground hover:bg-muted/80",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      link: "text-primary underline-offset-4 hover:underline",
      ghost: "text-foreground/75 hover:bg-muted hover:text-primary",
    },
    size: {
      default: "h-11 px-5 text-sm",
      sm: "h-9 px-4 text-sm",
      lg: "h-12 px-7 text-base",
      icon: "size-10",
    },
  },
  defaultVariants: { variant: "primary", size: "default" },
});

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean; ref?: Ref<HTMLButtonElement> };

export function Button({ asChild, className, variant, size, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
