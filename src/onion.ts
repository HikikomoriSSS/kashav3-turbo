import { User, escapeHtml } from './shared';

// Core Interface
export interface IUserRepository {
  getAll(): User[];
  add(username: string, age: number | string): User;
  remove(id: number): void;
}

// Services Layer
export class UserService {
  constructor(private repo: IUserRepository) {}

  getUsers(): User[] {
    return this.repo.getAll();
  }

  createUser(name: string, age: number | string): User {
    return this.repo.add(name, age);
  }

  deleteUser(id: number): void {
    this.repo.remove(id);
  }
}

// Infrastructure Layer
export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];
  private nextId = 1;

  getAll(): User[] {
    return [...this.users];
  }

  add(username: string, age: number | string): User {
    const user = new User(username, age, this.nextId++);
    this.users.push(user);
    return user;
  }

  remove(id: number): void {
    this.users = this.users.filter((u) => u.id !== id);
  }
}

// UI Layer
export class UserUI {
  private $name: HTMLInputElement;
  private $age: HTMLInputElement;
  private $btn: HTMLButtonElement;
  private $list: HTMLElement;
  private $err: HTMLElement;

  constructor(private service: UserService, root: Document | HTMLElement = document) {
    this.$name = root.querySelector('#username') as HTMLInputElement;
    this.$age = root.querySelector('#age') as HTMLInputElement;
    this.$btn = root.querySelector('#submit') as HTMLButtonElement;
    this.$list = root.querySelector('#list') as HTMLElement;
    this.$err = root.querySelector('#error') as HTMLElement;

    this.bindEvents();
    this.render();
  }

  private bindEvents(): void {
    this.$btn.addEventListener('click', () => {
      try {
        this.service.createUser(this.$name.value, this.$age.value);
        this.$name.value = '';
        this.$age.value = '';
        this.$err.textContent = '';
        this.render();
      } catch (e: any) {
        this.$err.textContent = e.message;
      }
    });

    this.$list.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const id = target.dataset?.id;
      if (id) {
        this.service.deleteUser(Number(id));
        this.render();
      }
    });
  }

  private render(): void {
    const users = this.service.getUsers();
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
}