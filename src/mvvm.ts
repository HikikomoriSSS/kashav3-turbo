/**
 *Паттерн MVVM (Model-View-ViewModel)
 * 
 * Особенность: Использование реактивных свойств (`Observable`) и команд (`Command`). 
 * View подписывается на свойства ViewModel, а при изменении данных интерфейс обновляется автоматически.
 */
import { User, escapeHtml } from './shared.js';
import { UserModel } from './mvp.js';

export type Subscriber<T> = (value: T) => void;

export class Observable<T> {
  #value: T;
  #subs: Subscriber<T>[] = [];

  constructor(initial: T) {
    this.#value = initial;
  }

  get value(): T {
    return this.#value;
  }

  set value(newValue: T) {
    this.#value = newValue;
    this.#notify();
  }

  subscribe(fn: Subscriber<T>): void {
    this.#subs.push(fn);
    fn(this.#value);
  }

  #notify(): void {
    this.#subs.forEach((fn) => fn(this.#value));
  }
}

export class Command<T extends (...args: any[]) => any> {
  constructor(public action: T) {}

  execute(...args: Parameters<T>): ReturnType<T> {
    return this.action(...args);
  }
}

export class UsersViewModel {
  users = new Observable<User[]>([]);
  name = new Observable<string>('');
  age = new Observable<string>('');
  error = new Observable<string>('');

  addCmd: Command<() => void>;
  removeCmd: Command<(id: number) => void>;

  constructor(private model: UserModel) {
    this.addCmd = new Command(() => this.add());
    this.removeCmd = new Command((id: number) => this.remove(id));
  }

  add(): void {
    try {
      this.model.add(this.name.value, this.age.value);
      this.users.value = this.model.getAll();
      this.name.value = '';
      this.age.value = '';
      this.error.value = '';
    } catch (e: any) {
      this.error.value = e.message;
    }
  }

  remove(id: number): void {
    this.model.remove(id);
    this.users.value = this.model.getAll();
  }
}

export class UsersViewMVVM {
  constructor(viewModel: UsersViewModel, root: Document | HTMLElement = document) {
    const $name = root.querySelector('#username') as HTMLInputElement;
    const $age = root.querySelector('#age') as HTMLInputElement;
    const $btn = root.querySelector('#submit') as HTMLButtonElement;
    const $list = root.querySelector('#list') as HTMLElement;
    const $err = root.querySelector('#error') as HTMLElement;

    // Двусторонняя привязка данных (Data Binding)
    $name.addEventListener('input', () => (viewModel.name.value = $name.value));
    $age.addEventListener('input', () => (viewModel.age.value = $age.value));
    $btn.addEventListener('click', () => viewModel.addCmd.execute());

    $list.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const id = target.dataset?.id;
      if (id) viewModel.removeCmd.execute(Number(id));
    });

    viewModel.name.subscribe((v) => ($name.value = v));
    viewModel.age.subscribe((v) => ($age.value = v));
    viewModel.error.subscribe((v) => ($err.textContent = v));
    viewModel.users.subscribe((users) => {
      $list.innerHTML = users
        .map(
          (u) => `
        <div class="card">
          <h3>Username - ${escapeHtml(u.name)}</h3>
          <p>Возраст - ${u.age}</p>
          <button data-id="${u.id}">Удалить</button>
        </div>`
        )
        .join('');
    });
  }
}