/**
 * EJEMPLO DE IMPLEMENTACIÓN SEGURA
 * Migración de localStorage a httpOnly cookies
 */

// ============================================================================
// BACKEND - Node.js / Express
// ============================================================================

const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET; // ¡NUNCA hardcodear!
const REFRESH_SECRET = process.env.REFRESH_SECRET;

// Middleware de seguridad
app.use(helmet());
app.use(cookieParser());
app.use(express.json());

// Headers de seguridad adicionales
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.idat.edu.pe"
  );

  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
});
app.use(limiter);

// Rate limiting estricto para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // máximo 5 intentos de login
  message: 'Demasiados intentos de login, intenta de nuevo más tarde'
});

// ============================================================================
// FUNCIONES DE TOKEN
// ============================================================================

/**
 * Genera un access token (corta duración)
 */
function generateAccessToken(user) {
  return jwt.sign(
    {
      user: user.username,
      ida: user.ida,
      idu: user.idu,
      // ... otros datos necesarios
    },
    JWT_SECRET,
    { expiresIn: '15m' } // 15 minutos
  );
}

/**
 * Genera un refresh token (larga duración)
 */
function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user.id },
    REFRESH_SECRET,
    { expiresIn: '7d' } // 7 días
  );
}

/**
 * Verifica un token
 */
function verifyToken(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
}

// ============================================================================
// ENDPOINTS
// ============================================================================

/**
 * Login - MÉTODO SEGURO
 */
