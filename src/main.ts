import { UserModel as MvpModel, UsersView as MvpView, UsersPresenter } from './mvp.js';
import { UserModel as MvcModel, UsersView as MvcView, UserController as MvcController } from './mvc.js';
import { UsersViewModel, UsersViewMVVM } from './mvvm.js';
import { InMemoryGateway, HtmlPresenter, AddUserUseCase, DeleteUserUseCase } from './clean.js';
import { InMemoryUserRepository, UserService, UserUI } from './onion.js';

function clearDOM() {
  ['list', 'error'].forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = ''; });
  ['submit', 'username', 'age'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.replaceWith(el.cloneNode(true));
  });
}

const initMVP = () => { clearDOM(); document.getElementById('pattern-title')!.textContent = 'Текущий паттерн: MVP'; new UsersPresenter(new MvpModel(), new MvpView()); };
const initMVC = () => { clearDOM(); document.getElementById('pattern-title')!.textContent = 'Текущий паттерн: MVC'; const m = new MvcModel(); new MvcController(m, new MvcView(m)); };
const initMVVM = () => { clearDOM(); document.getElementById('pattern-title')!.textContent = 'Текущий паттерн: MVVM'; new UsersViewMVVM(new UsersViewModel(new MvpModel())); };
const initClean = () => {
  clearDOM();
  document.getElementById('pattern-title')!.textContent = 'Текущий паттерн: Clean Architecture';
  const gw = new InMemoryGateway();
  const pr = new HtmlPresenter();
  const addUC = new AddUserUseCase(gw, pr);
  const delUC = new DeleteUserUseCase(gw, pr);
  
  document.getElementById('submit')?.addEventListener('click', () => {
    const $name = document.getElementById('username') as HTMLInputElement;
    const $age = document.getElementById('age') as HTMLInputElement;
    try { addUC.execute($name.value, $age.value); $name.value = ''; $age.value = ''; } catch(e:any) { document.getElementById('error')!.textContent = e.message; }
  });
  document.getElementById('list')?.addEventListener('click', (e) => {
    const id = (e.target as HTMLElement).dataset?.id;
    if (id) delUC.execute(Number(id));
  });
};
const initOnion = () => { clearDOM(); document.getElementById('pattern-title')!.textContent = 'Текущий паттерн: Onion Architecture'; new UserUI(new UserService(new InMemoryUserRepository())); };

const routes: Record<string, () => void> = {
  'btn-mvp': initMVP,
  'btn-mvc': initMVC,
  'btn-mvvm': initMVVM,
  'btn-clean': initClean,
  'btn-onion': initOnion
};

Object.keys(routes).forEach(id => {
  document.getElementById(id)?.addEventListener('click', (e) => {
    document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
    (e.target as HTMLElement).classList.add('active');
    routes[id]();
  });
});

// Старт по умолчанию
initMVP();