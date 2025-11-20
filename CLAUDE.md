# CLAUDE.md - Guía del Asistente IA para eva-tk

**Última Actualización:** 2025-11-20
**Repositorio:** Drko99-0/eva-tk
**Estado Actual:** Desarrollo activo - Proyecto de seguridad educativa

---

## 📋 Descripción del Proyecto

### Acerca de eva-tk
**eva-tk** es un proyecto de investigación de seguridad que demuestra vulnerabilidades críticas en el almacenamiento de tokens JWT en localStorage. El proyecto incluye herramientas de captura de tokens y documentación educativa sobre seguridad web.

### Estado Actual
- **Etapa:** Desarrollo activo
- **Propósito:** Investigación de seguridad y educación
- **Enfoque:** Demostración de vulnerabilidades en IDAT
- **Estrategia de Ramas:** Ramas de características con prefijo `claude/`
- **Rama Principal:** No establecida aún

---

## 🏗️ Estructura del Repositorio

### Estructura Actual
```
eva-tk/
├── .git/                  # Metadatos del repositorio Git
├── src/                   # Código fuente TypeScript
│   ├── core/             # Funcionalidad principal
│   ├── utils/            # Utilidades (decodificador JWT, etc.)
│   ├── types/            # Definiciones de tipos
│   └── cli/              # Interfaz de línea de comandos
├── security-practice/     # Herramientas educativas de seguridad
│   ├── README.md         # Documentación completa en español
│   └── INICIO-RAPIDO.md  # Guía rápida en español
├── tokens/               # Tokens capturados (git-ignorado)
├── dist/                 # Salida de compilación
├── README.md             # Documentación principal
├── CLAUDE.md             # Este archivo - Guía para IA
└── WINDOWS_INSTALL.md    # Guía de instalación Windows
```

### Componentes Principales

**Código TypeScript:**
- `chrome-profile-detector.ts` - Detecta perfiles de Chrome
- `leveldb-reader.ts` - Lee base de datos LevelDB
- `token-monitor.ts` - Monitoreo en tiempo real
- `token-storage.ts` - Gestión de almacenamiento
- `jwt-decoder.ts` - Decodificación de tokens

**Scripts Python (security-practice/):**
- `find-eva-tk.py` - Buscador de tokens
- `jwt-decoder.py` - Decodificador JWT
- `extract-localstorage.py` - Extractor de localStorage

---

## 🔧 Flujo de Trabajo de Desarrollo

### Estrategia de Ramificación Git

#### Convención de Nombres de Ramas
- **Ramas de características:** `claude/<descripcion>-<session-id>`
- **Rama actual de trabajo:** `claude/fix-todo-mi6rk485gu7qa1ki-01CJ64g6zpLabZbd3Uw2vwTr`

#### Reglas Importantes de Git
1. **SIEMPRE** desarrollar en la rama de características designada
2. **NUNCA** hacer push directo a main/master sin permiso
3. **SIEMPRE** usar `git push -u origin <nombre-rama>` para el primer push
4. Los nombres de rama DEBEN comenzar con `claude/` y terminar con el ID de sesión
5. Fallos de push (403) indican nomenclatura incorrecta de rama

### Directrices de Commits

#### Formato de Mensajes de Commit
```
<tipo>: <descripción breve>

<descripción detallada opcional>

<pie de página opcional>
```

**Tipos:**
- `feat:` - Nueva característica
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `refactor:` - Refactorización de código
- `test:` - Agregar o actualizar tests
- `chore:` - Tareas de mantenimiento
- `style:` - Formateo de código
- `security:` - Correcciones de seguridad

**Ejemplos:**
```bash
feat: agregar monitoreo continuo con flag --watch

docs: actualizar README con vulnerabilidades de IDAT

fix: resolver problema de lectura de LevelDB en Windows

security: prevenir inyección de comandos en rutas de archivo
```

### Política de Reintentos de Red
Para operaciones git (push/pull/fetch):
- Reintentar hasta 4 veces en fallos de red
- Usar backoff exponencial: 2s, 4s, 8s, 16s
- Solo reintentar en errores de red, no en errores de auth o validación

---

## 📝 Convenciones de Código

### Principios Generales
1. **Mantén la Simplicidad:** Prefiere claridad sobre inteligencia
2. **DRY:** No Te Repitas - extrae patrones comunes
3. **SOLID:** Sigue principios SOLID para código orientado a objetos
4. **Seguridad por Diseño:** Siempre considera implicaciones de seguridad
5. **Manejo de Errores:** Siempre maneja errores con gracia
6. **Documentación:** Documenta APIs públicas y lógica compleja

