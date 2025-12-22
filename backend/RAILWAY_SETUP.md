# Railway Deployment Setup

## Проблема
Railway не може знайти директорію `backend` у snapshot під час деплою.

## Рішення

### Варіант 1: Backend в окремому репозиторії (рекомендовано)

Якщо backend має свій окремий репозиторій на GitHub:

1. **Створити репозиторій для backend** (якщо ще не створено):
   ```bash
   cd backend
   git remote add origin git@github.com:DesumovJP/PremiumFlora-Backend.git
   git push -u origin main
   ```

2. **У Railway Dashboard**:
   - Service Settings → Source → Repository
   - Вкажи правильний репозиторій: `DesumovJP/PremiumFlora-Backend`
   - Root Directory: залиш **порожнім** (або `/`)

### Варіант 2: Monorepo (backend і frontend в одному репо)

Якщо Railway налаштований на репозиторій `DesumovJP/PremiumFlora`:

1. **У Railway Dashboard**:
   - Service Settings → Deploy → Root Directory
   - Вкажи: `backend`
   - Переконайся, що в репозиторії `DesumovJP/PremiumFlora` є папка `backend/` з `package.json`

2. **Якщо backend не в репозиторії frontend**:
   - Скопіюй папку `backend` в репозиторій frontend
   - Або створи symlink (не рекомендовано для Railway)

## Поточні файли конфігурації

- `railway.toml` - основна конфігурація Railway
- `railway.json` - додаткова конфігурація (якщо потрібна)

## Перевірка

Після налаштування перевір:
1. Railway знаходить `backend/package.json`
2. Build команда: `yarn build`
3. Start команда: `yarn start`
4. Healthcheck: `/_health`


