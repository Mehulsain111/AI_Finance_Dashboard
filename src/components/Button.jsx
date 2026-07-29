import { cn } from "@/utils/cn";

export default function Button({
  variant = "default",
  size = "md",
  className,
  ...props
}) {
  const base =
    "btn d-inline-flex align-items-center justify-content-center fw-medium rounded-3";

  const sizes = {
    sm: "btn-sm",
    md: "",
  };

  const variants = {
    default: "btn-outline-secondary",
    primary: "btn-primary",
    ghost: "btn-outline-secondary",
    danger: "btn-danger",
  };

  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}
