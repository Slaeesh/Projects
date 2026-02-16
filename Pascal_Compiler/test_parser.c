// gcc test_parser.c lexer.c parser.c ast.c -o test_parser
// ./test_parser

#include <stdio.h>
#include <stdlib.h>
#include "lexer.h"
#include "parser.h"
#include "ast.h"

// --- Fonction utilitaire pour lire tout le fichier dans une string ---
char* read_file(const char* filename) {
    FILE* file = fopen(filename, "r");
    if (!file) {
        fprintf(stderr, "Erreur : Impossible d'ouvrir '%s'\n", filename);
        return NULL;
    }

    // Calculer la taille du fichier
    fseek(file, 0, SEEK_END);
    long length = ftell(file);
    fseek(file, 0, SEEK_SET);

    // Allouer la mémoire (+1 pour le \0 final)
    char* buffer = malloc(length + 1);
    if (!buffer) {
        fprintf(stderr, "Erreur : Allocation mémoire échouée\n");
        fclose(file);
        return NULL;
    }

    // Lire le fichier
    size_t read_size = fread(buffer, 1, length, file);
    buffer[read_size] = '\0'; // Toujours terminer par null pour en faire une string valide

    fclose(file);
    return buffer;
}

int main() {
    printf("=== 1. Lecture du fichier source ===\n");
    char* source = read_file("test_file.pas");
    if (source == NULL) {
        return 1;
    }

    printf("=== 2. Analyse Lexicale (Lexer) ===\n");
    TokenList* tokens = lexer_analyser(source);
    printf("-> %zu tokens générés.\n", tokens->count);

    printf("=== 3. Analyse Syntaxique (Parser) ===\n");
    // parser_run s'occupe d'init, de parser et de free la structure parser
    ASTNode* root = parser_run(tokens);

    printf("=== 4. Affichage de l'AST ===\n");
    if (root != NULL) {
        // On appelle votre fonction existante avec indentation 0
        print_ast(root, 0);
    } else {
        printf("Erreur : L'arbre est vide (NULL).\n");
    }

    // Nettoyage basique
    free(source);
    // Note: Pour un programme complet, il faudrait aussi libérer 'tokens' et l'arbre 'root'.
    
    return 0;
}