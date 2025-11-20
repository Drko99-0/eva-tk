#!/usr/bin/env python3
"""
JWT Decoder and Analyzer
Práctica de seguridad - Análisis de tokens JWT
"""

import base64
import json
import sys
from datetime import datetime


def decode_base64url(data):
    """Decodifica base64url (usado en JWT)"""
    # Agregar padding si es necesario
    missing_padding = len(data) % 4
    if missing_padding:
        data += '=' * (4 - missing_padding)

    # Reemplazar caracteres URL-safe
    data = data.replace('-', '+').replace('_', '/')

    try:
        return base64.b64decode(data).decode('utf-8')
    except Exception as e:
        return f"Error decodificando: {e}"


def decode_jwt(token):
    """Decodifica un token JWT y muestra su contenido"""
    try:
        parts = token.split('.')

        if len(parts) != 3:
            return {"error": "Token JWT inválido - debe tener 3 partes"}

        header_data = decode_base64url(parts[0])
        payload_data = decode_base64url(parts[1])
        signature = parts[2]

        try:
            header = json.loads(header_data)
            payload = json.loads(payload_data)
        except json.JSONDecodeError as e:
            return {"error": f"Error parseando JSON: {e}"}

        # Analizar timestamps
        timestamp_fields = {
            'nbf': 'Not Before',
            'exp': 'Expiration',
            'iat': 'Issued At'
        }

        result = {
            "header": header,
            "payload": payload,
            "signature": signature,
            "timestamps": {}
        }

        for field, name in timestamp_fields.items():
            if field in payload:
                try:
                    ts = int(payload[field])
                    dt = datetime.fromtimestamp(ts)
                    result["timestamps"][name] = {
                        "timestamp": ts,
                        "datetime": dt.strftime('%Y-%m-%d %H:%M:%S'),
                        "is_expired": dt < datetime.now() if field == 'exp' else None
                    }
                except:
                    pass

        # Información de seguridad
        result["security_analysis"] = analyze_security(header, payload)

        return result

    except Exception as e:
        return {"error": f"Error general: {e}"}


def analyze_security(header, payload):
    """Analiza aspectos de seguridad del token"""
    analysis = {
        "warnings": [],
        "info": []
    }

    # Verificar algoritmo
    alg = header.get('alg', 'none')
    if alg.lower() == 'none':
        analysis["warnings"].append("⚠️  CRÍTICO: Algoritmo 'none' - token sin firma!")
    elif alg == 'HS256':
        analysis["info"].append("ℹ️  Algoritmo HS256 (HMAC con SHA-256)")

    # Verificar expiración
    if 'exp' in payload:
        exp_ts = int(payload['exp'])
        exp_dt = datetime.fromtimestamp(exp_ts)
        if exp_dt < datetime.now():
            analysis["warnings"].append("⚠️  Token EXPIRADO")
        else:
            time_left = exp_dt - datetime.now()
            analysis["info"].append(f"✓ Token válido por {time_left}")
    else:
        analysis["warnings"].append("⚠️  Token sin fecha de expiración")

    # Verificar información sensible
    sensitive_fields = ['password', 'secret', 'key', 'token']
    for field in sensitive_fields:
        if field in str(payload).lower():
            analysis["warnings"].append(f"⚠️  Posible información sensible: '{field}'")

    return analysis


def print_analysis(result):
    """Imprime el análisis de forma legible"""
    print("\n" + "="*70)
    print("🔍 ANÁLISIS DE TOKEN JWT")
    print("="*70)

    if "error" in result:
        print(f"\n❌ ERROR: {result['error']}")
        return

    print("\n📋 HEADER:")
    print(json.dumps(result["header"], indent=2, ensure_ascii=False))

    print("\n📦 PAYLOAD (Claims):")
    print(json.dumps(result["payload"], indent=2, ensure_ascii=False))

    print("\n🔐 FIRMA (Signature):")
    print(f"  {result['signature'][:50]}...")

    if result["timestamps"]:
        print("\n⏰ TIMESTAMPS:")
        for name, data in result["timestamps"].items():
            print(f"  {name}:")
            print(f"    Fecha: {data['datetime']}")
            if data.get('is_expired') is not None:
                status = "❌ EXPIRADO" if data['is_expired'] else "✓ VÁLIDO"
                print(f"    Estado: {status}")

    if result["security_analysis"]:
        print("\n🛡️  ANÁLISIS DE SEGURIDAD:")

        if result["security_analysis"]["warnings"]:
            print("\n  Advertencias:")
            for warning in result["security_analysis"]["warnings"]:
                print(f"    {warning}")

        if result["security_analysis"]["info"]:
            print("\n  Información:")
            for info in result["security_analysis"]["info"]:
                print(f"    {info}")

    print("\n" + "="*70)


def main():
    """Función principal"""
    if len(sys.argv) < 2:
        print("Uso: python3 jwt-decoder.py <token>")
        print("\nEjemplo:")
        print("  python3 jwt-decoder.py eyJhbGci...")
        sys.exit(1)

    token = sys.argv[1]
    result = decode_jwt(token)
    print_analysis(result)

    # Recomendaciones de seguridad
    print("\n💡 RECOMENDACIONES DE SEGURIDAD:")
    print("  1. NO almacenes tokens en localStorage - son vulnerables a XSS")
    print("  2. Usa httpOnly cookies para tokens sensibles")
    print("  3. Implementa rotación de tokens")
    print("  4. Usa HTTPS siempre")
    print("  5. Implementa tiempo de expiración corto")
    print("  6. Nunca incluyas información sensible en el payload del JWT")
    print()


if __name__ == "__main__":
    main()
