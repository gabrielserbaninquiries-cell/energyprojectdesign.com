"""Validări pentru date românești: CNP (cod numeric personal) și CUI (cod unic
de înregistrare). Algoritmi conform legislației române și ANAF.
"""
from typing import Tuple

# Constanta pentru calculul check-digit CNP (controlul ultimei cifre)
_CNP_CONTROL = "279146358279"


def validate_cnp(cnp: str) -> Tuple[bool, str]:
    """Validează CNP-ul românesc (13 cifre, check digit pondere).
    Returnează (valid, mesaj_eroare).
    """
    cnp = (cnp or "").strip()
    if not cnp:
        return False, "CNP gol"
    if len(cnp) != 13 or not cnp.isdigit():
        return False, "CNP trebuie să conțină exact 13 cifre"
    # Prima cifră — sex/secol (1-8, sau 9 pentru rezidenți)
    if cnp[0] not in "12345678":
        return False, "Prima cifră CNP invalidă (sex/secol)"
    # Lună (01-12)
    month = int(cnp[3:5])
    if month < 1 or month > 12:
        return False, "Luna naștere CNP invalidă"
    # Zi (01-31)
    day = int(cnp[5:7])
    if day < 1 or day > 31:
        return False, "Ziua naștere CNP invalidă"
    # Check digit
    total = sum(int(cnp[i]) * int(_CNP_CONTROL[i]) for i in range(12))
    check = total % 11
    if check == 10:
        check = 1
    if check != int(cnp[12]):
        return False, "CNP — cifra de control nu corespunde"
    return True, "OK"


def validate_cui(cui: str) -> Tuple[bool, str]:
    """Validează CUI/CIF românesc (2-10 cifre, opțional prefix RO).
    Algoritm ANAF: înmulțire pondere [7,5,3,2,1,7,5,3,2] + control.
    """
    cui = (cui or "").strip().upper().replace("RO", "").strip()
    if not cui:
        return False, "CUI gol"
    if not cui.isdigit() or not (2 <= len(cui) <= 10):
        return False, "CUI trebuie să conțină între 2 și 10 cifre"
    # Padding cu zerouri la stânga la 9 cifre (ultimul = check)
    padded = cui.zfill(10)
    digits = padded[:-1]
    check_expected = int(padded[-1])
    weights = "753217532"
    total = sum(int(digits[i]) * int(weights[i]) for i in range(9))
    check = (total * 10) % 11
    if check == 10:
        check = 0
    if check != check_expected:
        return False, "CUI — cifra de control nu corespunde"
    return True, "OK"
