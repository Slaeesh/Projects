#include <stdio.h>
#include <stdlib.h>

int main() {
    // Variables
    int compteur;
    int resultat;
    int nom_variable_long;

    // Programme Principal
    compteur = 10;
    resultat = 0;
    if ((compteur > 5)) {
    resultat = (compteur + 2);
    }
    else {
    resultat = (compteur - 1);
    }
    while ((compteur < 20)) {
    compteur = (compteur + 1);
    resultat = ((resultat * 2) / (5 - 3));
    printf("%d\n", resultat);
    }

    return 0;
}
