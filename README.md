# API de Fechas Hábiles - Colombia

API REST desarrollada en **TypeScript** que calcula fechas hábiles en Colombia, considerando:
- Días festivos nacionales en Colombia
- Horarios laborales (8:00 a.m. a 5:00 p.m.)
- Hora local de Colombia (America/Bogota)
- Conversión final a UTC

## 🚀 Características

- Cálculo preciso de fechas y horas hábiles
- Manejo automático de festivos colombianos
- Respeta horario laboral (8:00 AM - 5:00 PM)
- Zona horaria Colombia (America/Bogota)
- Respuestas en formato UTC para compatibilidad global
- Validación robusta de parámetros
- Manejo de errores detallado

## 🛠️ Tecnologías

- Node.js
- TypeScript
- Express.js
- Luxon (manejo de fechas y zonas horarias)
- Vitest (testing)
- CORS habilitado

## 📋 API Endpoints

### GET /api/business-date

Calcula una fecha hábil basada en los parámetros proporcionados.

#### Parámetros de consulta:

- `date` (opcional): Fecha inicial en formato ISO (default: fecha actual)
- `days` (opcional): Número de días hábiles a añadir/restar
- `hours` (opcional): Número de horas hábiles a añadir/restar

#### Ejemplo de uso:

```bash
GET /api/business-date?date=2023-10-28T14:00:00Z&days=2&hours=4
```

#### Respuesta:

```json
{
    "date": "2023-10-31T19:00:00Z"
}
```

## 🔧 Instalación y Ejecución

```bash
# Clonar el repositorio
git clone https://github.com/AngieeCarrionn/colombian-workdays-api.git
cd colombian-workdays-api

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir y ejecutar en producción
npm run build
npm start
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Ejecutar tests en modo watch
npm run test:watch
```

## 🏗️ Estructura del Proyecto

```
src/
├── config/          → configuración y constantes globales
├── controllers/     → lógica HTTP (manejo de requests/responses)
├── domain/          → lógica de negocio (entidades, interfaces, servicios de dominio)
├── infrastructure/  → integración externa (repositorios, servicios externos)
├── routes/          → endpoints Express
├── test/            → pruebas unitarias
├── types/           → tipados compartidos y errores
├── utils/           → funciones utilitarias (helpers de fechas, validadores)
├── dist/ # Código compilado de TypeScript listo para despliegue
│
├── deploy_aws/      → Infraestructura como código (IaC) con AWS CDK
│ ├── bin/           → Punto de entrada del CDK (colombian-workdays.ts)
│ ├── lib/           → Definición del Stack principal (Lambda + API Gateway)
│ └── tsconfig.json  → Configuración TS para CDK
│
├── node_modules/    → Dependencias instaladas (ignoradas en Git)
├── .gitignore       → Exclusiones de control de versiones
├── package.json     → Dependencias y scripts del proyecto
├── tsconfig.json    → Configuración de compilación TypeScript (código fuente)
└── README.md        → Documentación del proyecto
```
## 🤝 Contribución

1. Fork del repositorio
2. Crear una rama para tu feature (git checkout -b feature/AmazingFeature)
3. Commit de tus cambios (git commit -m 'Add: AmazingFeature')
4. Push a la rama (git push origin feature/AmazingFeature)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT