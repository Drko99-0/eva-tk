# 🚀 Inicio Rápido - Buscar token eva-tk

Guía rápida para buscar el token `eva-tk` en tus navegadores.

---

## 📋 Instalación

### 1. Requisitos

```bash
# Solo necesitas Python 3 (ya incluido en la mayoría de sistemas)
python3 --version

# Debería mostrar: Python 3.7 o superior
```

**No necesitas instalar nada más.** Todo usa la biblioteca estándar de Python.

### 2. Clonar o descargar

Si ya tienes el repositorio:
```bash
cd eva-tk/security-practice
```

---

## 🔍 Uso - Buscar el token

### Método 1: Script Python Mejorado (RECOMENDADO)

```bash
python3 find-eva-tk.py
```

**Esto buscará automáticamente en:**
- ✅ Chrome (Linux y Windows vía WSL)
- ✅ Chromium
- ✅ Microsoft Edge
- ✅ Brave Browser
- ✅ Firefox (Linux y Windows vía WSL)
- ✅ Todos los perfiles de usuario

**Salida:**
```
╔════════════════════════════════════════════════════════════════════╗
║               🔐 BUSCADOR DE TOKENS EN LOCALSTORAGE               ║
╚════════════════════════════════════════════════════════════════════╝

🔍 BUSCANDO TOKEN: 'eva-tk'

📱 Buscando en navegadores Chromium (Chrome, Edge, Brave)...
  • Chrome - Default
    ✅ Encontrados 1 token(s)

✅ ENCONTRADOS 1 TOKEN(S)

🎯 TOKEN #1
─────────────────────────────────────────────────────────────────
Navegador:  Chrome
Perfil:     Default
Ubicación:  /home/user/.config/google-chrome/Default/Local Storage/leveldb/000005.ldb

TOKEN COMPLETO:
─────────────────────────────────────────────────────────────────
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYTE5MDAyOTU5...
─────────────────────────────────────────────────────────────────

📋 DATOS DEL TOKEN (decodificados):
{
  "user": "a19002959",
  "ida": 1363822,
  ...
}
```

### Método 2: Script Bash Rápido

```bash
./quick-search.sh
```

Más rápido pero menos detallado.

### Método 3: Script Original Completo

```bash
python3 extract-localstorage.py
```

Versión original con más opciones.

---

## 📂 Dónde busca el script

### Chrome / Chromium / Edge / Brave (Linux)

```
~/.config/google-chrome/Default/Local Storage/leveldb/
~/.config/google-chrome/Profile 1/Local Storage/leveldb/
~/.config/chromium/Default/Local Storage/leveldb/
~/.config/microsoft-edge/Default/Local Storage/leveldb/
~/.config/BraveSoftware/Brave-Browser/Default/Local Storage/leveldb/
```

### Firefox (Linux)

```
~/.mozilla/firefox/*.default/storage/default/
~/.mozilla/firefox/*.default-release/storage/default/
```

### Chrome (Windows vía WSL)

```
/mnt/c/Users/TuUsuario/AppData/Local/Google/Chrome/User Data/Default/Local Storage/leveldb/
```

### Firefox (Windows vía WSL)

```
/mnt/c/Users/TuUsuario/AppData/Roaming/Mozilla/Firefox/Profiles/*.default/storage/default/
```

---

## 🎯 Ejemplos de Uso

### Buscar el token eva-tk

```bash
# Buscar eva-tk (por defecto)
python3 find-eva-tk.py

# El resultado se guarda en: tokens-encontrados.json
```

### Buscar otro token

```bash
# Buscar un token con otro nombre
python3 find-eva-tk.py "mi-otro-token"
```

### Decodificar el token encontrado

```bash
# Una vez encontrado, decodificarlo
python3 jwt-decoder.py "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Ver los resultados guardados

```bash
# Ver el JSON con todos los tokens encontrados
cat tokens-encontrados.json

# Ver formateado
python3 -m json.tool tokens-encontrados.json
```

---

## 🔧 Solución de Problemas

### "No se encontró el token"

**Causas comunes:**

1. **El navegador no tiene el token en localStorage**
   - Abre tu aplicación web en el navegador
   - Inicia sesión
   - Vuelve a ejecutar el script

2. **El navegador está en una ubicación diferente**
   - Verifica la ubicación: `ls ~/.config/`
   - Busca manualmente: `find ~ -name "Local Storage" 2>/dev/null`

3. **El token tiene otro nombre**
   - Abre DevTools (F12) en tu navegador
   - Ve a Application > Local Storage
   - Mira cómo se llama el token
   - Busca con ese nombre: `python3 find-eva-tk.py "nombre-real"`

4. **Permisos de archivos**
   - Algunos navegadores bloquean el acceso si están abiertos
   - Cierra el navegador y vuelve a intentar

### "Permission denied"

```bash
# El navegador puede estar usando los archivos
# Solución: Cierra completamente el navegador

