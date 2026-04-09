//gcc test_lexer.c lexer.c -o test_lexer
#include <stdio.h>
#include <stdlib.h>
#include "lexer.h"

// Petite fonction pour lire tout le fichier dans une chaîne
char* lire_fichier(const char* filename) {
    FILE* f = fopen(filename, "rb");
    if (!f) {
        printf("Erreur : Impossible d'ouvrir %s\n", filename);
        return NULL;
    }
    fseek(f, 0, SEEK_END);
    long length = ftell(f);
    fseek(f, 0, SEEK_SET);
    
    char* buffer = malloc(length + 1);
    fread(buffer, 1, length, f);
    buffer[length] = '\0';
    fclose(f);
    return buffer;
}

int main(int argc, char* argv[]) {
    // On force l'utilisation du fichier full_test.pas
    const char* fichier = "test_file.pas";

    printf("Test du Lexer sur : %s\n", fichier);
    
    char* source = lire_fichier(fichier);
    if (!source) return 1;

    // Lancement de l'analyse
    TokenList* tokens = lexer_analyser(source);

    // Affichage du résultat
    lexer_print_debug(tokens);

    // Nettoyage
    free(source);
    // free_tokens(tokens); // À décommenter si implémenté
    
    return 0;
}