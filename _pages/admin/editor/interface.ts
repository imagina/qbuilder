export interface Block {
  id: number
}

export interface Layout {
  id: number,
  title: string,
  blocks: Block[]
}