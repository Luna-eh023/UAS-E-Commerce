"use client";

import { useState } from "react";

export default function ProductImage({
  src,
  alt,
  className = "",
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`sh-img-fallback ${className}`} role="img" aria-label={alt}>
        {alt.charAt(0)}
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src={src} alt={alt} onError={() => setFailed(true)} />;
}
