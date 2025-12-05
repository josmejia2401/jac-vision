import time
import random
from datetime import datetime

def generate_unique_number(n: int = 12) -> int:
    # Validación de argumento
    if not isinstance(n, int) or n < 8:
        raise ValueError("El parámetro 'n' debe ser un entero mayor o igual a 8.")

    # Prefijo de fecha: YYMMDD (6 dígitos)
    now = datetime.now()
    date_prefix = now.strftime("%y%m%d")  # YYMMDD

    # Parte aleatoria: n - 6 dígitos
    random_digits = n - 6

    # Timestamp en milisegundos
    timestamp_ms = int(time.time() * 1000)
    timestamp_str = str(timestamp_ms)

    # Obtener parte final del timestamp con la longitud requerida
    time_component = timestamp_str[-random_digits:] if len(timestamp_str) >= random_digits else timestamp_str

    # Componente aleatorio
    random_component = str(random.randint(0, (10 ** random_digits) - 1)).zfill(random_digits)

    # Ensamblamos: fecha + timestamp parcial
    numeric = date_prefix + time_component

    # Ajuste de longitud exacta
    if len(numeric) < n:
        numeric += random_component[: n - len(numeric)]
    elif len(numeric) > n:
        numeric = numeric[:n]

    # Evitar que comience con 0
    if numeric[0] == "0":
        numeric = str(random.randint(1, 9)) + numeric[1:]

    return int(numeric)
