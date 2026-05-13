# Proply

Plataforma SaaS para crear y optimizar propuestas comerciales como landing pages dinámicas.

## Tecnologías

- **Frontend**: Next.js 14 con App Router
- **Backend**: Next.js API Routes
- **Base de datos**: PostgreSQL con Prisma ORM
- **Autenticación**: Clerk
- **IA**: OpenAI
- **Styling**: Tailwind CSS
- **Deploy**: Vercel

## Instalación

1. Clona el repositorio
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Configura variables de entorno en `.env.local`
4. Configura la base de datos:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Estructura del Proyecto

- `src/app/` - Páginas y layouts de Next.js
- `src/components/` - Componentes reutilizables
- `src/lib/` - Utilidades y configuraciones
- `src/types/` - Definiciones de tipos TypeScript
- `prisma/` - Esquema de base de datos

## Funcionalidades Principales

- Creación de propuestas (servicios y productos)
- Versionado de propuestas
- Tracking de comportamiento del cliente
- Catálogo de productos
- Generación con IA
- Multi-tenant architecture

## Desarrollo

Para contribuir, asegúrate de seguir las mejores prácticas de Next.js y TypeScript.