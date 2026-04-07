import "./PlaceImage.css";
import { useState } from "react";

const ERROR_IMG_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjOTRhM2I4IiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuNyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4=";

export default function PlaceImage({
  src,
  fallbackSrc,
  alt,
  className = "",
  wrapperClassName = "",
}) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc || ERROR_IMG_SRC);
  const [didFallback, setDidFallback] = useState(false);

  const handleError = () => {
    if (!didFallback && fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setDidFallback(true);
      return;
    }

    setCurrentSrc(ERROR_IMG_SRC);
  };

  if (currentSrc === ERROR_IMG_SRC) {
    return (
      <div className={["place-image__fallback", wrapperClassName].filter(Boolean).join(" ")}>
        <img className={className} src={ERROR_IMG_SRC} alt={alt} />
      </div>
    );
  }

  return <img className={className} src={currentSrc} alt={alt} onError={handleError} />;
}
