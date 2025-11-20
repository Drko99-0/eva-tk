# 🪟 Guía de Instalación para Windows - eva-tk

Guía completa para configurar y usar eva-tk en Windows.

## 📋 Requisitos Previos

### 1. Instalar Node.js

**Descargar Node.js (se recomienda versión LTS):**
- Visitar: https://nodejs.org/
- Descargar el Instalador de Windows (.msi)
- Ejecutar el instalador y seguir las instrucciones
- Aceptar las opciones predeterminadas

**Verificar instalación:**
```cmd
node --version
npm --version
```

Deberías ver números de versión como:
```
v20.11.0
10.2.4
```

### 2. Instalar Git (Opcional pero recomendado)

**Descargar Git:**
- Visitar: https://git-scm.com/download/win
- Descargar y ejecutar el instalador
- Usar opciones predeterminadas

**Verificar instalación:**
```cmd
git --version
```

## 🚀 Instalando eva-tk

### Opción 1: Clonar desde GitHub (Recomendado)

```cmd
# Navegar a tu directorio preferido
cd C:\Users\TuNombreDeUsuario\Documents

# Clonar el repositorio
git clone https://github.com/Drko99-0/eva-tk.git

# Navegar al directorio
cd eva-tk

# Instalar dependencias
npm install

# Compilar el proyecto
npm run build
```

### Opción 2: Descargar ZIP

1. Descargar el ZIP desde GitHub
2. Extraer a una carpeta (ej., `C:\Users\TuNombreDeUsuario\Documents\eva-tk`)
3. Abrir Command Prompt o PowerShell
4. Navegar a la carpeta:
   ```cmd
   cd C:\Users\TuNombreDeUsuario\Documents\eva-tk
   ```
5. Instalar y compilar:
   ```cmd
   npm install
   npm run build
   ```

## 🎯 Inicio Rápido

### Encontrar tu Perfil de Chrome

Primero, identifica qué perfil de Chrome tiene el token eva-tk:

```cmd
npm run dev -- profiles
```

Esto mostrará algo como:
```
🔍 Perfiles de Chrome Detectados:

  ✓ Activo Default
     C:\Users\Idat\AppData\Local\Google\Chrome\User Data\Default\Local Storage\leveldb

  ✓ Activo Profile 2
     C:\Users\Idat\AppData\Local\Google\Chrome\User Data\Profile 2\Local Storage\leveldb

Total: 2 perfiles, 2 activos
```

### Iniciar Monitoreo

**Monitorear todos los perfiles (recomendado):**
```cmd
npm run monitor
```

**Monitorear perfil específico:**
```cmd
npm run dev -- monitor "Profile 2"
```

### Qué Esperar

Cuando el monitoreo inicia, verás:
```
🚀 Monitor de Tokens eva-tk

🔍 Monitoreando perfil: Profile 2
📂 Ruta: C:\Users\Idat\AppData\Local\...\leveldb
⏱️  Intervalo de verificación: 500ms
💾 Auto-guardado: habilitado

⏳ Esperando token eva-tk...

Presiona Ctrl+C para detener el monitoreo
```

Cuando se capture un token:
```
🎯 ¡TOKEN CAPTURADO!

📅 Hora: 20/1/2025, 3:45:12 PM
👤 Perfil: Profile 2
🔑 Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

📋 Información Decodificada:
   Usuario: ln6121081
   ID Alumno: 1761191
   ID Usuario: 474647
   Sede: LN
   Carrera: IDAT
   Expira: 22/1/2025, 11:30:00 AM

💾 Token guardado automáticamente
```

## 📁 ¿Dónde se Guardan los Tokens?

Los tokens se guardan en la carpeta `tokens` dentro de tu directorio eva-tk:

```
C:\Users\TuNombreDeUsuario\Documents\eva-tk\tokens\
  ├── captured-tokens.json    # Historial de todos los tokens
  └── latest-token.txt        # Token más reciente
```

### Ver Último Token

```cmd
npm run dev -- show-latest
```

### Ver Todos los Tokens Capturados

```cmd
npm run dev -- history
```

## 🔧 Comandos Comunes

### Comandos de Monitoreo

```cmd
# Monitorear todos los perfiles
npm run monitor

# Monitorear perfil específico
npm run dev -- monitor "Profile 2"

# Monitorear con salida detallada
npm run dev -- monitor --verbose

# Monitorear con intervalo de 1 segundo
npm run dev -- monitor --interval 1000

# Monitorear sin auto-guardado
npm run dev -- monitor --no-save
```

