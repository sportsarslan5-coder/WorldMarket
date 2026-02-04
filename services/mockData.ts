
import { Product, Seller, Order } from '../types.ts';

export const officialImages = [
  "https://res.cloudinary.com/dzt2nrkjr/image/upload/v1770054612/16AMERICANFOOTBALLMODEL_swj02j.jpg",
  "https://res.cloudinary.com/dzt2nrkjr/image/upload/v1770048123/FD-163_FD-5060_u9c4nk.png",
  "https://res.cloudinary.com/dzt2nrkjr/image/upload/v1770048123/FD-BASE-VN2-3444-nLxSniE19uaW_alt_3_x1e3hs.png",
  "https://res.cloudinary.com/dzt2nrkjr/image/upload/v1770048122/iw4bvdxfzz7ak15hcgrm_cqn51z.jpg",
  "https://res.cloudinary.com/dzt2nrkjr/image/upload/v1770048125/aHR0cHM6Ly9zdG9yYWdlLmdvb2dsZWFwaXMuY29tL2dhbWVjb2Nrc29ubGluZS1jb20vMjAyNi8wMS9hMDQ5ZmIxNS1ic2JfMDEyM19wcmFjdGljZV9kYXZpc18yNl81OS5qcGc_iy4soz.png",
  "https://res.cloudinary.com/dzt2nrkjr/image/upload/v1770054975/250px-Uniforme_local_ialcqx.jpg",
  "https://res.cloudinary.com/dzt2nrkjr/image/upload/v1770054977/2024_Major_League_Baseball_uniform_controversy__28cropped_29_vbgtfr.jpg",
  "https://res.cloudinary.com/dzt2nrkjr/image/upload/v1770054977/new-index-bat-bags-grid-fall-2025-3_igkuhe.jpg",
  "https://res.cloudinary.com/dzt2nrkjr/image/upload/v1770054977/Cam_Cannarella_JohnByrumGetty_efpobp.jpg",
  "https://res.cloudinary.com/dzt2nrkjr/image/upload/v1770055149/2026_BASE_LeggettNo7Legacy_FRONT_rkrgpu.webp",
  "https://res.cloudinary.com/dzt2nrkjr/image/upload/v1770054613/2_811d056b-a34e-49ea-b42f-6595878871c4_800x_kj2kke.jpg",
  "https://res.cloudinary.com/dzt2nrkjr/image/upload/v1770054614/American-Football-700-9_vpggpv.jpg",
  "https://res.cloudinary.com/dzt2nrkjr/image/upload/v1770056439/image.coreimg_szfvyx.jpg",
  "https://res.cloudinary.com/dzt2nrkjr/image/upload/v1770056399/Hawaii_AirForce_Web_Captians_f52wrm.webp",
  "https://res.cloudinary.com/dzt2nrkjr/image/upload/v1770056398/240917-american-sports-story-al-0928-5de7fc_xhcoqy.jpg",
  "https://res.cloudinary.com/dzt2nrkjr/image/upload/v1770056397/01_08_34_15_gla_103_rec709_g24_20_3840x2160_20240726_0098751-copy-4-copy_lksoe4.jpg",
  "https://res.cloudinary.com/dzt2nrkjr/image/upload/v1770056364/jerseys_j0kxki.jpg",
  "https://res.cloudinary.com/dzt2nrkjr/image/upload/v1770056366/american-football-player-uniform-training-field_23-2150034543_w6cmwh.jpg"
];

const productNames = [
  "Pro Elite Basketball Jersey",
  "Varsity League Full Set",
  "Championship Mesh Uniform",
  "All-Star Performance Gear",
  "Slam Dunk Series Kit",
  "Courtside Pro Apparel",
  "Legacy Sports Uniform",
  "Dynamic Team Jersey",
  "Elite Practice Set",
  "Pro League Basketball Top",
  "Prime Stadium Apparel",
  "Victory Series Uniform",
  "Hoops Master Jersey",
  "Gridiron Pro Series",
  "Baller Performance Set",
  "Custom League Threads",
  "Titan Sports Apparel",
  "Supreme Basketball Kit"
];

export const globalProducts: Product[] = officialImages.map((url, i) => {
  // Distribute prices between 35 and 40
  const prices = [35, 36, 37, 38, 39, 40];
  const price = prices[i % prices.length];
  
  return {
    id: `PRD-${i}`,
    name: productNames[i % productNames.length],
    price: price,
    imageUrl: url,
    category: "Basketball Uniforms",
    description: "Premium sports-grade fabric with professional moisture-wicking technology. Durable double-stitching designed for high-intensity league play. Direct manufacturer quality."
  };
});

export const mockSellers: Seller[] = [];
export const mockProducts: Product[] = globalProducts;
export const mockOrders: Order[] = [];
