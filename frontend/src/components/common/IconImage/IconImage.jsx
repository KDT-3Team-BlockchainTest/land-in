import "./IconImage.css";

export default function IconImage({ src, alt = "", size = 20, className = "" }) {
  return (
    <img
      className={["icon-image", className].filter(Boolean).join(" ")}
      src={src}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      style={{ width: size, height: size }}
    />
  );
}
