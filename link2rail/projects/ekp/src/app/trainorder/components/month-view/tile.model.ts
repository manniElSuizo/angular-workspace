export enum TileTypeEnum {
  ORDER_ACCEPTED = 'ORDER_ACCEPTED',
  CANCELLATION_DECLINED = 'CANCELLATION_DECLINED',
  ORDER_DECLINED = 'ORDER_DECLINED',
  ORDER_IN_REVIEW = 'ORDER_IN_REVIEW',
  ORDER_ACQUIRED = 'ORDER_ACQUIRED',
  ORDER_IN_VALIDATION = 'ORDER_IN_VALIDATION',
  TRAIN_ON_TIME = 'TRAIN_ON_TIME',
  TRAIN_LATE = 'TRAIN_LATE',
  TRAIN_TOO_LATE = 'TRAIN_TOO_LATE',
  TRAIN_SCHEDULED = 'TRAIN_SCHEDULED',
  CANCELLATION_ACQUIRED = 'CANCELLATION_ACQUIRED',
  CANCELLATION_IN_VALIDATION = 'CANCELLATION_IN_VALIDATION',
  CANCELED = 'CANCELED',
  EMPTY = 'EMPTY',
  INFO = 'INFO',
  PARKED = 'PARKED'
}

/*
export function createMockup(): Tile[] {
  const tiles: Tile[] = [];
  tiles.push({ id: "14502", type: TileType.CANCELLATION_ACQUIRED, date: new Date('2023-10-02'), sendingStation: { name: "LUEBECK HGBF", objectKeyAlpha: "LUEBECK HGBF", objectKeySequence: 1 }, receivingStation: { name: "LUEBECK HBF", objectKeyAlpha: "LUEBECK HBF", objectKeySequence: 1 }, holiday: null, isCancelable: false, isTrackable: false, productionDate:  new Date('2023-10-02'), authorization: [] });
  tiles.push({ id: "14502", type: TileType.TRAIN_LATE, date: new Date('2023-10-03'), sendingStation: { name: "LUEBECK HGBF", objectKeyAlpha: "LUEBECK HGBF", objectKeySequence: 1 }, receivingStation: { name: "LUEBECK HBF", objectKeyAlpha: "LUEBECK HBF", objectKeySequence: 1 }, holiday: null, isCancelable: false, isTrackable: false, productionDate:  new Date('2023-10-03'), authorization: [] });
  tiles.push({ id: "14502", type: TileType.TRAIN_ON_TIME, date: new Date('2023-10-04'), sendingStation: { name: "LUEBECK HGBF", objectKeyAlpha: "LUEBECK HGBF", objectKeySequence: 1 }, receivingStation: { name: "LUEBECK HBF", objectKeyAlpha: "LUEBECK HBF", objectKeySequence: 1 }, holiday: null, isCancelable: false, isTrackable: false, productionDate:  new Date('2023-10-04'), authorization: [] });
  tiles.push({ id: "14502", type: TileType.TRAIN_SCHEDULED, date: new Date('2023-10-05'), sendingStation: { name: "LUEBECK HGBF", objectKeyAlpha: "LUEBECK HGBF", objectKeySequence: 1 }, receivingStation: { name: "LUEBECK HBF", objectKeyAlpha: "LUEBECK HBF", objectKeySequence: 1 }, holiday: null, isCancelable: false, isTrackable: false, productionDate:  new Date('2023-10-05'), authorization: [] });
  tiles.push({ id: "14502", type: TileType.TRAIN_TOO_LATE, date: new Date('2023-10-06'), sendingStation: { name: "LUEBECK HGBF", objectKeyAlpha: "LUEBECK HGBF", objectKeySequence: 1 }, receivingStation: { name: "LUEBECK HBF", objectKeyAlpha: "LUEBECK HBF", objectKeySequence: 1 }, holiday: null, isCancelable: false, isTrackable: false, productionDate:  new Date('2023-10-06'), authorization: [] });
  tiles.push({ id: "14502", type: TileType.CANCELED, date: new Date('2023-10-07'), sendingStation: { name: "LUEBECK HGBF", objectKeyAlpha: "LUEBECK HGBF", objectKeySequence: 1 }, receivingStation: { name: "LUEBECK HBF", objectKeyAlpha: "LUEBECK HBF", objectKeySequence: 1 }, holiday: null, isCancelable: false, isTrackable: false, productionDate:  new Date('2023-10-07'), authorization: [] });
  tiles.push({ id: "202309000065", type: TileType.ORDER_ACCEPTED, date: new Date('2023-10-08'), sendingStation: { name: "LUEBECK HGBF", objectKeyAlpha: "LUEBECK HGBF", objectKeySequence: 1 }, receivingStation: { name: "LUEBECK HBF", objectKeyAlpha: "LUEBECK HBF", objectKeySequence: 1 }, holiday: null, isCancelable: false, isTrackable: false, productionDate:  new Date('2023-10-08'), authorization: [] });
  tiles.push({ id: "202309000065", type: TileType.ORDER_ACQUIRED, date: new Date('2023-10-09'), sendingStation: { name: "LUEBECK HGBF", objectKeyAlpha: "LUEBECK HGBF", objectKeySequence: 1 }, receivingStation: { name: "LUEBECK HBF", objectKeyAlpha: "LUEBECK HBF", objectKeySequence: 1 }, holiday: null, isCancelable: false, isTrackable: false, productionDate:  new Date('2023-10-09'), authorization: [] });
  tiles.push({ id: "202309000065", type: TileType.ORDER_DECLINED, date: new Date('2023-10-10'), sendingStation: { name: "LUEBECK HGBF", objectKeyAlpha: "LUEBECK HGBF", objectKeySequence: 1 }, receivingStation: { name: "LUEBECK HBF", objectKeyAlpha: "LUEBECK HBF", objectKeySequence: 1 }, holiday: null, isCancelable: false, isTrackable: false, productionDate:  new Date('2023-10-10'), authorization: [] });
  tiles.push({ id: "202309000065", type: TileType.ORDER_IN_REVIEW, date: new Date('2023-10-11'), sendingStation: { name: "LUEBECK HGBF", objectKeyAlpha: "LUEBECK HGBF", objectKeySequence: 1 }, receivingStation: { name: "LUEBECK HBF", objectKeyAlpha: "LUEBECK HBF", objectKeySequence: 1 }, holiday: null, isCancelable: false, isTrackable: false, productionDate:  new Date('2023-10-11'), authorization: [] });

  return tiles;
}
*/
