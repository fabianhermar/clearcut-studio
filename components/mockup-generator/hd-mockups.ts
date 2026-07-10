export interface HDMockupScreen {
  top: number; // percentage (0-100)
  left: number; // percentage (0-100)
  width: number; // percentage (0-100)
  height: number; // percentage (0-100)
  radius: number; // percentage of the screen width (e.g., 5 means 5% of screen width)
}

export interface HDMockup {
  id: string;
  name: string;
  category: "phone" | "desktop" | "laptop" | "tablet" | "wearable";
  image: string; // path to the image
  screen: HDMockupScreen;
}

// Valores estimados iniciales (A CALIBRAR POR EL USUARIO)
// Usa top, left, width, y height en porcentajes del tamaño total de la imagen PNG.
export const HD_MOCKUPS: HDMockup[] = [
  // ─── Phones ──────────────────────────────────────────────────────────────
  {
    id: "hd-iphone-16-pro",
    name: "iPhone 16 Pro",
    category: "phone",
    image: "/mockups/phone/iphone_16_pro.png",
    screen: { top: 5, left: 5, width: 90, height: 90, radius: 10 },
  },
  {
    id: "hd-iphone-17-pro",
    name: "iPhone 17 Pro",
    category: "phone",
    image: "/mockups/phone/iphone_17_pro.png",
    screen: { top: 5, left: 5, width: 90, height: 90, radius: 10 },
  },
  {
    id: "hd-iphone-17-pro-orange",
    name: "iPhone 17 Pro (Orange)",
    category: "phone",
    image: "/mockups/phone/iphone_17_pro_cosmic_orange.png",
    screen: { top: 5, left: 5, width: 90, height: 90, radius: 10 },
  },

  // ─── Desktops ────────────────────────────────────────────────────────────
  {
    id: "hd-apple-pro-display",
    name: "Pro Display XDR",
    category: "desktop",
    image: "/mockups/desktop/apple_pro_display_xdr.png",
    screen: { top: 5, left: 5, width: 90, height: 80, radius: 2 },
  },
  {
    id: "hd-thunderbolt",
    name: "Thunderbolt Display",
    category: "desktop",
    image: "/mockups/desktop/apple_thunderbolt_display.png",
    screen: { top: 8, left: 5, width: 90, height: 75, radius: 2 },
  },
  {
    id: "hd-dell-24",
    name: "Dell Ultrasharp 24",
    category: "desktop",
    image: "/mockups/desktop/dell_ultrasharp_24.png",
    screen: { top: 5, left: 3, width: 94, height: 85, radius: 0 },
  },
  {
    id: "hd-dell-27",
    name: "Dell Ultrasharp 27",
    category: "desktop",
    image: "/mockups/desktop/dell_ultrasharp_27.png",
    screen: { top: 5, left: 3, width: 94, height: 85, radius: 0 },
  },
  {
    id: "hd-dell-5k",
    name: "Dell Ultrasharp 5K",
    category: "desktop",
    image: "/mockups/desktop/dell_ultrasharp_5k.png",
    screen: { top: 5, left: 3, width: 94, height: 85, radius: 0 },
  },
  {
    id: "hd-imac-retina",
    name: "iMac Retina",
    category: "desktop",
    image: "/mockups/desktop/imac-retina.png",
    screen: { top: 7, left: 5, width: 90, height: 60, radius: 2 },
  },
  {
    id: "hd-imac",
    name: "iMac",
    category: "desktop",
    image: "/mockups/desktop/imac.png",
    screen: { top: 7, left: 5, width: 90, height: 60, radius: 2 },
  },
  {
    id: "hd-imac-pro",
    name: "iMac Pro",
    category: "desktop",
    image: "/mockups/desktop/imac_pro.png",
    screen: { top: 7, left: 5, width: 90, height: 60, radius: 2 },
  },

  // ─── Laptops ─────────────────────────────────────────────────────────────
  {
    id: "hd-macbook-air-13-silver",
    name: "MacBook Air 13 (Silver)",
    category: "laptop",
    image: "/mockups/laptop/macbook-air-13-silver.png",
    screen: { top: 10, left: 10, width: 80, height: 60, radius: 2 },
  },
  {
    id: "hd-macbook-air-13-spacegrey",
    name: "MacBook Air 13 (Space Grey)",
    category: "laptop",
    image: "/mockups/laptop/macbook_air_13_spacegrey.png",
    screen: { top: 10, left: 10, width: 80, height: 60, radius: 2 },
  },
  {
    id: "hd-macbook-pro-13-silver",
    name: "MacBook Pro 13 (Silver)",
    category: "laptop",
    image: "/mockups/laptop/macbook_pro_13_silver.png",
    screen: { top: 10, left: 10, width: 80, height: 60, radius: 2 },
  },
  {
    id: "hd-macbook-pro-15-spacegrey",
    name: "MacBook Pro 15 (Space Grey)",
    category: "laptop",
    image: "/mockups/laptop/macbook_pro_15_spacegrey.png",
    screen: { top: 10, left: 10, width: 80, height: 60, radius: 2 },
  },
  {
    id: "hd-dell-xps-13",
    name: "Dell XPS 13",
    category: "laptop",
    image: "/mockups/laptop/dell_xps_13.png",
    screen: { top: 10, left: 10, width: 80, height: 60, radius: 2 },
  },
  {
    id: "hd-dell-xps-15",
    name: "Dell XPS 15",
    category: "laptop",
    image: "/mockups/laptop/dell_xps_15.png",
    screen: { top: 10, left: 10, width: 80, height: 60, radius: 2 },
  },
  {
    id: "hd-surface-book",
    name: "Surface Book",
    category: "laptop",
    image: "/mockups/laptop/surface_book.png",
    screen: { top: 10, left: 10, width: 80, height: 60, radius: 2 },
  },
];
