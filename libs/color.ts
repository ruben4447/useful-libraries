/** Scale a number <n> from range <inMin>-<inMax> to <outMin>-<outMax> presevring propertions */
export const nmap = (n: number, inMin: number, inMax: number, outMin: number, outMax: number) => (n - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

/** Clamp a number within a range (inc) */
export const clamp = (n: number, min: number, max: number) => {
  if (n < min) return min;
  if (n > max) return max;
  return n;
};

/** Color formats which are represented as numefical arrays */
type NColorFormat = "rgb" | "rgba" | "hsl" | "hsv" | "cmyk";
type ColorFormat = NColorFormat | "hex" | "hexa" | "css";

/**
 * Given color format and array of values, return values in correct domain
 */
export function clampValues(format: NColorFormat, values: number[]) {
  switch (format) {
    case "rgb":
      return values.map(n => clamp(n, 0, 255));
    case "rgba":
      return [clamp(values[0], 0, 255), clamp(values[1], 0, 255), clamp(values[2], 0, 255), clamp(values[3], 0, 1)];
    case "hsl":
    case "hsv":
      return [clamp(values[0], 0, 360), clamp(values[1], 0, 100), clamp(values[2], 0, 100)];
    case "cmyk":
      return values.map(x => clamp(x, 0, 100));
    default:
      return values;
  }
}

/** Given a color format, return string representation */
export function col2str(format: NColorFormat, values: number[], dp = 2): string {
  values = clampValues(format, values).map(n => +n.toFixed(dp));
  switch (format) {
    case "rgb":
      return "rgb(" + values.join(", ") + ")";
    case "rgba":
      return "rgba(" + values.join(", ") + ")";
    case "hsl":
      return `hsl(${values[0]}, ${values[1]}%, ${values[2]}%)`;
    case "hsv":
      return `hsv(${values[0]}, ${values[1]}%, ${values[2]}%)`;
    case "cmyk":
      return "cmyk(" + values.map(x => x + "%").join(", ") + ")";
    default:
      return "";
  }
}

/**
 * Convert RGB to Hex
 * @params r: red range [0, 255]
 * @params g: green range [0, 255]
 * @params b: blue range [0, 255]
 * @returns hex: #RRGGBB
 */
export function rgb2hex(r: number, g: number, b: number): string {
  return '#' + Math.floor(clamp(r, 0, 255)).toString(16).padStart(2, '0') + Math.floor(clamp(g, 0, 255)).toString(16).padStart(2, '0') + Math.floor(clamp(b, 0, 255)).toString(16).padStart(2, '0');
}

/**
 * Convert RGBA to Hex-Alpha
 * @params r: red range [0, 255]
 * @params g: green range [0, 255]
 * @params b: blue range [0, 255]
 * @params a: alpha range [0, 1]
 * @returns hex: #RRGGBBAA
 */
export function rgba2hexa(r: number, g: number, b: number, a: number): string {
  return '#' + Math.floor(clamp(r, 0, 255)).toString(16).padStart(2, '0') + Math.floor(clamp(g, 0, 255)).toString(16).padStart(2, '0') + Math.floor(clamp(b, 0, 255)).toString(16).padStart(2, '0') + Math.floor(nmap(clamp(a, 0, 1), 0, 1, 0, 255)).toString(16).padStart(2, '0');
}

/**
 * Convert Hex to RGB
 * @param hex - #RRGGBB
 * @returns RGB:[r [0, 255], g [0, 255], b [0, 255]]
*/
export function hex2rgb(hex: string) {
  let rgb: string[] = hex.length === 4 ? hex.substring(1).match(/[0-9A-Fa-f]/g).map(x => x + x) : hex.substring(1).match(/[0-9A-Fa-f]{2}/g);
  return rgb.map(hex => clamp(parseInt(hex, 16), 0, 255)) as [number, number, number];
}

/**
 * Convert Hex-Alpha to RGBA
 * @param hexa - #RRGGBBAA
 * @returns RGB: [r [0, 255], g [0, 255], b [0, 255], a [0, 1]]
*/
export function hexa2rgba(hexa: string) {
  let parts: string[] = hexa.length === 5 ? hexa.substring(1).match(/[0-9A-Fa-f]/g).map(x => x + x) : hexa.substring(1).match(/[0-9A-Fa-f]{2}/g);
  let rgba = parts.map(hex => clamp(parseInt(hex, 16), 0, 255)) as [number, number, number, number];
  rgba[3] = nmap(rgba[3], 0, 255, 0, 1);
  return rgba;
}

/**
 * Convert RGB to HSL
 * @params r: red range [0, 255]
 * @params g: green range [0, 255]
 * @params b: blue range [0, 255]
 * @returns hsl: [h [0, 360], s [0, 100], l [0, 100]]
 */
export function rgb2hsl(r: number, g: number, b: number) {
  r = clamp(r, 0, 255) / 255;
  g = clamp(g, 0, 255) / 255;
  b = clamp(b, 0, 255) / 255;
  let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin;
  let h = 0, s = 0, l = 0;
  if (delta === 0) h = 0;
  else if (cmax === r) h = 60 * (((g - b) / delta) % 60);
  else if (cmax === g) h = 60 * ((b - r) / delta + 2);
  else h = 60 * ((r - g) / delta + 4);
  if (h < 0) h += 360;
  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return [h, s * 100, l * 100] as [number, number, number];
}

/**
 * Convert HSL to RGB
 * @params h: hue range [0, 360]
 * @params s: saturation range [0, 100]
 * @params l: lightness range [0, 100]
 * @returns rgb: [r [0, 255], g [0, 255], b [0, 255]]
 */
export function hsl2rgb(h: number, s: number, l: number) {
  h = clamp(h, 0, 360);
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;
  let c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, rgb: [number, number, number];
  if (0 <= h && h < 60) rgb = [c, x, 0];
  else if (60 <= h && h < 120) rgb = [x, c, 0];
  else if (120 <= h && h < 180) rgb = [0, c, x];
  else if (180 <= h && h < 240) rgb = [0, x, c];
  else if (240 <= h && h < 300) rgb = [x, 0, c];
  else if (300 <= h && h < 360) rgb = [c, 0, x];
  return rgb.map(n => (n + m) * 255);
}

/**
 * Convert CSS color to RGBA
 * @params css - css color string
 * @returns rgba: [r [0, 255], g [0, 255], b [0, 255], a [0, 1]]
 */
export function css2rgb(css: string): number[] {
  const div = document.createElement('div');
  document.body.appendChild(div);
  div.style.color = css;
  let prop = getComputedStyle(div).getPropertyValue("color");
  div.remove();
  return prop.substring(prop.indexOf("(") + 1, prop.length - 1).split(",").map(x => +x.trim());
}

/**
 * Convert RGB to CMYK
 * @params r: red range [0, 255]
 * @params g: green range [0, 255]
 * @params b: blue range [0, 255]
 * @returns cmyk: [c [0, 100], m [0, 100], y [0, 100], k [0, 100]]
 */
export function rgb2cmyk(r: number, g: number, b: number): [number, number, number, number] {
  r = clamp(r === 0 ? 1 : r, 0, 255) / 255;
  g = clamp(g === 0 ? 1 : g, 0, 255) / 255;
  b = clamp(b === 0 ? 1 : b, 0, 255) / 255;
  let k = 1 - Math.max(r, g, b);
  return [((1 - r - k) / (1 - k)) * 100, ((1 - g - k) / (1 - k)) * 100, ((1 - b - k) / (1 - k)) * 100, k * 100];
}

/**
 * Convert CMYK to RGB
 * @params c: cyan range [0, 100]
 * @params m: meganta range [0, 100]
 * @params y: yellow range [0, 100]
 * @params k: black range [0, 100]
 * @returns rgb: [r [0, 255], g [0, 255], b [0, 255]]
 */
export function cmyk2rgb(c: number, m: number, y: number, k: number): [number, number, number] {
  ([c, m, y, k] = [c, m, y, k].map(n => clamp(n, 0, 100) / 100)); // [0, 100] -> [0, 1]
  return [255 * (1 - c) * (1 - k), 255 * (1 - m) * (1 - k), 255 * (1 - y) * (1 - k)];
}

/**
 * Convert RGB to HSV
 * @params r: red range [0, 255]
 * @params g: green range [0, 255]
 * @params b: blue range [0, 255]
 * @returns hsv: [h [0, 360], s [0, 100], v [0, 100]]
 */
export function rgb2hsv(r: number, g: number, b: number): [number, number, number] {
  r = clamp(r, 0, 255) / 255;
  g = clamp(g, 0, 255) / 255;
  b = clamp(b, 0, 255) / 255;
  let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin;
  let h = 0, s = 0, v = cmax;
  if (delta === 0) h = 0;
  else if (cmax === r) h = 60 * (((g - b) / delta) % 60);
  else if (cmax === g) h = 60 * ((b - r) / delta + 2);
  else h = 60 * ((r - g) / delta + 4);
  if (h < 0) h += 360;
  s = cmax === 0 ? 0 : delta / cmax;
  return [h, s * 100, v * 100];
}

/**
 * Convert HSV to RGB
 * @params h: hue range [0, 360]
 * @params s: saturation range [0, 100]
 * @params v: value range [0, 100]
 * @returns rgb: [r [0, 255], g [0, 255], b [0, 255]]
 */
export function hsv2rgb(h: number, s: number, v: number): [number, number, number] {
  h = clamp(h, 0, 360);
  s = clamp(s, 0, 100) / 100;
  v = clamp(v, 0, 100) / 100;
  let c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
  let rgb: [number, number, number];
  if (0 <= h && h < 60) rgb = [c, x, 0];
  else if (60 <= h && h < 120) rgb = [x, c, 0];
  else if (120 <= h && h < 180) rgb = [0, c, x];
  else if (180 <= h && h < 240) rgb = [0, x, c];
  else if (240 <= h && h < 300) rgb = [x, 0, c];
  else if (300 <= h && h < 360) rgb = [c, 0, x];
  return rgb.map(n => (n + m) * 255) as [number, number, number];
}

/**
 * Convert HSL to HSV
 * @params h: hue range [0, 360]
 * @params s: saturation range [0, 100]
 * @params l: lightness range [0, 100]
 * @returns hsv: [h [0, 360], s [0, 100], v [0, 100]]
 */
export function hsl2hsv(h: number, s: number, l: number): [number, number, number] {
  h = clamp(h, 0, 360);
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;
  let v = s * Math.min(l, 1 - l) + l;
  return [h, (v === 0 ? 0 : 2 * (1 - l / v)) * 100, v * 100];
}

/**
 * Convert HSV to HSL
 * @params h: hue range [0, 360]
 * @params s: saturation range [0, 100]
 * @params v: value range [0, 100]
 * @returns hsl: [h [0, 360], s [0, 100], l [0, 100]]
 */
export function hsv2hsl(h: number, s: number, v: number): [number, number, number] {
  h = clamp(h, 0, 360);
  s = clamp(s, 0, 100) / 100;
  v = clamp(v, 0, 100) / 100;
  let l = v * (1 - s / 2), m = Math.min(l, 1 - l);
  return [h, (l === 0 || l === 1 ? 0 : (v - l) / m * 100), l * 100];
}

/** Dictionary of CSS colors */
export const cssColors: { [css: string]: string } = {
  AliceBlue: "#f0f8ff",
  AntiqueWhite: "#faebd7",
  Amethyst: "#64609A",
  Aqua: "#00ffff",
  AquaMarine: "#7fffd4",
  Azure: "#f0ffff",
  AztecGold: "#c39953",
  Beige: "#f5f5dc",
  Bisque: "#ffe4c4",
  Black: "#000000",
  BlanchedAlmond: "#ffebcd",
  Blue: "#0000ff",
  BlueViolet: "#8a2be2",
  Brown: "#a52a2a",
  BurlyWood: "#deb887",
  CadetBlue: "#5f9ea0",
  Chartreuse: "#7fff00",
  Chocolate: "#d2691e",
  Coral: "#ff7f50",
  CornflowerBlue: "#6495ed",
  Cornsilk: "#fff8dc",
  Crimson: "#dc143c",
  Cyan: "#00ffff",
  DarkBlue: "#00008b",
  DarkCyan: "#008b8b",
  DarkGoldenRod: "#b8860b",
  DarkGray: "#a9a9a9",
  DarkGrey: "#a9a9a9",
  DarkGreen: "#006400",
  DarkKhaki: "#bdb76b",
  DarkMagenta: "#8b008b",
  DarkOliveGreen: "#556b2f",
  DarkOrange: "#ff8c00",
  DarkOrchid: "#9932cc",
  DarkRed: "#8b0000",
  DarkSalmon: "#e9967a",
  DarkSeaGreen: "#8fbc8f",
  DarkSlateBlue: "#483d8b",
  DarkSlateGray: "#2f4f4f",
  DarkSlateGrey: "#2f4f4f",
  DarkTurquoise: "#00ced1",
  DarkViolet: "#9400d3",
  DeepPink: "#ff1493",
  DeepSkyBlue: "#00bfff",
  DimGray: "#696969",
  DimGrey: "#696969",
  DodgerBlue: "#1e90ff",
  FireBrick: "#b22222",
  FloralWhite: "#fffaf0",
  ForestGreen: "#228b22",
  Fuchsia: "#ff00ff",
  Gainsboro: "#dcdcdc",
  GhostWhite: "#f8f8ff",
  Gold: "#ffd700",
  GoldenRod: "#daa520",
  Gray: "#808080",
  Grey: "#808080",
  Green: "#008000",
  GreenYellow: "#adff2f",
  HoneyDew: "#f0fff0",
  HotPink: "#ff69b4",
  IndianRed: "#cd5c5c",
  Indigo: "#4b0082",
  Ivory: "#fffff0",
  Khaki: "#f0e68c",
  Lavendar: "#e6e6fa",
  LavendarBlush: "#fff0f5",
  LawnGreen: "#7cfc00",
  LemonChiffon: "#fffacd",
  LightBlue: "#add8e6",
  LightCoral: "#f08080",
  LightCyan: "#e0ffff",
  LightGoldenRodYellow: "#fafad2",
  LightGray: "#d3d3d3",
  LightGrey: "#d3d3d3",
  LightGreen: "#90ee90",
  LightPink: "#ffb6c1",
  LightSalmon: "#ffa07a",
  LightSeaGreen: "#20b2aa",
  LightSkyBlue: "#87cefa",
  LightSlateGray: "#778899",
  LightSlateGrey: "#778899",
  LightSteelBlue: "#b0c4de",
  LightYellow: "#ffffe0",
  Lime: "#00ff00",
  LimeGreen: "#32cd32",
  Linen: "#faf0e6",
  Magenta: "#ff00ff",
  Maroon: "#800000",
  MediumAquaMarine: "#66cdaa",
  MediumBlue: "#0000cd",
  MediumOrchid: "#ba55d3",
  MediumPurple: "#9370db",
  MediumSeaGreen: "#3cb371",
  MediumSlateBlue: "#7b68ee",
  MediumSpringGreen: "#00fa9a",
  MediumTurquoise: "#48d1cc",
  MediumVioletRed: "#c71585",
  MidnightBlue: "#191970",
  MintCream: "#f5fffa",
  MistyRose: "#ffe4e1",
  Moccasin: "#ffe4b5",
  NavajoWhite: "#ffdead",
  Navy: "#000080",
  OldLace: "#fdf5e6",
  Olive: "#808000",
  OliveDrab: "#6b8e23",
  Orange: "#ffa500",
  OrangeRed: "#ff4500",
  Orchid: "#da70d6",
  PaleGoldenRod: "#eee8aa",
  PaleGreen: "#98fb98",
  PaleTurquoise: "#afeeee",
  PaleVioletRed: "#db7093",
  PapayaWhip: "#ffefd5",
  PeachPuff: "#ffdab9",
  Peru: "#cd853f",
  PewterBlue: "#8ba8b7",
  Pink: "#ffc0cb",
  Plum: "#dda0dd",
  PowderBlue: "#b0e0e6",
  Purple: "#800080",
  RebeccaPurple: "#663399",
  Red: "#ff0000",
  RosyBrown: "#bc8f8f",
  RoyalBlue: "#4169e1",
  RustyRed: "#da2c43",
  SaddleBrown: "#8b4513",
  Salmon: "#fa8072",
  SandyBrown: "#f4a460",
  Sapphire: "#2D5DA1",
  SeaGreen: "#2e8b57",
  SeaShell: "#fff5ee",
  Sienna: "#a0522d",
  Silver: "#c0c0c0",
  SkyBlue: "#87ceeb",
  SlateBlue: "#6a5acd",
  SlateGray: "#708090",
  SlateGrey: "#708090",
  Snow: "#fffafa",
  SpringGreen: "#00ff7f",
  SteelBlue: "#4682b4",
  Tan: "#d2b48c",
  Teal: "#008080",
  Thistle: "#d8bfd8",
  Tomato: "#ff6347",
  Turquoise: "#40e0d0",
  Violet: "#ee82ee",
  Wheat: "#f5deb3",
  White: "#ffffff",
  WhiteSmoke: "#f5f5f5",
  Yellow: "#ffff00",
  YellowGreen: "#9acd32"
};

/** Determine whether white or black is best colour for text on given RGB background */
export function bestTextColor(rgb: [number, number, number], n = 100) {
  return (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114) > n ? "black" : "white";
}