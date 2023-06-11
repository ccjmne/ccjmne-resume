export type RegExpGroups<T extends string | number> = { [key in T]: string }
export type RegExpWGroups<T extends string | number> = RegExpMatchArray & { groups: RegExpGroups<T> }
