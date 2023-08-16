# Awesome Project Build with TypeORM
Tecnlogoias y librerias: 
Node.js, Express, Typescript, TypeORM (Para realizar la conexión a la base de datos), JWT (Para realizar la gestión del usuario, token y demás), bcryptjs (Nos permite encriptar el password del usuario), class-validator (Nos ayudara con las validaciones de los campos de la base de datos)

Esta API cuenta con un Auth (login y cambio de contraseña) y un crud de usuarios con roles incluidos, protegiendo las rutas en base al rol y el token generado con JsonWebToken (JWT).

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `data-source.ts` file
3. Run `npm start` command
