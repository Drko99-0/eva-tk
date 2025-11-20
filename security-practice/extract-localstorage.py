#!/usr/bin/env python3
"""
LocalStorage Token Extractor
Práctica de seguridad - Extracción de tokens de navegadores
SOLO PARA USO EDUCATIVO EN TU PROPIO SISTEMA
"""

import os
import json
import sqlite3
import shutil
from pathlib import Path
import tempfile
import subprocess


class BrowserStorageExtractor:
    """Extrae datos del localStorage de diferentes navegadores"""

    def __init__(self):
        self.home = Path.home()
        self.results = []
        self.token_name = "eva-tk"

    def get_chrome_paths(self):
        """Obtiene las rutas de almacenamiento de Chrome/Chromium"""
        paths = []

        # Chrome en Linux
        chrome_base = self.home / ".config" / "google-chrome"
        if chrome_base.exists():
            for profile in chrome_base.glob("*/"):
                local_storage = profile / "Local Storage" / "leveldb"
                if local_storage.exists():
                    paths.append(("Chrome", str(profile.name), local_storage))

        # Chromium en Linux
        chromium_base = self.home / ".config" / "chromium"
        if chromium_base.exists():
            for profile in chromium_base.glob("*/"):
                local_storage = profile / "Local Storage" / "leveldb"
                if local_storage.exists():
                    paths.append(("Chromium", str(profile.name), local_storage))

        # Chrome en Windows (si está en WSL)
        windows_chrome = Path("/mnt/c/Users")
        if windows_chrome.exists():
            for user in windows_chrome.glob("*/"):
                chrome_path = user / "AppData/Local/Google/Chrome/User Data"
                if chrome_path.exists():
                    for profile in chrome_path.glob("*/"):
                        local_storage = profile / "Local Storage" / "leveldb"
                        if local_storage.exists():
                            paths.append(("Chrome (Windows)", str(user.name), local_storage))

        return paths

    def get_firefox_paths(self):
        """Obtiene las rutas de almacenamiento de Firefox"""
        paths = []

        # Firefox en Linux
        firefox_base = self.home / ".mozilla" / "firefox"
        if firefox_base.exists():
            for profile in firefox_base.glob("*.*/"):
                storage_path = profile / "storage" / "default"
                if storage_path.exists():
                    paths.append(("Firefox", str(profile.name), storage_path))

        # Firefox en Windows (si está en WSL)
        windows_firefox = Path("/mnt/c/Users")
        if windows_firefox.exists():
            for user in windows_firefox.glob("*/"):
                firefox_path = user / "AppData/Roaming/Mozilla/Firefox/Profiles"
                if firefox_path.exists():
                    for profile in firefox_path.glob("*.*/"):
                        storage_path = profile / "storage" / "default"
                        if storage_path.exists():
                            paths.append(("Firefox (Windows)", str(user.name), storage_path))

        return paths

    def get_edge_paths(self):
        """Obtiene las rutas de almacenamiento de Edge"""
        paths = []

        # Edge en Linux
        edge_base = self.home / ".config" / "microsoft-edge"
        if edge_base.exists():
            for profile in edge_base.glob("*/"):
                local_storage = profile / "Local Storage" / "leveldb"
                if local_storage.exists():
                    paths.append(("Edge", str(profile.name), local_storage))

        return paths

    def extract_from_chrome_leveldb(self, browser, profile, path):
        """Extrae datos del LevelDB de Chrome/Edge"""
        found_tokens = []

        try:
            # Buscar archivos .log y .ldb en el directorio
            for file in path.glob("*"):
                if file.suffix in ['.log', '.ldb']:
                    try:
                        with open(file, 'rb') as f:
                            content = f.read()

                        # Buscar el token en el contenido binario
                        content_str = content.decode('utf-8', errors='ignore')

                        # Buscar nuestro token específico
                        if self.token_name in content_str:
                            # Intentar extraer el valor
                            idx = content_str.find(self.token_name)
                            if idx != -1:
                                # Buscar el valor después del nombre
                                segment = content_str[idx:idx+2000]

                                # Intentar extraer un JWT (formato eyJ...)
                                import re
                                jwt_pattern = r'eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+'
                                matches = re.findall(jwt_pattern, segment)

                                for token in matches:
                                    found_tokens.append({
                                        "browser": browser,
                                        "profile": profile,
                                        "token_name": self.token_name,
                                        "token": token,
                                        "file": str(file)
                                    })
                    except Exception as e:
                        # Archivo no legible, continuar
                        pass

        except Exception as e:
            print(f"  ⚠️  Error procesando {browser} - {profile}: {e}")

        return found_tokens

    def extract_from_firefox_storage(self, browser, profile, path):
        """Extrae datos del storage de Firefox"""
        found_tokens = []

        try:
            # Firefox usa SQLite para el storage
            for site_dir in path.glob("*/"):
                ls_dir = site_dir / "ls"
                if ls_dir.exists():
                    # Buscar archivos .sqlite
                    for db_file in ls_dir.glob("*.sqlite"):
                        try:
                            # Crear copia temporal para no bloquear el navegador
                            with tempfile.NamedTemporaryFile(suffix='.sqlite', delete=False) as tmp:
                                tmp_path = tmp.name

                            shutil.copy2(db_file, tmp_path)

                            # Conectar a la base de datos
                            conn = sqlite3.connect(tmp_path)
                            cursor = conn.cursor()

                            # Buscar en la tabla data
                            cursor.execute("SELECT key, value FROM data")
                            for key, value in cursor.fetchall():
                                if key and self.token_name in key:
                                    found_tokens.append({
                                        "browser": browser,
                                        "profile": profile,
                                        "token_name": self.token_name,
                                        "token": value,
                                        "site": site_dir.name
                                    })

                            conn.close()
                            os.unlink(tmp_path)

                        except Exception as e:
                            # Error con este archivo, continuar
                            pass

        except Exception as e:
            print(f"  ⚠️  Error procesando Firefox - {profile}: {e}")

        return found_tokens

    def scan_all_browsers(self):
        """Escanea todos los navegadores"""
        print("\n🔍 Buscando tokens en navegadores...")
        print("="*70)

        all_tokens = []

        # Chrome/Chromium
        print("\n📱 Escaneando Chrome/Chromium...")
        for browser, profile, path in self.get_chrome_paths():
            print(f"  • {browser} - Perfil: {profile}")
            tokens = self.extract_from_chrome_leveldb(browser, profile, path)
            all_tokens.extend(tokens)

        # Edge
        print("\n📱 Escaneando Microsoft Edge...")
        for browser, profile, path in self.get_edge_paths():
            print(f"  • {browser} - Perfil: {profile}")
            tokens = self.extract_from_chrome_leveldb(browser, profile, path)
            all_tokens.extend(tokens)

        # Firefox
        print("\n📱 Escaneando Firefox...")
        for browser, profile, path in self.get_firefox_paths():
            print(f"  • {browser} - Perfil: {profile}")
            tokens = self.extract_from_firefox_storage(browser, profile, path)
            all_tokens.extend(tokens)

        return all_tokens

    def display_results(self, tokens):
        """Muestra los resultados encontrados"""
        print("\n" + "="*70)
        print(f"🎯 RESULTADOS - Encontrados {len(tokens)} token(s)")
        print("="*70)

        if not tokens:
            print("\n❌ No se encontraron tokens 'eva-tk' en ningún navegador")
            print("\n💡 Esto puede deberse a:")
            print("  • El token está en un sitio que no has visitado recientemente")
            print("  • El navegador no está instalado o usa rutas diferentes")
            print("  • El token fue limpiado o expiró")
            return

        for i, token_data in enumerate(tokens, 1):
            print(f"\n📍 Token #{i}")
            print(f"  Navegador: {token_data['browser']}")
            print(f"  Perfil: {token_data['profile']}")
            if 'site' in token_data:
                print(f"  Sitio: {token_data['site']}")
            print(f"  Token: {token_data['token'][:50]}...")
            print(f"  Token completo: {token_data['token']}")

        # Guardar en archivo
        output_file = Path("/home/user/eva-tk/security-practice/extracted-tokens.json")
        with open(output_file, 'w') as f:
            json.dump(tokens, f, indent=2)

        print(f"\n💾 Tokens guardados en: {output_file}")

    def run(self):
        """Ejecuta el extractor"""
        print("="*70)
        print("🔐 EXTRACTOR DE TOKENS - PRÁCTICA DE SEGURIDAD")
        print("="*70)
        print("\n⚠️  ADVERTENCIA: Solo usa esto en tu propio sistema")
        print("⚠️  Propósito: Demostrar vulnerabilidades del localStorage")
        print(f"\n🎯 Buscando token: '{self.token_name}'")

        tokens = self.scan_all_browsers()
        self.display_results(tokens)

        if tokens:
            print("\n" + "="*70)
            print("💡 LECCIONES DE SEGURIDAD")
            print("="*70)
            print("\n🔴 VULNERABILIDADES DEMOSTRADAS:")
            print("  1. localStorage es accesible desde el sistema de archivos")
            print("  2. Scripts maliciosos pueden leer localStorage vía JavaScript")
            print("  3. XSS puede robar tokens del localStorage fácilmente")
            print("  4. Los tokens persisten incluso después de cerrar el navegador")
            print("\n✅ SOLUCIONES RECOMENDADAS:")
            print("  1. Usa httpOnly cookies para tokens de autenticación")
            print("  2. Implementa Content Security Policy (CSP)")
            print("  3. Usa tokens de corta duración con refresh tokens")
            print("  4. Implementa SameSite cookies")
            print("  5. Considera usar sessionStorage en lugar de localStorage")
            print("  6. Implementa detección de anomalías en el backend")
            print("\n🔧 MEJORA TU APLICACIÓN:")
            print("  • Mueve la autenticación a httpOnly cookies")
            print("  • Implementa CSRF tokens")
            print("  • Agrega headers de seguridad")
            print("  • Implementa rate limiting")
            print("  • Usa HTTPS siempre (HSTS)")

        print("\n" + "="*70 + "\n")


def main():
    """Función principal"""
    print("\n⚠️  AVISO LEGAL:")
    print("Este script es solo para uso educativo en tu propio sistema.")
    print("Úsalo solo para aprender sobre seguridad web.")
    print("\n¿Continuar? (s/n): ", end="")

    try:
        response = input().lower()
        if response != 's':
            print("Operación cancelada.")
            return
    except:
        print("\nOperación cancelada.")
        return

    extractor = BrowserStorageExtractor()
    extractor.run()


if __name__ == "__main__":
    main()
