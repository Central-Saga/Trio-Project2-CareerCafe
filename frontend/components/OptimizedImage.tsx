import Image, { type ImageProps } from "next/image";
import { useState, type ComponentPropsWithoutRef } from "react";

type OptimizedImageProps = Omit<ImageProps, "src"> & {
  src?: string | null;
  fallbackSrc?: string;
};

const FALLBACK_IMAGE = "/image/logo.png";

export default function OptimizedImage({
  src,
  alt = "",
  width,
  height,
  fill = false,
  fallbackSrc = FALLBACK_IMAGE,
  className,
  style,
  onError,
  ...props
}: OptimizedImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const source = src || fallbackSrc;
  const resolvedSrc = failedSrc === source ? fallbackSrc : source;

  const handleError: ComponentPropsWithoutRef<typeof Image>["onError"] = (
    event,
  ) => {
    if (source !== fallbackSrc && failedSrc !== source) {
      setFailedSrc(source);
      return;
    }

    onError?.(event);
  };

  if (fill) {
    return (
      <Image
        {...props}
        src={resolvedSrc}
        alt={alt}
        fill
        className={className}
        style={style}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={alt}
      width={width ?? 640}
      height={height ?? 480}
      className={className}
      style={style}
      onError={handleError}
    />
  );
}
