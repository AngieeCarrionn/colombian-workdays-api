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
├── app.ts              # Configuración de Express
├── index.ts           # Punto de entrada
├── config/           # Configuraciones
├── controllers/      # Controladores
├── domain/          # Lógica de negocio
│   ├── entities/    # Entidades
│   ├── interfaces/  # Interfaces
│   └── services/    # Servicios
├── infrastructure/  # Implementaciones
├── routes/         # Rutas de la API
├── test/          # Tests
├── types/         # Tipos y definiciones
└── utils/         # Utilidades
```
## 🤝 Contribución

1. Fork del repositorio
2. Crear una rama para tu feature (git checkout -b feature/AmazingFeature)
3. Commit de tus cambios (git commit -m 'Add: AmazingFeature')
4. Push a la rama (git push origin feature/AmazingFeature)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT