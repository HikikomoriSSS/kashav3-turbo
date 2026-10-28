import { User, escapeHtml } from './shared.js';

export interface IGateway {
  save(u: User): void;
  delete(id: number): void;
  getAll(): User[];
}

export interface IPresenter {
  present(users: User[]): void;
}

export class InMemoryGateway implements IGateway {
  #users: User[] = [];
  #next = 1;
  save(u: User) { u.id = this.#next++; this.#users.push(u); }
  delete(id: number) { this.#users = this.#users.filter(u => u.id !== id); }
  getAll() { return [...this.#users]; }
}

export class HtmlPresenter implements IPresenter {
  present(users: User[]) {
    const $list = document.getElementById('list');
    if ($list) {
      $list.innerHTML = users.map(u => `
        <div class="card">
          <h3>Имя - ${escapeHtml(u.name)}</h3>
          <p>Возраст - ${u.age}</p>
          <button data-id="${u.id}">Удалить</button>
        </div>
      `).join('');
    }
  }
}

export class AddUserUseCase {
  constructor(private gateway: IGateway, private presenter: IPresenter) {}
  execute(name: string, age: string) {
    this.gateway.save(new User(name, age));
    this.presenter.present(this.gateway.getAll());
  }
}

export class DeleteUserUseCase {
  constructor(private gateway: IGateway, private presenter: IPresenter) {}
  execute(id: number) {
    this.gateway.delete(id);
    this.presenter.present(this.gateway.getAll());
  }
}