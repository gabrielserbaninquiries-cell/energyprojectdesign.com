"""Personal donation thank-you note — Energy Project Design.

Cerință user (literal, mesaj 30):
> "Vreau doar o nota simpla, personala de multumire. Nu vreau sa manipulez
>  emotional donatorii. Vreau ca mesajul sa fie personal, multumitor,
>  inspirational si autentic."

Acest fișier conține mesajul exact dorit, în cuvintele founderul Dragoș Șerban.
NU modifica fără acord explicit — este vocea oficială a EPD către donatori.
"""

# Mesaj public — afișat pe pagina de success după donație + emailat donatorului
DONATION_THANK_YOU_NOTE = """\
Mulțumim, în numele tuturor oamenilor care contribuie la această cauză.

Fiecare rază de speranță pentru proiect ne duce mai aproape de un ideal.
Care? Nici noi nu știm.

Doar atât: avem nevoie de ajutor și încercăm să ne facem datoria cum putem
mai bine, astfel încât toată lumea să prospere — în adevăratul, propriul,
spiritualul sens al cuvântului. După cele mai bune intenții, imperfecte,
umane, dar cu cele mai înalte aspirații.

Mulțumim pentru sprijin, dragoste și credință.

Te rugăm să ne lași opinia ta reală despre cauză și ce am putea îmbunătăți.
Orice gând îl primim cu inima deschisă la support@energyprojectdesign.com.
"""

# Subject pentru emailul de mulțumire
DONATION_THANK_YOU_SUBJECT = "Mulțumim pentru sprijin · Energy Project Design"

# Email destinație pentru centralizarea mesajelor și a opiniilor donatorilor
DONOR_SUPPORT_INBOX = "support@energyprojectdesign.com"


def build_thank_you_email_body(donor_name: str | None, amount: float, currency: str,
                               donor_message: str | None = None) -> str:
    """Construiește corpul emailului personalizat pentru donator."""
    greeting = f"Dragă {donor_name},\n\n" if donor_name and donor_name.strip() and donor_name.strip().lower() != "anonim" else "Dragă susținător,\n\n"

    amount_str = f"{amount:.2f} {currency.upper()}"

    body = greeting
    body += f"Tocmai am primit donația ta de {amount_str}.\n\n"
    body += DONATION_THANK_YOU_NOTE
    body += "\n"
    if donor_message and donor_message.strip():
        body += "\nMesajul tău a ajuns la noi. Îl citim cu atenție.\n"
    body += "\n— Dragoș și echipa Energy Project Design\n"
    body += "\nEnergy Project Design S.R.L. · CUI 43151074 · J40/12982/2020\n"
    return body


def build_support_forward_body(donor_name: str | None, donor_email: str | None,
                                amount: float, currency: str, message: str,
                                donation_id: str) -> str:
    """Construiește corpul emailului forward către support@ cu mesajul donatorului."""
    name = donor_name or "Anonim"
    email = donor_email or "(nu a furnizat)"
    body = "Mesaj nou de la un donator:\n\n"
    body += f"De la:    {name}\n"
    body += f"Email:    {email}\n"
    body += f"Donație:  {amount:.2f} {currency.upper()}\n"
    body += f"ID:       {donation_id}\n"
    body += "─" * 60 + "\n"
    body += "Mesaj:\n\n"
    body += message.strip()
    body += "\n" + "─" * 60 + "\n"
    body += "\nResponse direct: răspunzi la acest email și ajunge la donator.\n"
    return body
