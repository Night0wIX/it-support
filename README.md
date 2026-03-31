# CRM Client Clustering v1.0.0

Програма для кластеризації клієнтів CRM-системи з використанням алгоритму K-Means.  
Візуалізація кластерів та аналіз результатів у зручному веб-інтерфейсі.

## Технології

- **Frontend:** React 18 + TypeScript, Vite, Recharts
- **Backend:** Node.js, Express, ml-kmeans, Winston (логування)
- **Тестування:** Jest

## Реалізовані функції

### Основний функціонал
- 📤 Завантаження CSV-файлів з даними клієнтів
- 🎲 Генерація тестових даних CRM (4 сегменти клієнтів)
- 🧮 Кластеризація K-Means з налаштуванням кількості кластерів (2–10)
- 🔍 Автоматичний пошук оптимального k (метод ліктя + Silhouette Score)
- 📊 Візуалізація: scatter plot, bar chart, elbow method, silhouette chart
- 💾 Експорт результатів у CSV
- 📋 Статистика по кожному кластеру (середні значення ознак)

### Якість та стабільність
- ✅ Валідація введення (мін. 2 ознаки, перевірка k, формат файлу)
- ✅ Зрозумілі повідомлення про помилки українською мовою
- ✅ Логування дій та помилок у файл `logs/app.log` (Winston)
- ✅ Конфігурація винесена у `config.json` (версія, порти, кольори, параметри кластеризації)
- ✅ Обробка некоректних даних без аварійного завершення
- ✅ Unit-тести для модуля кластеризації (Jest, 7 тестів)

## Структура проєкту

```
its/
├── config.json              # Конфігурація програми
├── .gitignore
├── README.md
├── server/                  # Express backend
│   ├── package.json
│   ├── src/
│   │   ├── index.js         # Сервер + API endpoints
│   │   ├── clustering.js    # Модуль кластеризації K-Means
│   │   └── logger.js        # Конфігурація логування
│   └── __tests__/
│       └── clustering.test.js  # Unit-тести
├── client/                  # React + TypeScript frontend
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx           # Головний компонент
│       ├── ClusterCharts.tsx # Візуалізація (графіки)
│       ├── api.ts            # HTTP клієнт
│       └── index.css         # Стилі
└── logs/                    # Логи (генеруються автоматично)
    └── app.log
```

## Запуск

### 1. Встановлення залежностей

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Запуск серверу (порт 3001)

```bash
cd server
npm run dev
```

### 3. Запуск клієнта (порт 5173)

```bash
cd client
npm run dev
```

Відкрити у браузері: http://localhost:5173

### Запуск тестів

```bash
cd server
npm test
```

## Конфігурація

Файл `config.json` містить:
- `app.version` — версія програми
- `server.port` — порт серверу (за замовчуванням 3001)
- `paths.log_file` — шлях до лог-файлу
- `ui.primaryColor` — основний колір інтерфейсу
- `clustering.defaultK` — кількість кластерів за замовчуванням
- `clustering.minK / maxK` — межі кількості кластерів

## Алгоритм

1. Стандартизація ознак (Z-score normalization)
2. Кластеризація K-Means з ініціалізацією kmeans++
3. Оцінка якості — Silhouette Score
4. Пошук оптимального k — метод ліктя (Elbow) + максимізація Silhouette

## Автор

Модульний контроль №1 — Розробка та тестування ПЗ  
Варіант 7: Кластеризація клієнтів CRM-системи
