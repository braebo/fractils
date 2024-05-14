export type Constructor<T = any> = new (...args: any[]) => T

export type ClassDecorator<T = any> = (constructor: Constructor<T>) => Constructor<T>
