#!/usr/bin/env python3
"""
Busca el token 'eva-tk' en localStorage de todos los navegadores
Busca en los archivos del sistema, no abre navegadores
"""

import os
import json
import sqlite3
import shutil
import tempfile
import re
from pathlib import Path


class TokenFinder:
    """Busca tokens en archivos de navegadores"""

    def __init__(self, token_name="eva-tk"):
        self.token_name = token_name
        self.home = Path.home()
        self.found_tokens = []

    def search_in_binary_file(self, file_path):
        """Busca el token en archivos binarios (LevelDB)"""
        try:
            with open(file_path, 'rb') as f:
                content = f.read()

            # Convertir a string ignorando errores
            content_str = content.decode('utf-8', errors='ignore')

            # Buscar el nombre del token
            if self.token_name in content_str:
                # Buscar tokens JWT cercanos al nombre
                idx = content_str.find(self.token_name)
                segment = content_str[max(0, idx-200):idx+2000]

                # Patrón para JWT
                jwt_pattern = r'eyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}'
                matches = re.findall(jwt_pattern, segment)

                return matches

        except Exception:
            pass

        return []

    def search_chrome_leveldb(self, browser_name, profile_path):
        """Busca en LevelDB de Chrome/Chromium/Edge/Brave"""
        tokens = []

        try:
            leveldb_path = profile_path / "Local Storage" / "leveldb"

            if not leveldb_path.exists():
                return tokens

            # Buscar en todos los archivos .log y .ldb
            for file in leveldb_path.iterdir():
                if file.suffix in ['.log', '.ldb']:
                    found = self.search_in_binary_file(file)
                    for token in found:
                        tokens.append({
                            "browser": browser_name,
                            "profile": profile_path.name,
                            "token": token,
                            "file": str(file)
                        })

        except Exception as e:
            pass

        return tokens

    def search_firefox_sqlite(self, browser_name, profile_path):
        """Busca en SQLite de Firefox"""
        tokens = []

        try:
            storage_path = profile_path / "storage" / "default"

            if not storage_path.exists():
                return tokens

            # Buscar en cada directorio de sitio
            for site_dir in storage_path.iterdir():
                if not site_dir.is_dir():
                    continue

                ls_dir = site_dir / "ls"
                if not ls_dir.exists():
                    continue

                # Buscar bases de datos SQLite
                for db_file in ls_dir.glob("*.sqlite"):
                    try:
                        # Crear copia temporal
                        with tempfile.NamedTemporaryFile(suffix='.sqlite', delete=False) as tmp:
                            tmp_path = tmp.name

                        shutil.copy2(db_file, tmp_path)

                        # Conectar a la DB
                        conn = sqlite3.connect(tmp_path)
                        cursor = conn.cursor()

                        # Buscar en la tabla data
                        try:
                            cursor.execute("SELECT key, value FROM data")
                            for key, value in cursor.fetchall():
                                if key and self.token_name in str(key):
                                    # El valor puede estar codificado
                                    token_value = value
                                    if isinstance(value, bytes):
                                        token_value = value.decode('utf-8', errors='ignore')

                                    tokens.append({
                                        "browser": browser_name,
                                        "profile": profile_path.name,
                                        "site": site_dir.name,
                                        "token": token_value,
                                        "file": str(db_file)
                                    })
                        except sqlite3.Error:
                            pass

                        conn.close()
                        os.unlink(tmp_path)

                    except Exception:
                        if os.path.exists(tmp_path):
                            try:
                                os.unlink(tmp_path)
                            except:
                                pass

        except Exception:
            pass

        return tokens

    def find_chrome_profiles(self):
        """Encuentra perfiles de Chrome"""
        profiles = []

        # Chrome en Linux
        chrome_base = self.home / ".config" / "google-chrome"
        if chrome_base.exists():
            for item in chrome_base.iterdir():
                if item.is_dir() and (item.name == "Default" or item.name.startswith("Profile")):
                    profiles.append(("Chrome", item))

        # Chromium en Linux
        chromium_base = self.home / ".config" / "chromium"
        if chromium_base.exists():
            for item in chromium_base.iterdir():
                if item.is_dir() and (item.name == "Default" or item.name.startswith("Profile")):
                    profiles.append(("Chromium", item))

        # Edge en Linux
        edge_base = self.home / ".config" / "microsoft-edge"
        if edge_base.exists():
            for item in edge_base.iterdir():
                if item.is_dir() and (item.name == "Default" or item.name.startswith("Profile")):
                    profiles.append(("Edge", item))

        # Brave en Linux
        brave_base = self.home / ".config" / "BraveSoftware" / "Brave-Browser"
        if brave_base.exists():
            for item in brave_base.iterdir():
                if item.is_dir() and (item.name == "Default" or item.name.startswith("Profile")):
                    profiles.append(("Brave", item))

        # Chrome en Windows (via WSL)
        windows_users = Path("/mnt/c/Users")
        if windows_users.exists():
            for user_dir in windows_users.iterdir():
                chrome_path = user_dir / "AppData" / "Local" / "Google" / "Chrome" / "User Data"
                if chrome_path.exists():
                    for item in chrome_path.iterdir():
                        if item.is_dir() and (item.name == "Default" or item.name.startswith("Profile")):
                            profiles.append((f"Chrome-Win ({user_dir.name})", item))

        return profiles

    def find_firefox_profiles(self):
        """Encuentra perfiles de Firefox"""
        profiles = []

        # Firefox en Linux
        firefox_base = self.home / ".mozilla" / "firefox"
        if firefox_base.exists():
            for item in firefox_base.iterdir():
                if item.is_dir() and '.' in item.name:
                    profiles.append(("Firefox", item))

        # Firefox en Windows (via WSL)
        windows_users = Path("/mnt/c/Users")
        if windows_users.exists():
            for user_dir in windows_users.iterdir():
                firefox_path = user_dir / "AppData" / "Roaming" / "Mozilla" / "Firefox" / "Profiles"
                if firefox_path.exists():
                    for item in firefox_path.iterdir():
                        if item.is_dir() and '.' in item.name:
                            profiles.append((f"Firefox-Win ({user_dir.name})", item))

        return profiles

    def search_all(self):
        """Busca en todos los navegadores"""
        print("=" * 70)
        print(f"🔍 BUSCANDO TOKEN: '{self.token_name}'")
        print("=" * 70)
        print()

        all_tokens = []

        # Buscar en navegadores Chromium
        print("📱 Buscando en navegadores Chromium (Chrome, Edge, Brave)...")
        chrome_profiles = self.find_chrome_profiles()

        if not chrome_profiles:
            print("  ❌ No se encontraron perfiles de Chrome/Chromium/Edge/Brave")
        else:
            for browser_name, profile_path in chrome_profiles:
                print(f"  • {browser_name} - {profile_path.name}")
                tokens = self.search_chrome_leveldb(browser_name, profile_path)
                all_tokens.extend(tokens)
                if tokens:
                    print(f"    ✅ Encontrados {len(tokens)} token(s)")

        print()

        # Buscar en Firefox
        print("🦊 Buscando en Firefox...")
        firefox_profiles = self.find_firefox_profiles()

        if not firefox_profiles:
            print("  ❌ No se encontraron perfiles de Firefox")
        else:
            for browser_name, profile_path in firefox_profiles:
                print(f"  • {browser_name} - {profile_path.name}")
                tokens = self.search_firefox_sqlite(browser_name, profile_path)
                all_tokens.extend(tokens)
                if tokens:
                    print(f"    ✅ Encontrados {len(tokens)} token(s)")

        print()
        print("=" * 70)

        return all_tokens

    def display_results(self, tokens):
        """Muestra los resultados encontrados"""
        if not tokens:
            print(f"\n❌ NO SE ENCONTRÓ EL TOKEN '{self.token_name}'\n")
            print("💡 Posibles causas:")
            print("  • El token no existe en localStorage de ningún navegador")
            print("  • El navegador fue cerrado y limpió el storage")
            print("  • El token tiene otro nombre")
            print("  • Los archivos están en otra ubicación")
            print()
            return

        print(f"\n✅ ENCONTRADOS {len(tokens)} TOKEN(S)\n")
        print("=" * 70)

        for i, token_data in enumerate(tokens, 1):
            print(f"\n🎯 TOKEN #{i}")
            print("-" * 70)
            print(f"Navegador:  {token_data['browser']}")
            print(f"Perfil:     {token_data['profile']}")
            if 'site' in token_data:
                print(f"Sitio web:  {token_data['site']}")
            print(f"Ubicación:  {token_data['file']}")
            print()
            print("TOKEN COMPLETO:")
            print("─" * 70)
            print(token_data['token'])
            print("─" * 70)
            print()

            # Intentar decodificar
            try:
                parts = token_data['token'].split('.')
                if len(parts) == 3:
                    import base64

                    # Decodificar payload
                    payload_data = parts[1]
                    # Agregar padding
                    missing_padding = len(payload_data) % 4
                    if missing_padding:
                        payload_data += '=' * (4 - missing_padding)

                    payload_data = payload_data.replace('-', '+').replace('_', '/')
                    payload = json.loads(base64.b64decode(payload_data).decode('utf-8'))

                    print("📋 DATOS DEL TOKEN (decodificados):")
                    print(json.dumps(payload, indent=2, ensure_ascii=False))
                    print()
            except Exception:
                pass

        # Guardar en archivo
        output_file = Path(__file__).parent / "tokens-encontrados.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(tokens, f, indent=2, ensure_ascii=False)

        print("=" * 70)
        print(f"💾 Tokens guardados en: {output_file}")
        print()
        print("💡 Para decodificar un token:")
        print(f"   python3 jwt-decoder.py \"<token>\"")
        print()


def main():
    """Función principal"""
    import sys

    token_name = "eva-tk"

    # Permitir buscar otro token si se pasa como argumento
    if len(sys.argv) > 1:
        token_name = sys.argv[1]

    print()
    print("╔" + "═" * 68 + "╗")
    print("║" + " " * 15 + "🔐 BUSCADOR DE TOKENS EN LOCALSTORAGE" + " " * 15 + "║")
    print("╚" + "═" * 68 + "╝")
    print()
    print("⚠️  SOLO PARA USO EDUCATIVO - Busca en TU PROPIO sistema")
    print()

    finder = TokenFinder(token_name)
    tokens = finder.search_all()
    finder.display_results(tokens)

    if tokens:
        print("🛡️  RECOMENDACIONES DE SEGURIDAD:")
        print("  1. NO uses localStorage para tokens de autenticación")
        print("  2. Migra a httpOnly cookies")
        print("  3. Implementa Content Security Policy")
        print("  4. Revisa secure-implementation-example.js para código seguro")
        print()


if __name__ == "__main__":
    main()
