export enum Zone {
  A1 = 0,
  A2 = 1,
  A3 = 2,
  B1 = 3,
  B2 = 4,
  B3 = 5,
  C1 = 6,
  C2 = 7,
  C3 = 8,
}

export const getZoneEnumKeys = () =>
  Object.keys(Zone).filter((x: any) => isNaN(x));
