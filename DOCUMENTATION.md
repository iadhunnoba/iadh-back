# Documentación del Proyecto: IADH Backend

Este proyecto es una API REST desarrollada con Node.js, Express y TypeORM para la gestión de usuarios, autenticación basada en roles y seguimiento de sesiones de RCP.

## Requisitos Previos

- **Node.js**: Versión 16 o superior.
- **MySQL**: Base de datos relacional para el almacenamiento de datos.
- **npm**: Gestor de paquetes de Node.js.

## Instalación y Configuración

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configuración de la Base de Datos**:
   Asegúrate de configurar los parámetros de conexión en el archivo `src/data-source.ts`.

3. **Configuración de JWT**:
   El secreto de JWT se encuentra en `src/config/config.ts`.

## Comandos de Ejecución

- **Modo Desarrollo**: Ejecuta el servidor con recarga automática.
  ```bash
  npm run dev
  ```
- **Compilación TypeScript**: Genera los archivos JavaScript en la carpeta de salida.
  ```bash
  npm run tsc
  ```
- **TypeORM CLI**: Comando para gestionar migraciones y otras tareas de TypeORM.
  ```bash
  npm run typeorm
  ```

## Tecnologías y Dependencias Principales

### Dependencias de Producción
- **express** (`^4.17.2`): Framework web para Node.js.
- **typeorm** (`0.3.17`): ORM para interactuar con la base de datos MySQL.
- **mysql2** (`^3.14.3`): Driver de conexión para MySQL.
- **jsonwebtoken** (`^9.0.1`): Implementación de JSON Web Tokens para autenticación.
- **bcryptjs** (`^2.4.3`): Librería para el hashing de contraseñas.
- **class-validator** (`^0.14.0`): Validación de decoradores para entidades y DTOs.
- **helmet** (`^7.0.0`): Middleware de seguridad para cabeceras HTTP.
- **cors** (`^2.8.5`): Habilita el intercambio de recursos de origen cruzado.
- **reflect-metadata** (`^0.1.13`): Necesario para los decoradores de TypeORM.

### Dependencias de Desarrollo
- **typescript** (`^5.1.6`): Lenguaje de programación.
- **ts-node-dev** (`^2.0.0`): Ejecución de TypeScript en desarrollo con recarga en caliente.

## Arquitectura y Funcionalidades Detalladas

### 1. Autenticación (`/auth`)
Gestión de acceso y seguridad mediante JWT.
- **`POST /auth/login`**: Inicia sesión y devuelve un token JWT.
- **`POST /auth/change-password`**: Permite a un usuario autenticado cambiar su propia contraseña. Requiere token JWT válido.

### 2. Gestión de Usuarios (`/users`)
Control total sobre las cuentas de usuario (Accesible para roles `admin` y `profesor`).
- **`GET /users`**: Obtiene una lista de todos los usuarios registrados.
- **`GET /users/students`**: Filtra y devuelve solo los usuarios con rol de estudiante.
- **`GET /users/:id`**: Obtiene los detalles de un usuario específico por su ID.
- **`POST /users`**: Crea un nuevo usuario. Realiza el hashing automático de la contraseña.
- **`PATCH /users/:id`**: Actualiza la información de un usuario existente.
- **`DELETE /users/:id`**: Elimina un usuario del sistema.

### 3. Sesiones de RCP (`/students/:id/rcp-sessions`)
Seguimiento de prácticas de RCP realizadas por los estudiantes. Accesible para `admin`, `profesor` y `estudiante`.
- **`POST /students/:id/rcp-sessions/start`**: Registra el inicio de una sesión de RCP para un estudiante.
- **`POST /students/:id/rcp-sessions/:sessionId/end`**: Finaliza una sesión de RCP, calculando la duración automáticamente y guardando los promedios de la maniobra.
- **`GET /students/:id/rcp-sessions`**: Recupera el historial de sesiones de RCP asociadas a un estudiante específico.

## Modelos de Datos (Entidades)

### User (Usuario)
- `id`: Identificador único.
- `username`: Email del usuario (debe ser único).
- `name` / `surname`: Nombre y apellido.
- `license`: Matrícula profesional (opcional).
- `studentIdNumber`: Legajo estudiantil (opcional).
- `role`: "admin", "profesor" o "estudiante".
- `password`: Almacenada de forma segura mediante hash.

### RcpSession (Sesión de RCP)
- `id`: Identificador de la sesión.
- `student`: Relación con la entidad User.
- `startedAt`: Fecha y hora de inicio.
- `endedAt`: Fecha y hora de fin.
- `duration`: Tiempo transcurrido en segundos.
- `avgPulmonaryPressure`: Presión pulmonar promedio durante la sesión.
- `avgVentilation`: Ventilación promedio durante la sesión.
- `avgCorrectPosition`: Porcentaje de posición correcta de la maniobra promedio.
- `observation`: Notas o comentarios adicionales del profesor sobre la sesión.

---
*Documentación generada el 1 de abril de 2026.*
