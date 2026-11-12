"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  fallbackSrc?: string;
}

export default function SafeImage({
  src,
  alt = "Image",
  fallbackSrc = "/phoenix-logo.png",
  className,
  unoptimized,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);

  const isDataOrBlob = typeof imgSrc === "string" && (imgSrc.startsWith("data:") || imgSrc.startsWith("blob:"));
  const shouldBeUnoptimized = unoptimized ?? isDataOrBlob;

  return (
    <Image
      src={imgSrc || fallbackSrc}
      alt={alt}
      className={className}
      unoptimized={shouldBeUnoptimized}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
      {...props}
    />
  );
}