### Comandos de Extracción

```cmd
# Intentar extraer token ahora (una vez)
npm run extract

# Intentar todos los perfiles
npm run dev -- extract --all

# Extraer y guardar
npm run dev -- extract --save
```

### Comandos de Utilidad

```cmd
# Listar perfiles de Chrome
npm run dev -- profiles

# Decodificar un token
npm run dev -- decode eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Mostrar último token capturado
npm run dev -- show-latest

# Mostrar historial de capturas
npm run dev -- history
```

## 🐛 Resolución de Problemas

### "No se encontraron perfiles de Chrome"

**Verificar instalación de Chrome:**
```cmd
# Verificar que esta ruta existe
dir "%LOCALAPPDATA%\Google\Chrome\User Data"
```

**Si la ruta no existe:**
- Asegúrate de que Chrome esté instalado
- Inicia sesión en Chrome al menos una vez
- Sincroniza Chrome si usas múltiples dispositivos

### "Token no encontrado"

**Asegúrate de estar conectado:**
1. Abre Chrome
2. Ve al sitio web que crea el token eva-tk
3. Inicia sesión en tu cuenta
4. Deja el navegador abierto
5. Ejecuta el monitor en otra terminal

**Intenta todos los perfiles:**
```cmd
npm run dev -- extract --all
```

### "Fallo al leer LevelDB"

**Chrome está bloqueando la base de datos:**

**Opción 1: Usar modo monitor (funciona con archivos bloqueados)**
```cmd
npm run monitor
```

**Opción 2: Cerrar Chrome completamente**
1. Cierra todas las ventanas de Chrome
2. Verifica el Administrador de Tareas (Ctrl+Shift+Esc)
3. Finaliza todos los procesos de Chrome
4. Intenta extraer nuevamente:
   ```cmd
   npm run extract
   ```

### "npm no se reconoce"

**Node.js no instalado o no en PATH:**
1. Reinstala Node.js desde https://nodejs.org/
2. Durante la instalación, marca "Agregar a PATH"
3. Reinicia tu terminal/CMD
4. Verifica: `node --version`

### "No se puede encontrar módulo"

**Dependencias no instaladas:**
```cmd
# Eliminar node_modules y reinstalar
rmdir /s node_modules
npm install
npm run build
```

### Los nombres de perfil siguen cambiando

**Los nombres de perfil de Chrome pueden cambiar (Profile 1, Profile 2, etc.)**

**Solución: Usar flag --all**
```cmd
npm run dev -- monitor --all
```

Esto monitorea TODOS los perfiles automáticamente.

## 💡 Consejos y Mejores Prácticas

### 1. Mantener el Monitor Ejecutándose

Inicia el monitor ANTES de iniciar sesión en el sitio web:
```cmd
npm run monitor
```

Luego inicia sesión - el token será capturado inmediatamente.

### 2. Usar Modo Detallado para Depuración

```cmd
npm run dev -- monitor --verbose
```

Muestra todos los cambios de archivo y verificaciones.

### 3. Monitorear Todos los Perfiles

Si no estás seguro de qué perfil usar:
```cmd
npm run dev -- monitor --all
```

### 4. Verificar Expiración del Token

```cmd
npm run dev -- show-latest
```

Muestra cuándo expira el token.

### 5. Copiar Token Fácilmente

Los tokens están en `tokens\latest-token.txt`

Abrir en Notepad:
```cmd
notepad tokens\latest-token.txt
```

## 🔐 Mejores Prácticas de Seguridad

### ¡NO Compartas Tus Tokens!

Los tokens son como contraseñas. Dan acceso a tu cuenta.

**Nunca:**
- Publiques tokens en línea
- Compartas tokens en chat/email
- Hagas commit de tokens en git
- Almacenes tokens en lugares públicos

**La carpeta `tokens/` está en git-ignore por defecto** - los tokens no se harán commit.

### Asegura Tus Tokens

```cmd
# La carpeta de tokens
C:\Users\TuNombreDeUsuario\Documents\eva-tk\tokens\
```

Asegúrate de que solo tú tengas acceso a esta carpeta.

## 📱 Ejecutar al Inicio (Opcional)

### Crear un Archivo Batch

Crear `start-eva-tk.bat`:
```batch
@echo off
cd C:\Users\TuNombreDeUsuario\Documents\eva-tk
npm run monitor
pause
```

### Crear Acceso Directo en Escritorio

