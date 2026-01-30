PROGRAM TestComplet;

{ 
  Ceci est un commentaire multiligne.
  Le lexer doit ignorer tout ça.
}

VAR
    compteur, resultat : INTEGER;
    nom_variable_long : INTEGER;

BEGIN
    { Test des affectations et nombres }
    compteur := 10;
    resultat := 0;

    { Test des conditions et operateurs logiques }
    IF compteur > 5 THEN
    BEGIN
        resultat := compteur + 2;
    END
    ELSE
    BEGIN
        resultat := compteur - 1;
    END;

    { Test de la boucle et operateurs math }
    WHILE compteur < 20 DO
    BEGIN
        compteur := compteur + 1;
        resultat := resultat * 2 / (5 - 3);
        WRITE(resultat); { Test appel fonction }
    END;

    { Test de la fin du programme }
END.