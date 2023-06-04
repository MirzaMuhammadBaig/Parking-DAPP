export enum Zone {
  A = 0,
  B = 1,
  C = 2,
}

export const getZoneEnumKeys = () => Object.keys(Zone).filter((x: any) => isNaN(x));