### Estilo de Código

#### Convenciones de Nomenclatura
- **Archivos:** kebab-case (`chrome-profile-detector.ts`)
- **Clases:** PascalCase (`ChromeProfileDetector`)
- **Funciones/Métodos:** camelCase (`detectProfiles`)
- **Constantes:** UPPER_SNAKE_CASE (`DEFAULT_CHECK_INTERVAL`)
- **Interfaces:** PascalCase con prefijo 'I' opcional (`ITokenData` o `TokenData`)

#### Organización de Archivos
```typescript
// 1. Importaciones (externas primero, luego internas)
import { Level } from 'level';
import { ChromeProfile } from './types';

// 2. Constantes
const DEFAULT_TIMEOUT = 5000;
const CHROME_USER_DATA_PATH = process.env.LOCALAPPDATA;

// 3. Tipos/Interfaces
interface TokenCapture {
  token: string;
  timestamp: number;
  profile: string;
}

// 4. Código principal
export class TokenMonitor {
  // implementación
}

// 5. Exportaciones
export { TokenCapture };
```

#### Patrón de Manejo de Errores
```typescript
try {
  // operación riesgosa
  const token = await extractToken(profile);
} catch (error) {
  // Registrar el error con contexto
  console.error('Fallo al extraer token:', {
    profile,
    error: error.message,
    stack: error.stack
  });

  // Re-lanzar o manejar con gracia
  throw new Error(`Fallo al extraer token del perfil ${profile}: ${error.message}`);
}
```

### Mejores Prácticas de Seguridad
🔒 **CRÍTICO:** Siempre verificar y prevenir:
- Inyección de comandos
- Inyección SQL (si se usa base de datos)
- XSS (Cross-Site Scripting)
- Traversal de rutas
- Deserialización insegura
- Validación de entrada inapropiada
- Secretos/credenciales hardcodeados

**Nunca hacer commit de:**
- API keys
- Contraseñas
- Claves privadas
- Archivos `.env` con secretos
- `credentials.json` o archivos similares
- Tokens JWT capturados
- El directorio `tokens/`

**Siempre validar entrada del usuario:**
```typescript
// ❌ MAL - vulnerable a path traversal
const profilePath = path.join(baseDir, userInput);

// ✅ BIEN - validar y sanitizar
function validateProfileName(name: string): string {
  // Solo permitir nombres de perfil válidos
  if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
    throw new Error('Nombre de perfil inválido');
  }
  // Prevenir path traversal
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    throw new Error('Caracteres no permitidos en nombre de perfil');
  }
  return name;
}
```

---

## 🧪 Directrices de Testing

### Estructura de Tests
```
tests/
├── unit/              # Tests rápidos, aislados
├── integration/       # Tests entre módulos
└── fixtures/          # Datos de prueba y mocks
```

### Principios de Testing
1. **Escribe tests para nuevas características** - TDD recomendado
2. **Mantén alta cobertura** - Apunta a >80% de cobertura
3. **Testea casos extremos** - No solo el camino feliz
4. **Usa nombres descriptivos** - Los nombres de tests deben explicar qué verifican
5. **Mantén tests aislados** - Sin estado compartido entre tests

### Convención de Nombres de Tests
```typescript
describe('ChromeProfileDetector', () => {
  describe('detectProfiles', () => {
    it('debería retornar lista de perfiles cuando Chrome está instalado', async () => {
      // implementación del test
    });

    it('debería lanzar error cuando Chrome no está instalado', async () => {
      // implementación del test
    });

    it('debería manejar rutas de Windows y Linux correctamente', async () => {
      // implementación del test
    });
  });
});
```

---

## 🤖 Directrices para Asistente IA

### Planificación de Tareas
1. **SIEMPRE usa TodoWrite** - Rastrea todas las tareas multi-paso
2. **Descompón tareas complejas** - Crea sub-tareas para claridad
3. **Actualiza estado en tiempo real** - Marca tareas como in_progress/completed inmediatamente
4. **Una tarea a la vez** - Solo una tarea debe estar en in_progress

