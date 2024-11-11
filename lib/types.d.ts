export type ClosureData = {
  [date: string]: {
    isOpen: boolean
    conditions: ClosureConditions
    rawText: string
  }
}

export type ClosureConditions = null | {
  raw: string | null;
  opensAt: string | null;
  closesAt: string | null;
}

export type StoredClosureData = {
  retrievedAt: string
  data: ClosureData
}
