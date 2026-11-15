import { clsx } from "clsx";

export interface CardProps {
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  bordered?: boolean;
  children: React.ReactNode;
}

const paddingClasses: Record<string, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  className,
  padding = "md",
  bordered = true,
  children,
}: CardProps) {
  return (
    <div
      className={clsx(
        "ig-glass rounded-panel",
        bordered ? "" : "ig-glass--borderless",
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={clsx("mb-4 flex flex-col gap-1", className)}>{children}</div>
  );
}

export interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

export function CardTitle({ className, children }: CardTitleProps) {
  return (
    <h3
      className={clsx("text-lg font-semibold leading-tight text-ig-frost", className)}
    >
      {children}
    </h3>
  );
}

export interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export function CardDescription({ className, children }: CardDescriptionProps) {
  return (
    <p className={clsx("text-sm leading-6 text-ig-muted", className)}>{children}</p>
  );
}

export interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export function CardContent({ className, children }: CardContentProps) {
  return <div className={clsx(className)}>{children}</div>;
}

export interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div className={clsx("mt-6 flex items-center gap-2 border-t border-ig-line pt-4", className)}>
      {children}
    </div>
  );
}
