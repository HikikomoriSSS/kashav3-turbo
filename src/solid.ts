import { User } from './shared.js';

// Single Responsibility Principle (SRP)
export class UserValidator {
  static validate(username: string, age: number | string): void {
    if (!username || username.trim() === '') throw new Error('Имя обязательно');
    if (!age || Number(age) <= 0) throw new Error('Возраст должен быть положительным');
  }
}

export interface IUserFilter {
  filter(users: User[]): User[];
}

export class AgeFilter implements IUserFilter {
  constructor(private minAge: number) {}
  filter(users: User[]): User[] {
    return users.filter((u) => Number(u.age) >= this.minAge);
  }
}

export class BasicUserSaver {
  save(user: User): void {
    console.log(`Saving user ${user.name}`);
  }
}

export class LocalStorageUserSaver extends BasicUserSaver {
  override save(user: User): void {
    localStorage.setItem(`user_${user.id}`, JSON.stringify(user));
  }
}

export interface IReader<T> {
  read(id: number): T | null;
}

export interface IWriter<T> {
  write(entity: T): void;
}

export interface ILogger {
  log(msg: string): void;
}

export class ConsoleLogger implements ILogger {
  log(msg: string): void {
    console.log(`[LOG]: ${msg}`);
  }
}