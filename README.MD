# Decentrilizuota statymų programa

## _Programos paleidimas_
- Paleisikite __Ganache__, susikurkite nauja workbench'ą ir nustatykite server port'ą __7545__
- Prisijunkite prie __Metamask__, pasirinkite test serverį (turėtų automatiškai atsirasti) ir importuokite paskyrą iš __Ganache__
- Paleiskite šias komandas projekto root direktorijoje: 
    ``` truffle compile ```
    ``` truffle migrate ```
- Aplanke __frontend__ paleiskite komandą ``` yarn start ```

## Apie programą

- Paleidus programą kairėje ekrano pusėje matome *Actions* sekcija, kurioje yra mygtukas __Add bet__
- Paspaudus šį mygtuką, atsidaro modal'as, kuriame galima įrašyti naujo statymo informacija (aprašymą, statymo kainą, laiko limitus)
- Užpildžius formą, ją reikės patvirtinti per __Metamask__
- Sėkmingai patvirtinus naują statymą, jis atsiranda sekcijoje *Bets*, kuriame matoma įvesta informacija, bei laiko limitas sekundėmis
- Daryti statymą galima tik vieną kartą iš vienos paskyros, t.y. bandant pastatyti antrą kartą, transakcija nepavyks
- Įvykus statymams, vyksta balsavimo etapas (vartotojai balsuoja ar statymas teisingas ar ne), kuriame galima dalyvauti taip pat tik vieną kartą
- Pasibaigus laikui, parodomas statymo rezultatas (kas laimėjo) ir leidžiama atsiimti laimėjimą
