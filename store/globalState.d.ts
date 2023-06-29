export default function globalState<T>(allInitState: T): { [P in keyof T]:() => [T[P], (callback: (arg: { current: T[P] }) => void) => void] };