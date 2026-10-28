/**
 * shared.ts — Общая сущность «Пользователь» и утилиты безопасности.
 * Отвечает за структуру данных пользователя, валидацию и защиту от XSS.
 */
export class User {
  public id: number | null;
  public name: string;
  public age: number;

  constructor(name: string, age: number | string, id: number | null = null) {
    if (!name || !String(name).trim()) {
      throw new Error('Имя обязательно');
    }

    const n = Number(age);
    if (age === '' || age === null || age === undefined || !Number.isInteger(n) || n < 0 || n > 120) {
      throw new Error('Возраст должен быть числом от 0 до 120');
    }

    this.id = id;
    this.name = String(name).trim();
    this.age = n;
  }
}

/** Защита от XSS-атак при выводе пользовательского ввода в HTML */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}