### Estándares de Calidad de Código
1. **Lee antes de escribir** - Siempre lee archivos existentes antes de editar
2. **Prefiere editar sobre crear** - Modifica archivos existentes en lugar de crear nuevos
3. **Sin vulnerabilidades de seguridad** - Revisa código para OWASP Top 10
4. **Corrige inmediatamente** - Si escribes código inseguro, corrígelo de inmediato
5. **Usa seguridad de tipos** - Prefiere lenguajes tipados y verificación estricta de tipos

### Preferencias de Uso de Herramientas
1. **Operaciones de Archivos:**
   - Leer archivos: Usa herramienta `Read` (no `cat`)
   - Editar archivos: Usa herramienta `Edit` (no `sed/awk`)
   - Crear archivos: Usa herramienta `Write` (no `echo >`)

2. **Operaciones de Búsqueda:**
   - Patrones de archivos: Usa `Glob` (no `find`)
   - Búsqueda de contenido: Usa `Grep` (no `grep/rg`)
   - Exploración de código: Usa `Task` con agente `Explore`

3. **Operaciones Git:**
   - Siempre usa comandos completos: `git push -u origin <branch>`
   - Implementa lógica de reintentos para fallos de red
   - Nunca omitas hooks (no `--no-verify`)

### Estilo de Comunicación
1. **Sé conciso** - Los usuarios ven salida de terminal
2. **Sin emojis** - A menos que se solicite explícitamente
3. **Sin elogios excesivos** - Sé objetivo y factual
4. **Usa markdown** - Formato para legibilidad
5. **Incluye referencias de archivo** - Usa formato `archivo:línea`

### Ejemplo de Referencias de Archivos
Al referenciar código, usa este formato:
```
La autenticación del usuario se maneja en src/core/token-monitor.ts:42
La decodificación JWT se realiza en src/utils/jwt-decoder.ts:15
```

---

## 📚 Estándares de Documentación

### Documentación de Código
1. **APIs Públicas** - Deben tener comentarios JSDoc/TSDoc
2. **Lógica compleja** - Agrega comentarios inline explicando el "por qué"
3. **Definiciones de tipos** - Documenta todos los tipos personalizados
4. **Ejemplos** - Proporciona ejemplos de uso para APIs públicas

### Formato JSDoc
```typescript
/**
 * Monitorea perfiles de Chrome para tokens eva-tk en tiempo real
 *
 * @param profileName - Nombre del perfil a monitorear (ej. "Default", "Profile 2")
 * @param options - Opciones de configuración del monitor
 * @returns Promise que se resuelve cuando se captura un token
 * @throws {ProfileNotFoundError} Cuando el perfil especificado no existe
 * @throws {LevelDBError} Cuando falla la lectura de la base de datos
 *
 * @example
 * ```ts
 * const token = await monitorProfile('Profile 2', {
 *   interval: 500,
 *   autoSave: true
 * });
 * console.log('Token capturado:', token);
 * ```
 */
async function monitorProfile(
  profileName: string,
  options: MonitorOptions
): Promise<string> {
  // implementación
}
```

### Secciones del README
Mantener README.md actualizado con:
1. Descripción del proyecto
2. Advertencias de seguridad y avisos legales
3. Instrucciones de instalación
4. Guía de inicio rápido
5. Documentación de API
6. Directrices de contribución
7. Información de licencia

---

## 🔄 Integración Continua

### Verificaciones Pre-Commit
Antes de hacer commit, asegurar:
- [ ] El código compila/construye exitosamente
- [ ] Los tests pasan
- [ ] El linting pasa
- [ ] No hay declaraciones console.log (a menos que sea intencional)
- [ ] No hay comentarios TODO (o están rastreados en issues)
- [ ] No se incluyen tokens o datos sensibles

### Workflows Automatizados
Considerar configurar GitHub Actions para:
- Ejecutar tests en PRs
- Linting y verificación de tipos
- Construir artefactos
- Escaneo de seguridad
- Actualizaciones de dependencias

---

## 🚀 Directrices de Despliegue

### Checklist Pre-Despliegue
- [ ] Todos los tests pasando
- [ ] Documentación actualizada
- [ ] Changelog actualizado
- [ ] Versión aumentada (semantic versioning)
- [ ] Sin cambios breaking (o apropiadamente documentados)
- [ ] Auditoría de seguridad completada

