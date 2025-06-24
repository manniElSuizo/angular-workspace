export interface ExampleModel {
  id: number,
  name: string,
  content: string[];
}

export function emptyModel(): ExampleModel {
  return {
    id: 1,
    name: 'Hansi',
    content: ['a', 'b', 'c']
  }
}