app.post('/api/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validar credenciales (ejemplo)
    const user = await authenticateUser(username, password);

    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    // Generar tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Guardar refresh token en base de datos (para poder revocar)
    await saveRefreshToken(user.id, refreshToken);

    // Configurar cookies SEGURAS
    res.cookie('eva-tk', accessToken, {
      httpOnly: true,              // ← NO accesible por JavaScript
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'strict',          // ← Protección CSRF
      maxAge: 15 * 60 * 1000,      // 15 minutos
      path: '/'
    });

    res.cookie('eva-refresh', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      path: '/api/refresh'  // Solo accesible en endpoint de refresh
    });

    // Log de seguridad
    console.log(`[SECURITY] Login exitoso - User: ${username}, IP: ${req.ip}`);

    res.json({
      success: true,
      user: {
        username: user.username,
        // NO enviar datos sensibles
      }
    });

  } catch (error) {
    console.error('[ERROR] Login failed:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

/**
 * Refresh token - Obtener nuevo access token
 */
app.post('/api/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies['eva-refresh'];

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    // Verificar refresh token
    const decoded = verifyToken(refreshToken, REFRESH_SECRET);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Verificar que el token existe en la base de datos
    const isValid = await verifyRefreshTokenInDB(decoded.userId, refreshToken);

    if (!isValid) {
      return res.status(401).json({ error: 'Token revocado' });
    }

    // Generar nuevo access token
    const user = await getUserById(decoded.userId);
    const newAccessToken = generateAccessToken(user);

    // Actualizar cookie
    res.cookie('eva-tk', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/'
    });

    res.json({ success: true });

  } catch (error) {
    console.error('[ERROR] Refresh failed:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

/**
 * Logout - MÉTODO SEGURO
 */
app.post('/api/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies['eva-refresh'];

    // Revocar refresh token en la base de datos
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    // Limpiar cookies
    res.clearCookie('eva-tk');
    res.clearCookie('eva-refresh');

    console.log(`[SECURITY] Logout exitoso - IP: ${req.ip}`);

    res.json({ success: true });

  } catch (error) {
    console.error('[ERROR] Logout failed:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

/**
 * Middleware de autenticación
 */
function requireAuth(req, res, next) {
  const token = req.cookies['eva-tk'];

  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const decoded = verifyToken(token, JWT_SECRET);

  if (!decoded) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  // Adjuntar usuario a la request
  req.user = decoded;

  // Log de acceso
  console.log(`[ACCESS] User: ${decoded.user}, Endpoint: ${req.path}, IP: ${req.ip}`);

  // Detectar anomalías (opcional)
  detectAnomalies(decoded, req);

  next();
}

/**
 * Endpoint protegido - ejemplo
 */
app.get('/api/datos-usuario', requireAuth, async (req, res) => {
  try {
    // req.user contiene los datos del token
    const userData = await getUserData(req.user.idu);

    res.json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('[ERROR] Get user data failed:', error);
    res.status(500).json({ error: 'Error obteniendo datos' });
  }
});

// ============================================================================
// FUNCIONES AUXILIARES (implementar según tu DB)
// ============================================================================

async function authenticateUser(username, password) {
  // Implementar autenticación real
  // NUNCA almacenar passwords en texto plano
  // Usar bcrypt o argon2
  return null;
}

async function getUserById(userId) {
  // Implementar
  return null;
}

async function getUserData(userId) {
  // Implementar
  return null;
}

async function saveRefreshToken(userId, token) {
  // Guardar en DB con timestamp
  // Para poder revocar tokens comprometidos
}

async function verifyRefreshTokenInDB(userId, token) {
  // Verificar que el token existe y no ha sido revocado
  return false;
}

async function revokeRefreshToken(token) {
  // Marcar token como revocado en DB
}

/**
 * Detectar anomalías en el uso de tokens
 */
async function detectAnomalies(user, req) {
  // Implementar detección de:
  // - Cambio de IP repentino
  // - Demasiadas requests en poco tiempo
  // - Acceso desde ubicaciones inusuales
  // - Patrones de uso sospechosos

  // Si se detecta anomalía:
  // 1. Log de seguridad
  // 2. Notificar al usuario
  // 3. Potencialmente revocar token
}

// ============================================================================
// FRONTEND - JavaScript
// ============================================================================

/**
 * Login desde el frontend - MÉTODO SEGURO
 */
async function login(username, password) {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // ← IMPORTANTE: Incluir cookies
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Login exitoso');
      // La cookie se establece automáticamente
      // NO necesitas hacer nada con el token

      // Redirigir o actualizar UI
      window.location.href = '/dashboard';
    } else {
      console.error('❌ Login fallido:', data.error);
    }

  } catch (error) {
    console.error('Error en login:', error);
  }
}

/**
 * Hacer peticiones autenticadas - MÉTODO SEGURO
 */
async function fetchUserData() {
  try {
    const response = await fetch('/api/datos-usuario', {
      method: 'GET',
      credentials: 'include' // ← IMPORTANTE: Incluir cookies automáticamente
    });

    if (response.status === 401) {
      // Token expirado, intentar refresh
      const refreshed = await refreshToken();

      if (refreshed) {
        // Reintentar la petición
        return fetchUserData();
      } else {
        // Redirect a login
        window.location.href = '/login';
        return null;
      }
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error obteniendo datos:', error);
    return null;
  }
}

/**
 * Refresh token automático
 */
async function refreshToken() {
  try {
    const response = await fetch('/api/refresh', {
      method: 'POST',
      credentials: 'include'
    });

    if (response.ok) {
      console.log('✅ Token refrescado');
      return true;
    } else {
      console.log('❌ No se pudo refrescar el token');
      return false;
    }

  } catch (error) {
    console.error('Error refrescando token:', error);
    return false;
  }
}

/**
 * Logout - MÉTODO SEGURO
 */
async function logout() {
  try {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include'
    });

    // Limpiar cualquier estado local
    // (pero NO tokens, ya están en cookies httpOnly)

    // Redirigir a login
    window.location.href = '/login';

  } catch (error) {
    console.error('Error en logout:', error);
  }
}

/**
 * Verificar autenticación al cargar la página
 */
async function checkAuth() {
  try {
    const response = await fetch('/api/verify', {
      credentials: 'include'
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }

  } catch (error) {
    return false;
  }
}

// ============================================================================
// COMPARACIÓN: ANTES vs DESPUÉS
// ============================================================================

/*
 * ❌ MÉTODO INSEGURO (ANTES):
 *
 * // Login
 * const response = await fetch('/api/login', {...});
 * const { token } = await response.json();
 * localStorage.setItem('eva-tk', token); // ← VULNERABLE A XSS
 *
 * // Peticiones
 * fetch('/api/data', {
 *   headers: {
 *     'Authorization': `Bearer ${localStorage.getItem('eva-tk')}` // ← INSEGURO
 *   }
 * });
 *
 * // Logout
 * localStorage.removeItem('eva-tk'); // No revoca el token en el servidor
 *
 * PROBLEMAS:
 * - Vulnerable a XSS
 * - Token accesible por cualquier script
 * - No expira automáticamente
 * - No se puede revocar desde el servidor
 */

/*
 * ✅ MÉTODO SEGURO (DESPUÉS):
 *
 * // Login
 * await fetch('/api/login', {
 *   credentials: 'include' // Cookie se establece automáticamente
 * });
 *
 * // Peticiones
 * fetch('/api/data', {
 *   credentials: 'include' // Cookie se envía automáticamente
 * });
 *
 * // Logout
 * await fetch('/api/logout', {
 *   credentials: 'include' // Revoca el token
 * });
 *
 * VENTAJAS:
 * - Inmune a XSS (httpOnly)
 * - No accesible por JavaScript
 * - Expira automáticamente
 * - Se puede revocar desde el servidor
 * - Protección CSRF con SameSite
 */

// ============================================================================
// CONFIGURACIÓN ADICIONAL
// ============================================================================

/**
 * Ejemplo de .env (NUNCA commitear este archivo!)
 */
/*
NODE_ENV=production
JWT_SECRET=tu-secreto-super-seguro-de-al-menos-32-caracteres
REFRESH_SECRET=otro-secreto-diferente-para-refresh-tokens
DATABASE_URL=postgresql://user:pass@localhost/dbname
ALLOWED_ORIGINS=https://tuapp.com
*/

/**
 * Generar secretos seguros:
 */
// node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

module.exports = {
  app,
  requireAuth,
  generateAccessToken,
  generateRefreshToken
};
