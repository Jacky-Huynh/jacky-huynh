import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { GalleryImage } from "../../types/gallery";
import "./Gallery.css";

interface GalleryProps {
  images: GalleryImage[];
}

export default function Gallery({ images }: GalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // The entire gallery now becomes fullscreen
  const galleryRef = useRef<HTMLDivElement>(null);

  const thumbnailStripRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const currentImage = images[currentIndex];

  const centerActiveThumbnail = useCallback(() => {
    const strip = thumbnailStripRef.current;
    const thumbnail = thumbnailRefs.current[currentIndex];

    if (!strip || !thumbnail) return;

    const stripWidth = strip.clientWidth;
    const thumbnailCenter =
      thumbnail.offsetLeft + thumbnail.offsetWidth / 2;

    strip.scrollTo({
      left: thumbnailCenter - stripWidth / 2,
      behavior: "smooth",
    });
  }, [currentIndex]);

  const toggleFullscreen = useCallback(async () => {
    if (!galleryRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await galleryRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (
        index === currentIndex ||
        index < 0 ||
        index >= images.length ||
        isTransitioning
      ) {
        return;
      }

      setIsTransitioning(true);

      window.setTimeout(() => {
        setCurrentIndex(index);
        setIsTransitioning(false);
      }, 180);
    },
    [currentIndex, images.length, isTransitioning]
  );

  const next = useCallback(() => {
    goTo(
      currentIndex === images.length - 1
        ? 0
        : currentIndex + 1
    );
  }, [currentIndex, images.length, goTo]);

  const previous = useCallback(() => {
    goTo(
      currentIndex === 0
        ? images.length - 1
        : currentIndex - 1
    );
  }, [currentIndex, images.length, goTo]);

  useEffect(() => {
    centerActiveThumbnail();
  }, [centerActiveThumbnail]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case "ArrowLeft":
          previous();
          break;

        case "ArrowRight":
          next();
          break;

        default:
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [next, previous]);

  return (
    <div
      ref={galleryRef}
      className="gallery"
    >
      <div
        className="gallery__viewer"
        onClick={toggleFullscreen}
      >
        <button
          type="button"
          className="gallery__button gallery__button--left"
          onClick={(event) => {
            event.stopPropagation();
            previous();
          }}
          aria-label="Previous image"
        >
          &#8249;
        </button>

        <img
          className={`gallery__image ${
            isTransitioning
              ? "gallery__image--fade"
              : ""
          }`}
          src={currentImage.src}
          alt={currentImage.alt}
          draggable={false}
        />

        <button
          type="button"
          className="gallery__button gallery__button--right"
          onClick={(event) => {
            event.stopPropagation();
            next();
          }}
          aria-label="Next image"
        >
          &#8250;
        </button>

        {(currentImage.title ||
          currentImage.caption ||
          currentImage.tags?.length) && (
          <div className="gallery__caption">
            {currentImage.title && (
              <h3 className="gallery__caption-title">
                {currentImage.title}
              </h3>
            )}

            {currentImage.caption && (
              <p className="gallery__caption-text">
                {currentImage.caption}
              </p>
            )}

          </div>
        )}
      </div>

      <div
        ref={thumbnailStripRef}
        className="gallery__thumbnails"
        role="list"
        aria-label="Gallery thumbnails"
      >
        {images.map((image, index) => (
          <button
            key={image.src}
            ref={(element) => {
              thumbnailRefs.current[index] = element;
            }}
            type="button"
            className={
              index === currentIndex
                ? "gallery__thumbnail gallery__thumbnail--active"
                : "gallery__thumbnail"
            }
            onClick={() => goTo(index)}
            aria-label={`View image ${index + 1}`}
            aria-current={index === currentIndex}
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              draggable={false}
            />
          </button>
        ))}
      </div>
    </div>
  );
}