# Chrome
killall chrome
killall chromium

# Firefox
killall firefox

# Luego vuelve a ejecutar
python3 find-eva-tk.py
```

### Ver qué navegadores están instalados

```bash
# Linux
ls ~/.config/

# Deberías ver carpetas como:
# google-chrome/
# chromium/
# mozilla/
# microsoft-edge/
# BraveSoftware/
```

---

## 📊 Comparar el token encontrado

Una vez que el script encuentra el token, puedes:

### 1. Copiarlo directamente de la salida

```
TOKEN COMPLETO:
─────────────────────────────────────────────────────────────────
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYTE5MDAyOTU5...
─────────────────────────────────────────────────────────────────
```

### 2. Compararlo con el token original

```bash
# Token encontrado por el script
TOKEN_ENCONTRADO="eyJhbGci..."

# Token que te dio tu aplicación
TOKEN_ORIGINAL="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYTE5MDAyOTU5..."

# Comparar
if [ "$TOKEN_ENCONTRADO" = "$TOKEN_ORIGINAL" ]; then
    echo "✅ Los tokens son IGUALES - Vulnerabilidad confirmada"
else
    echo "❌ Los tokens son diferentes"
fi
```

### 3. Decodificar ambos para comparar

```bash
# Decodificar el encontrado
python3 jwt-decoder.py "$TOKEN_ENCONTRADO" > encontrado.txt

# Decodificar el original
python3 jwt-decoder.py "$TOKEN_ORIGINAL" > original.txt

# Comparar
diff encontrado.txt original.txt
```

---

## 🎓 Flujo Completo de la Práctica

### Paso 1: Guardar tu token actual

```bash
# En el navegador, abre DevTools (F12)
# Console tab:
console.log(localStorage.getItem('eva-tk'));

# Copia el token y guárdalo
echo "eyJhbGci..." > mi-token-actual.txt
```

### Paso 2: Buscar con el script

```bash
python3 find-eva-tk.py
```

### Paso 3: Comparar

```bash
# Leer el token guardado
TOKEN_GUARDADO=$(cat mi-token-actual.txt)

# Leer el token encontrado (del JSON)
TOKEN_ENCONTRADO=$(python3 -c "import json; print(json.load(open('tokens-encontrados.json'))[0]['token'])")

# Comparar
if [ "$TOKEN_GUARDADO" = "$TOKEN_ENCONTRADO" ]; then
    echo "🎯 ¡ÉXITO! El script encontró tu token"
    echo "⚠️  Esto demuestra que localStorage es inseguro"
else
    echo "Los tokens no coinciden"
fi
```

### Paso 4: Analizar el token

```bash
# Decodificar para ver los datos
python3 jwt-decoder.py "$TOKEN_ENCONTRADO"
```

---

## 🛡️ Después de la Práctica

Una vez que compruebes la vulnerabilidad:

1. **Migra a httpOnly cookies**
   - Ver: `secure-implementation-example.js`

2. **Limpia localStorage**
   ```javascript
   // En la consola del navegador
   localStorage.removeItem('eva-tk');
   ```

3. **Implementa las recomendaciones**
   - Content Security Policy
   - HTTPS obligatorio
   - Tokens de corta duración

---

## 📝 Archivos Generados

Después de ejecutar el script:

```
security-practice/
├── tokens-encontrados.json    # Todos los tokens encontrados
├── encontrado.txt             # Análisis del token (si lo decodificaste)
└── mi-token-actual.txt        # Tu backup (si lo creaste)
```

---

## 🆘 Comandos Útiles

```bash
# Ver ayuda del script
python3 find-eva-tk.py --help

# Buscar en ubicación específica
find /home -name "*Local Storage*" 2>/dev/null

# Ver perfiles de Chrome
ls ~/.config/google-chrome/

# Ver perfiles de Firefox
ls ~/.mozilla/firefox/

# Buscar cualquier archivo que contenga "eva-tk"
grep -r "eva-tk" ~/.config/google-chrome/ 2>/dev/null | head -5

# Ver tokens guardados
cat tokens-encontrados.json | python3 -m json.tool

# Contar cuántos tokens se encontraron
python3 -c "import json; print(len(json.load(open('tokens-encontrados.json'))))"
```

---

## 📚 Siguiente Paso

```bash
# Lee el README completo para más información
cat README.md

# Abre la demo interactiva de XSS
firefox test-xss-vulnerability.html

# Estudia el código seguro
cat secure-implementation-example.js
```

---

**¿Necesitas ayuda?** Revisa el README.md completo o los comentarios en los scripts.