1. Clic derecho en `start-eva-tk.bat`
2. Enviar a → Escritorio (crear acceso directo)
3. Doble clic en el acceso directo para iniciar monitoreo

### ⚠️ ADVERTENCIA: Configuración como Servicio del Sistema

**NOTA DE SEGURIDAD IMPORTANTE:**

Esta herramienta puede configurarse para ejecutarse automáticamente al inicio del sistema, lo cual demuestra una **vulnerabilidad de persistencia**. Esto es parte de la demostración de seguridad.

**Métodos para Inicio Automático:**

#### Método 1: Carpeta de Inicio de Windows
```cmd
# Copiar el script batch a la carpeta de inicio
copy start-eva-tk.bat "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\"
```

#### Método 2: Tarea Programada
```cmd
# Crear tarea que se ejecuta al inicio
schtasks /create /tn "EVA-TK Monitor" /tr "C:\ruta\a\eva-tk\start-eva-tk.bat" /sc onlogon
```

#### Método 3: Registro de Windows (Avanzado)
```reg
[HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run]
"EVA-TK"="C:\\ruta\\a\\eva-tk\\start-eva-tk.bat"
```

**⚠️ Implicaciones de Seguridad:**

1. **Persistencia:** El script se ejecuta automáticamente en cada inicio
2. **Captura Silenciosa:** Captura tokens sin intervención del usuario
3. **Difícil de Detectar:** Usuarios no técnicos pueden no notar
4. **Escalación:** No requiere privilegios de administrador
5. **Exfiltración:** Puede enviar tokens a servidor remoto

**Esta capacidad demuestra por qué el almacenamiento de tokens en localStorage es inseguro.**

## 🆘 Obtener Ayuda

### Verificar Logs

La mayoría de errores se muestran en la terminal. Busca:
- ❌ Mensajes de error
- ⚠️ Advertencias
- Problemas de rutas

### Mensajes de Error Comunes

**"ENOENT: no such file or directory"**
- La ruta no existe
- Verifica nombre de perfil con `npm run dev -- profiles`

**"EBUSY: resource busy or locked"**
- Chrome tiene la base de datos bloqueada
- Usa modo monitor en lugar de extract

**"Cannot read properties of undefined"**
- Dependencias no compiladas
- Ejecuta `npm run build`

### ¿Sigues Teniendo Problemas?

1. Revisa esta guía nuevamente
2. Verifica que Node.js esté instalado: `node --version`
3. Verifica dependencias: `npm install`
4. Recompila: `npm run build`
5. Intenta modo monitor: `npm run monitor`

## 🚀 Uso Avanzado

### Intervalo de Verificación Personalizado

```cmd
# Verificar cada 100ms (más rápido, más CPU)
npm run dev -- monitor --interval 100

# Verificar cada 2 segundos (más lento, menos CPU)
npm run dev -- monitor --interval 2000
```

### Monitorear Ruta Específica

Edita `src/core/chrome-profile-detector.ts` para agregar rutas personalizadas.

### Exportar Token a Archivo

Después de la captura, copiar desde:
```cmd
type tokens\latest-token.txt
```

## 📚 Próximos Pasos

1. **Familiarízate con los comandos**
   - Prueba `npm run dev -- profiles`
   - Prueba `npm run dev -- extract --all`
   - Prueba `npm run monitor`

2. **Configura flujo de trabajo de monitoreo**
   - Inicia monitor antes de iniciar sesión
   - Deja que capture el token
   - Detén con Ctrl+C

3. **Usa el token capturado**
   - Encuéntralo en `tokens\latest-token.txt`
   - Úsalo para tu aplicación/automatización

---

**Consejos específicos de Windows:**
- Usa Command Prompt o PowerShell (no Git Bash para mejor compatibilidad)
- Las rutas usan barras invertidas: `C:\Users\...`
- Usa comillas para rutas con espacios: `"Profile 2"`

**¡Feliz captura de tokens!** 🎯

---

## 🔴 ADVERTENCIA FINAL

Esta herramienta es para **PROPÓSITOS EDUCATIVOS Y DE INVESTIGACIÓN DE SEGURIDAD ÚNICAMENTE**.

**Demuestra vulnerabilidades críticas que deben ser corregidas:**
- Almacenamiento inseguro de tokens en localStorage
- Falta de protección httpOnly
- Posibilidad de persistencia y ejecución automática
- Escalación sin privilegios administrativos

**Úsala éticamente y responsablemente.**
