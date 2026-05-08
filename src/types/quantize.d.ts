declare module 'quantize' {
  export default function quantize(
    pixels: Array<[number, number, number]>,
    maxColors: number
  ):
    | {
        palette: () => Array<[number, number, number]>;
      }
    | false;
}
