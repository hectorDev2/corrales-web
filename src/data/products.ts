import type { Product } from "@/types/product";

export const CATEGORIES = [
  "Pollo a la Brasa",
  "Parrillas",
  "Fast Food",
  "Bebidas",
  "Postres",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "1/4 Pollo Brasa",
    description: "Con papas fritas y ensalada fresca.",
    price: 18.9,
    category: "Pollo a la Brasa",
    tag: "Popular",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJMK-oeyrdyjdxa9MqUn1KLFk-pmjUAZsDXwm6rMlL-uun9eXnYgg_74_sYbmXkQNVBUCK155fefhr79Ur3ZB5jHIAozSIPr57lStF38Fvwj2EoYeFuO3phyK9yFj6UK-SXCas1Wcbim0WLH8BDSmF4hr6bqnotTIJTzaF6MekmGNIlMeYCqDqILl85T02zpIp4W5NXtgjBjX5Y24mWavSyH5j-wi6L79encbFfK0QlmPrJrLH37KPa91rMV-Ee9p_BiTeW4C_V1dX",
      alt: "1/4 de Pollo a la Brasa dorado con papas fritas",
    },
  },
  {
    id: "2",
    name: "1 Pollo Entero",
    description: "Ideal para compartir en familia.",
    price: 62.0,
    category: "Pollo a la Brasa",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1X38t6gleacQ7Q0h3Rxe1VNVCNOtvuWaae9O1qIVRezvvfyU5NsEiEKHNh2n77Cmyuyti1RwBhnVF99HnzbgyDN-dnGW2uqfVCbT9LgNMPH9RYsDTTTmqMDN-S8sbY41jp4ShHPNACKjMQ7OxVZU00VdAWZuOYaH0O5-ekW7UakzRujojRcXTW2UIStiW_njR3L_5lXsWIcTLbM-VjuRFm41m38_4xlD55wEpGhx9IuLd4utu7OUAs74mFHIpg8TOsBFjaRt7muzf",
      alt: "Pollo entero a la brasa con ensalada y papas",
    },
  },
  {
    id: "3",
    name: "1/4 Pollo Especial",
    description: "Acompañado de papas fritas crocantes, ensalada fresca y cremas de la casa.",
    price: 24.9,
    category: "Pollo a la Brasa",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGNNXR82CvgjNC95bDN9DBtfzp4LeP4v3szx1tmxDdL-5YsRhQLOydulVwXRyjZVa-hctAhJUjASAiS6OvZgZJJzBfbS38t5tVWaUr5xOAo28Uj7RJJYeDRSGxgentqxk6AKLd0LtIHuiw84L5dtal1fqy1frllF1c9_hhdnO2glEau_VF0korIB1vyyxihixyWXZUmSlF81oUNXSvZ5Hgoek_E5n9ep9lFFHK6mo2BFKaZNiR2aHCgeSvmg8UY1ySWmomxnv1W7TJ",
      alt: "1/4 de Pollo Especial con cremas de la casa",
    },
  },
  {
    id: "4",
    name: "Anticuchos Corrales",
    description: "Dos palos de corazón con papa dorada.",
    price: 24.5,
    category: "Parrillas",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTSVlQ0mQ8cjZzU12uyHHziPIQiZTmp6XwQ7by-ju00Q720WV0T3KTik335Q4x5ECzcKQguFWsxPDaNkNlDy6RN2udL33MjZfWS2SZcpQ1U0BKHwJ4nYR0z4jG_P-aL_5_M5uIdz4PTAOsg-iiUnUUC_xA_L1OBGLY1obk0PayKCQmnHnQ95C_F0G1yFwtngP4q4XD5CZe0IdvwIsztKtxfQw54xmJOLDEYuqsaabQ-NHWynBor6xdWIFBpMIfJnlCTE0gxj5GQHGQ",
      alt: "Anticuchos de corazón a la parrilla",
    },
  },
  {
    id: "5",
    name: "La Corrales Double",
    description: "Doble carne premium, queso fundido, tocino ahumado y salsa secreta Corrales.",
    price: 29.5,
    category: "Fast Food",
    tag: "Firma Corrales",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcCu8fa9WUPVsIve1CKUPD6kJCQVRLmdwL-sDt_88BcolnhQmMBFNPBTDxFT4wHKPODLNhiUHrQ9OR5hAK-EEDwzfIXKue6GuUXlb6kAJFbvuJ5M8sKoS0AbGMqyQrH7xGfbA2J7qeSTOKg1ZBkf9ViSEZjgXrc9vbXmj0jkYtaOg6ASgjC5uvJI5GAcGNThqaliA2oyDoByu9P_THBWSaIjAjd2KQ8SJ-Yh4Txl8d2O5RaFpNLkqIMwVg-BaRMK6zrZJFug9mYOrm",
      alt: "La Corrales Double — hamburguesa doble con queso fundido",
    },
  },
  {
    id: "6",
    name: "Hamburguesa Royal",
    description: "Carne artesanal, huevo y queso.",
    price: 21.0,
    category: "Fast Food",
    tag: "Nuevo",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAiQg1MCAmsbQ5TquybBLzz6hFKI6X8ymuvDNUIUgzBi5s6dnWzAi9krUxqNcZ3ZwTc-dHDTkUie1NeaqQ1oE1QlOJci-7x1e7U0Y5EB3MX8JGME8fEiCi75JnUk9utdxtgv8xHiHNta0KuD5gZaODp67aHMzB9Yc78H2j44tk-lnAS3Lp67KquewZh8pLohbFqE0tnFrVlzWn1KBh_0kWxr_MwYHpyHeLWImuwtVS42jwNildh3QPUuli7X_q4sCeqYdmFA0HtqF7g",
      alt: "Hamburguesa Royal con carne artesanal y huevo",
    },
  },
  {
    id: "7",
    name: "Salchipapa Mega",
    description: "Frankfurter premium, papas peruanas seleccionadas y todas nuestras cremas.",
    price: 18.0,
    category: "Fast Food",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQIRXHZ09fQILOZBP3zWSIGyiT13uOHrzf2n_DC4t248mHRJK3YFiEb68PLokSBN0giMh_xyu81zILUwxdiqtAKPC1FtvrI3bLB5CDnPSV6VYBaEDDOFEj9GFFBdp9Ob9GG1ilvlWXyu7zlmAsrNhx1708FcgBJS8zbt-QfrttokvfsPNZi6i92cyyVRfUoyZp67atpiKERzLl7nDBnKAt5y9YnGrY8vSgmCMdIhOTBV3YRQBdKtXyyrTCroSbKnTZla38Hc7llHsG",
      alt: "Salchipapa Mega con cremas de la casa",
    },
  },
];
