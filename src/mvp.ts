/**
 * Паттерн MVP (Model-View-Presenter)
 *
 * Особенность: View полностью пассивная и ничего не знает о Model. 
 * Посредник (Presenter) слушает события View, вызывает методы Model, 
 * а затем явно запрашивает данные и принудительно обновляет View (`view.render()`).
 */
import { User, escapeHtml } from './shared.js';

export class UserModel {
  #users: User[] = [];
  #nextId = 1;

  getAll(): User[] {
    return [...this.#users];
  }

  add(username: string, age: number | string): User {
    const u = new User(username, age, this.#nextId++);
    this.#users.push(u);
    return u;
  }

  remove(id: number): void {
    this.#users = this.#users.filter((u) => u.id !== id);
  }
}

export interface IUsersView {
  onAdd(handler: (name: string, age: string) => void): void;
  onDelete(handler: (id: number) => void): void;
  render(users: User[]): void;
  showError(msg: string): void;
  clearForm(): void;
}

export class UsersView implements IUsersView {
  private $name: HTMLInputElement;
  private $age: HTMLInputElement;
  private $btn: HTMLButtonElement;
  private $list: HTMLElement;
  private $err: HTMLElement;

  constructor(root: Document | HTMLElement = document) {
    this.$name = root.querySelector('#username') as HTMLInputElement;
    this.$age = root.querySelector('#age') as HTMLInputElement;
    this.$btn = root.querySelector('#submit') as HTMLButtonElement;
    this.$list = root.querySelector('#list') as HTMLElement;
    this.$err = root.querySelector('#error') as HTMLElement;
  }

  onAdd(handler: (name: string, age: string) => void): void {
    this.$btn.addEventListener('click', () => handler(this.$name.value, this.$age.value));
  }

  onDelete(handler: (id: number) => void): void {
    this.$list.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const id = target.dataset?.id;
      if (id) handler(Number(id));
    });
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

  clearForm(): void {
    this.$name.value = '';
    this.$age.value = '';
    this.showError('');
  }
}

export class UsersPresenter {
  constructor(private model: UserModel, private view: IUsersView) {
    view.onAdd((name, age) => this.add(name, age));
    view.onDelete((id) => this.remove(id));
    this.refresh();
  }

  add(name: string, age: string): void {
    try {
      this.model.add(name, age);
      this.view.clearForm();
      this.refresh(); // Явное обновление View
    } catch (e: any) {
      this.view.showError(e.message);
    }
  }

  remove(id: number): void {
    this.model.remove(id);
    this.refresh();
  }

  refresh(): void {
    this.view.render(this.model.getAll());
  }
}