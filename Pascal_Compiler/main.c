#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "lexer.h" 
#include "parser.h"
#include "semantic.h"
#include "codegen.h"

// Utilitaire pour lire tout le fichier d'un coup
char* lire_fichier(const char* nom_fichier);
// Utilitaire pour changer l'extension (.pas -> .s)
char* changer_extension(const char* nom_entree, const char* nouvelle_ext);


int main(int argc, char* argv[]) {
    
    // Number of arguments verifications
    if (argc != 2) {
        fprintf(stderr, "Erreur : Utilisation incorrecte.\n");
        fprintf(stderr, "Usage : pcompile <fichier.pas>\n");
        return 1;
    }

    char* nom_fichier_source = argv[1];

    char* code_source = lire_fichier(nom_fichier_source);
    if (!code_source) {
        fprintf(stderr, "Erreur : Impossible d'ouvrir le fichier %s\n", nom_fichier_source);
        return 1;
    }

    /* ---------------------------------------------------------------------
       LEXER
       Input : Pascal file
       Output : List of tokens
       --------------------------------------------------------------------- */
    TokenList* tokens = lexer_analyser(code_source);
    
    if (lexer_a_echoue(tokens)) {
        fprintf(stderr, "Arrêt : Erreur lexicale détectée.\n");
        free(code_source);
        return 1;
    }

    /* ---------------------------------------------------------------------
       PHASE 2 : PARSER (Analyse Syntaxique)
       Entrée : Liste de jetons (tokens)
       Sortie : Arbre Syntaxique Abstrait (AST)
       --------------------------------------------------------------------- */
    printf("[2/4] Analyse Syntaxique en cours...\n");
    ASTNode* arbre = parser_construire_arbre(tokens);

    if (arbre == NULL) {
        fprintf(stderr, "Arrêt : Erreur de syntaxe détectée.\n");
        // Nettoyage mémoire des tokens
        return 1;
    }

    /* ---------------------------------------------------------------------
       PHASE 3 : SÉMANTIQUE (Vérification des types et du sens)
       Entrée : Arbre (AST)
       Sortie : Arbre validé (ou erreur)
       --------------------------------------------------------------------- */
    printf("[3/4] Vérification Sémantique en cours...\n");
    int est_valide = semantic_verifier(arbre);

    if (!est_valide) {
        fprintf(stderr, "Arrêt : Erreur sémantique (types ou variables).\n");
        return 1;
    }

    /* ---------------------------------------------------------------------
       PHASE 4 : GÉNÉRATEUR (Création de l'Assembleur)
       Entrée : Arbre (AST) validé
       Sortie : Fichier .s écrit sur le disque
       --------------------------------------------------------------------- */
    printf("[4/4] Génération du code Assembleur...\n");
    
    // On prépare le nom de sortie (ex: test.pas -> test.s)
    char* nom_fichier_sortie = changer_extension(nom_fichier_source, ".s");
    
    codegen_generer(arbre, nom_fichier_sortie);

    printf("[SUCCÈS] Code assembleur généré dans : %s\n", nom_fichier_sortie);
    printf("Pour créer l'exécutable final, lancez :\n");
    printf("gcc %s -o programme_final\n", nom_fichier_sortie);

    // ---------------------------------------------------------------------
    // NETTOYAGE (Libération de la mémoire)
    // ---------------------------------------------------------------------
    free(code_source);
    free(nom_fichier_sortie);
    // free_tokens(tokens); // À implémenter
    // free_ast(arbre);     // À implémenter

    return 0;
}





char* lire_fichier(const char* nom_fichier) {
    FILE* f = fopen(nom_fichier, "rb");
    if (!f) return NULL;

    fseek(f, 0, SEEK_END);
    long longueur = ftell(f);
    fseek(f, 0, SEEK_SET);

    char* buffer = malloc(longueur + 1);
    if (buffer) {
        fread(buffer, 1, longueur, f);
        buffer[longueur] = '\0';
    }
    fclose(f);
    return buffer;
}

char* changer_extension(const char* nom_entree, const char* nouvelle_ext) {
    char* dot = strrchr(nom_entree, '.');
    if (!dot || dot == nom_entree) return strdup(nouvelle_ext); // Pas d'extension
    
    size_t len_nom = dot - nom_entree;
    char* nouveau_nom = malloc(len_nom + strlen(nouvelle_ext) + 1);
    
    strncpy(nouveau_nom, nom_entree, len_nom);
    nouveau_nom[len_nom] = '\0';
    strcat(nouveau_nom, nouvelle_ext);
    
    return nouveau_nom;
}