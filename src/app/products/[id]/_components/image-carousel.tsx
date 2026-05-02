"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  images: string[];
  alt: string;
}

export function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center w-full aspect-square rounded-xl bg-muted text-muted-foreground text-sm">
        No image
      </div>
    );
  }

  const prev = () => setSelected((i) => (i - 1 + images.length) % images.length);
  const next = () => setSelected((i) => (i + 1) % images.length);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative group aspect-square w-full overflow-hidden rounded-xl bg-muted">
        <Image
          src={images[selected]}
          alt={`${alt} — image ${selected + 1}`}
          fill
          className="object-contain"
          sizes="(min-width: 1024px) 40vw, 90vw"
          priority={selected === 0}
        />
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon-sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80"
              onClick={prev}
              aria-label="Previous image"
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80"
              onClick={next}
              aria-label="Next image"
            >
              <ChevronRightIcon />
            </Button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={cn(
                "relative size-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                i === selected ? "border-primary" : "border-transparent"
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${alt} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="56px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
