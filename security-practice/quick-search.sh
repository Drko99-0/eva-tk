#!/bin/bash
# Quick search para tokens en localStorage
# Búsqueda rápida sin necesidad de Python

echo "========================================================================"
echo "🔍 BÚSQUEDA RÁPIDA DE TOKENS EN LOCALSTORAGE"
echo "========================================================================"
echo ""

TOKEN_NAME="${1:-eva-tk}"
FOUND=0

echo "🎯 Buscando: '$TOKEN_NAME'"
echo ""

# Función para buscar en directorios
search_in_dir() {
    local browser=$1
    local path=$2

    if [ -d "$path" ]; then
        echo "📱 Buscando en $browser..."

        # Buscar archivos que contengan el token
        results=$(grep -r "$TOKEN_NAME" "$path" 2>/dev/null | head -5)

        if [ ! -z "$results" ]; then
            echo "  ✅ ¡Token encontrado!"
            FOUND=$((FOUND + 1))

            # Intentar extraer JWT
            jwt=$(echo "$results" | grep -oE 'eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+' | head -1)

            if [ ! -z "$jwt" ]; then
                echo "  📋 Token JWT: ${jwt:0:50}..."
                echo ""
                echo "  🔍 Decodificando token..."
                echo ""

                # Si tenemos Python, decodificar
                if command -v python3 &> /dev/null; then
                    python3 jwt-decoder.py "$jwt" 2>/dev/null || echo "  ⚠️  No se pudo decodificar automáticamente"
                else
                    echo "  Token completo: $jwt"
                    echo "  💡 Usa: python3 jwt-decoder.py '$jwt'"
                fi
            fi
        else
            echo "  ❌ No encontrado"
        fi
        echo ""
    fi
}

# Buscar en Chrome (Linux)
search_in_dir "Chrome" "$HOME/.config/google-chrome/Default/Local Storage/leveldb"

# Buscar en Chromium
search_in_dir "Chromium" "$HOME/.config/chromium/Default/Local Storage/leveldb"

# Buscar en Firefox
search_in_dir "Firefox" "$HOME/.mozilla/firefox"

# Buscar en Edge
search_in_dir "Edge" "$HOME/.config/microsoft-edge/Default/Local Storage/leveldb"

# Buscar en Brave
search_in_dir "Brave" "$HOME/.config/BraveSoftware/Brave-Browser/Default/Local Storage/leveldb"

echo "========================================================================"
echo "📊 RESUMEN"
echo "========================================================================"
echo ""

if [ $FOUND -gt 0 ]; then
    echo "✅ Tokens encontrados en $FOUND navegador(es)"
    echo ""
    echo "⚠️  VULNERABILIDAD DEMOSTRADA:"
    echo "  • Los tokens son accesibles desde el sistema de archivos"
    echo "  • Un atacante con acceso al sistema podría robarlos"
    echo "  • JavaScript malicioso (XSS) puede leer localStorage"
    echo ""
    echo "💡 RECOMENDACIONES:"
    echo "  1. Migra a httpOnly cookies"
    echo "  2. Implementa Content Security Policy"
    echo "  3. Usa tokens de corta duración"
    echo "  4. Implementa refresh token rotation"
else
    echo "❌ No se encontraron tokens '$TOKEN_NAME'"
    echo ""
    echo "💡 Posibles razones:"
    echo "  • El token está en otro navegador"
    echo "  • El nombre del token es diferente"
    echo "  • El token fue eliminado o expiró"
    echo "  • Los permisos de archivos bloquean la lectura"
fi

echo ""
echo "========================================================================"
echo ""
