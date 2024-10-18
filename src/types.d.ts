export type RegExpGroups<T extends string | number>      = { [key in T]: string }
export type MatchArrayWGroups<T extends string | number> = RegExpMatchArray & { groups: RegExpGroups<T> }
export type MatcherWGroups<T extends string | number>    = Omit<RegExp, 'exec'> & { exec: (string: string) => MatchArrayWGroups<T> | null }