### Versionado
Seguir [Semantic Versioning](https://semver.org/):
- **MAJOR:** Cambios breaking
- **MINOR:** Nuevas características (retrocompatibles)
- **PATCH:** Correcciones de bugs (retrocompatibles)

---

## 🐛 Consejos de Debugging

### Problemas Comunes
1. **Errores de importación** - Verifica rutas de archivo y exports
2. **Errores de tipo** - Verifica que las definiciones de tipo coincidan con el uso
3. **Fallos de build** - Limpia cache/node_modules y reconstruye
4. **Fallos de tests** - Verifica estado compartido entre tests

### Herramientas de Debugging
- Usa `console.log` con moderación (elimina antes de commit)
- Prefiere breakpoints del debugger en IDE
- Usa biblioteca de logging apropiada para producción
- Habilita source maps para mejores stack traces

---

## 📞 Obtener Ayuda

### Recursos
- **Issues del Repositorio:** Rastrea bugs y características
- **Pull Requests:** Revisión de código y colaboración
- **Documentación:** Mantén carpeta docs/ actualizada

### Para Asistentes IA
- Si la tarea no está clara, pide clarificación al usuario
- Si bloqueado por hooks, pide al usuario verificar configuración
- Si no estás seguro del enfoque, presenta opciones al usuario
- Siempre verifica suposiciones antes de hacer cambios

---

## 🎯 Prioridades Actuales

### Próximos Pasos Inmediatos
1. **Mantener funcionalidad de captura de tokens** - Asegurar que todas las características funcionen
2. **Mejorar documentación de seguridad** - Expandir guías educativas
3. **Agregar más navegadores** - Soporte para Firefox, Edge, Brave
4. **Mejorar manejo de errores** - Mensajes de error más informativos
5. **Agregar más tests** - Aumentar cobertura de tests

### Consideraciones Futuras
- Configurar pipeline CI/CD
- Agregar reporte de cobertura de código
- Configurar releases automatizados
- Configurar templates de issues/PR
- Agregar directrices de contribución
- Elegir y agregar licencia

---

## 📜 Registro de Cambios

### 2025-11-20 - Actualización Mayor
- Traducción completa de documentación al español
- Agregada sección detallada de vulnerabilidades de IDAT en README
- Actualizada guía CLAUDE.md con mejores prácticas de seguridad
- Mejoradas directrices para asistentes IA

### 2025-11-19 - Creación Inicial
- Creada guía CLAUDE.md comprensiva
- Establecidas convenciones de código y directrices
- Documentado flujo de trabajo git y estrategia de ramificación
- Configuradas directrices para asistente IA y mejores prácticas

---

## 🔖 Referencia Rápida

### Comandos Esenciales
```bash
# Verificar estado
git status

# Crear nueva rama
git checkout -b claude/nombre-caracteristica-<session-id>

# Hacer commit de cambios
git add .
git commit -m "tipo: descripción"

# Push al remoto
git push -u origin <nombre-rama>

# Pull de últimos cambios
git pull origin <nombre-rama>

# Construir proyecto
npm run build

# Ejecutar monitoreo
npm run monitor

# Ejecutar tests
npm test
```

### Formato de Referencias de Archivos
```
ruta_archivo:numero_linea
Ejemplo: src/core/token-monitor.ts:125
```

### Uso de Lista de Tareas
Siempre usa TodoWrite para:
- Tareas multi-paso (3+ pasos)
- Implementaciones complejas
- Listas de tareas proporcionadas por usuario
- Rastrear progreso a través de workflows

---

## ✅ Checklist para Asistentes IA

Antes de completar cualquier tarea:
- [ ] Usé TodoWrite para planificar y rastrear trabajo
- [ ] Leí archivos existentes antes de editar
- [ ] Seguí convenciones de ramificación git
- [ ] Verifiqué vulnerabilidades de seguridad
- [ ] Actualicé documentación si era necesario
- [ ] Ejecuté tests (si aplica)
- [ ] Hice commit con mensaje claro
- [ ] Hice push a la rama correcta

---

## 🔐 Consideraciones Especiales de Seguridad

Este proyecto es una **herramienta de seguridad educativa**. Al trabajar en él:

1. **Nunca mejores capacidades maliciosas** - Solo documenta, analiza, reporta
2. **Enfócate en educación** - El propósito es enseñar seguridad web
3. **Documenta vulnerabilidades** - Ayuda a mejorar sistemas, no a explotarlos
4. **Sigue divulgación responsable** - Reporta problemas apropiadamente
5. **Protege datos sensibles** - Nunca expongas tokens reales o información de usuario

---

**Nota:** Este documento debe actualizarse conforme el proyecto evoluciona. Manténlo sincronizado con la estructura de proyecto actual y convenciones.
