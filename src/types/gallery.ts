export interface GalleryImage {
  /**
   * Image source.
   * Example: "/images/gallery/floor-jack/001.jpg"
   */
  src: string;

  /**
   * Accessible description of the image.
   * This should describe what is actually shown,
   * not repeat the caption.
   */
  alt: string;

  /**
   * Optional title displayed in the caption overlay.
   */
  title?: string;

  /**
   * Optional supporting text displayed beneath the title.
   */
  caption?: string;

  /**
   * Optional tags for future filtering, annotations,
   * or project organization.
   */
  tags?: string[];
}