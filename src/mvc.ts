/**
 * Паттерн MVC (Model-View-Controller)
 * 
 * Особенность: View напрямую подписывается на Model (subscribe / notify). 
 * Когда Controller меняет данные в Model, Модель сама уведомляет Представление.
 */
import { User, escapeHtml } from './shared.js';

export type Subscriber = (users: User[]) => void;

export class UserModel {
  #users: User[] = [];
  #nextId = 1;
  #subscribers: Subscriber[] = [];

  subscribe(fn: Subscriber): void {
    this.#subscribers.push(fn);
  }

  private notify(): void {
    this.#subscribers.forEach((fn) => fn(this.getAll()));
  }

  getAll(): User[] {
    return [...this.#users];
  }

  create({ username, age }: { username: string; age: string | number }): User {
    const user = new User(username, age, this.#nextId++);
    this.#users.push(user);
    this.notify(); // Автоматическое оповещение подписчиков (View)
    return user;
  }

  remove(id: number): void {
    this.#users = this.#users.filter((u) => u.id !== Number(id));
    this.notify();
  }
}

export class UsersView {
  private $list: HTMLElement;
  private $err: HTMLElement;

  constructor(private model: UserModel, root: Document | HTMLElement = document) {
    this.$list = root.querySelector('#list') as HTMLElement;
    this.$err = root.querySelector('#error') as HTMLElement;

    // View подписывается на изменения Модели
    this.model.subscribe((users) => this.render(users));
    this.render(this.model.getAll());
  }

  render(users: User[]): void {
    this.$list.innerHTML = users
      .map(
        (u) => `
      <div class="card">
        <h3>Username - ${escapeHtml(u.name)}</h3>
        <p>Возраст - ${u.age}</p>
        <button data-id="${u.id}">Удалить</button>
      </div>`
      )
      .join('');
  }

  showError(msg: string): void {
    this.$err.textContent = msg;
  }
}

export class UserController {
  constructor(private model: UserModel, private view: UsersView, root: Document | HTMLElement = document) {
    const $name = root.querySelector('#username') as HTMLInputElement;
    const $age = root.querySelector('#age') as HTMLInputElement;
    const $btn = root.querySelector('#submit') as HTMLButtonElement;
    const $list = root.querySelector('#list') as HTMLElement;

    // Контроллер принимает ввод от пользователя и управляет Моделью
    $btn.addEventListener('click', () => {
      try {
        this.model.create({ username: $name.value, age: $age.value });
        $name.value = '';
        $age.value = '';
        this.view.showError('');
      } catch (e: any) {
        this.view.showError(e.message);
      }
    });

    $list.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.dataset?.id) {
        this.model.remove(Number(target.dataset.id));
      }
    });
  }
}