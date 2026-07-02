/** Minimal but valid OpenAPI 3 document served at /api/docs. */
export const openapiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'SmartPhysics KZ API',
    version: '1.0.0',
    description: '7-сынып физика платформасының REST API құжаттамасы',
  },
  servers: [{ url: '/api' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/register': {
      post: { tags: ['Auth'], summary: 'Тіркелу', responses: { 201: { description: 'Created' } } },
    },
    '/auth/login': {
      post: { tags: ['Auth'], summary: 'Кіру', responses: { 200: { description: 'OK' } } },
    },
    '/auth/refresh': {
      post: { tags: ['Auth'], summary: 'Токенді жаңарту', responses: { 200: { description: 'OK' } } },
    },
    '/auth/logout': {
      post: { tags: ['Auth'], summary: 'Шығу', responses: { 200: { description: 'OK' } } },
    },
    '/auth/me': {
      get: { tags: ['Auth'], summary: 'Ағымдағы қолданушы', responses: { 200: { description: 'OK' } } },
    },
    '/quarters': { get: { tags: ['Catalog'], summary: 'Тоқсандар', responses: { 200: { description: 'OK' } } } },
    '/sections': { get: { tags: ['Catalog'], summary: 'Бөлімдер', responses: { 200: { description: 'OK' } } } },
    '/topics': { get: { tags: ['Catalog'], summary: 'Тақырыптар тізімі', responses: { 200: { description: 'OK' } } } },
    '/topics/{slug}': {
      get: { tags: ['Catalog'], summary: 'Тақырып', parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
    },
    '/topics/{id}/open': { post: { tags: ['Progress'], summary: 'Тақырыпты ашу', responses: { 200: { description: 'OK' } } } },
    '/topics/{id}/video-complete': { post: { tags: ['Progress'], summary: 'Видеоны аяқтау', responses: { 200: { description: 'OK' } } } },
    '/topics/{id}/simulation-complete': { post: { tags: ['Progress'], summary: 'Симуляцияны аяқтау', responses: { 200: { description: 'OK' } } } },
    '/topics/{id}/questions': { get: { tags: ['Quiz'], summary: 'Тест сұрақтары', responses: { 200: { description: 'OK' } } } },
    '/topics/{id}/quiz-attempts': { post: { tags: ['Quiz'], summary: 'Тест тапсыру', responses: { 200: { description: 'OK' } } } },
    '/profile': { get: { tags: ['Profile'], summary: 'Профиль', responses: { 200: { description: 'OK' } } } },
    '/profile/progress': { get: { tags: ['Profile'], summary: 'Прогресс', responses: { 200: { description: 'OK' } } } },
    '/profile/achievements': { get: { tags: ['Profile'], summary: 'Жетістіктер', responses: { 200: { description: 'OK' } } } },
    '/profile/activity': { get: { tags: ['Profile'], summary: 'Белсенділік', responses: { 200: { description: 'OK' } } } },
    '/admin/dashboard': { get: { tags: ['Admin'], summary: 'Админ дашборд', responses: { 200: { description: 'OK' } } } },
    '/admin/topics': { post: { tags: ['Admin'], summary: 'Тақырып қосу', responses: { 201: { description: 'Created' } } } },
    '/admin/questions': { post: { tags: ['Admin'], summary: 'Сұрақ қосу', responses: { 201: { description: 'Created' } } } },
    '/admin/students': { get: { tags: ['Admin'], summary: 'Оқушылар', responses: { 200: { description: 'OK' } } } },
  },
} as const;
