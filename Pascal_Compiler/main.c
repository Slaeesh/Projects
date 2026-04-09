#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Inclusion de tes modules
#include "lexer.h" 
#include "parser.h"
#include "semantic.h"
#include "codegen.h"

// --- Macros pour la compatibilité Windows/Linux ---
#ifdef _WIN32
    #define EXE_EXT ".exe"
#else
    #define EXE_EXT ""
#endif

// --- Prototypes des fonctions utilitaires (implémentées à la fin) ---
char* lire_fichier(const char* nom_fichier);
char* changer_extension(const char* nom_entree, const char* nouvelle_ext);

int main(int argc, char* argv[]) {
    
    // =================================================================
    // 0. Vérification des arguments
    // =================================================================
    if (argc != 2) {
        fprintf(stderr, "Usage : %s <fichier.pas>\n", argv[0]);
        return 1;
    }

    char* nom_fichier_source = argv[1];

    // Lecture du fichier source en mémoire
    char* code_source = lire_fichier(nom_fichier_source);
    if (!code_source) {
        fprintf(stderr, "Erreur fatale : Impossible d'ouvrir ou lire %s\n", nom_fichier_source);
        return 1;
    }

    // =================================================================
    // 1. ANALYSE LEXICALE (Lexer)
    // =================================================================
    printf("[1/5] Analyse Lexicale...\n");
    TokenList* tokens = lexer_analyser(code_source);
    
    // Le code source brut n'est plus utile, on libère la mémoire
    free(code_source);

    if (lexer_a_echoue(tokens)) { //
        fprintf(stderr, ">> ECHEC : Erreur lexicale détectée.\n");
        free_tokens(tokens);
        return 1;
    }

    // =================================================================
    // 2. ANALYSE SYNTAXIQUE (Parser)
    // =================================================================
    printf("[2/5] Analyse Syntaxique...\n");
    ASTNode* arbre = parser_run(tokens); //

    if (arbre == NULL) {
        fprintf(stderr, ">> ECHEC : Erreur de syntaxe détectée.\n");
        free_tokens(tokens);
        return 1;
    }

    // =================================================================
    // 3. ANALYSE SÉMANTIQUE (Types et variables)
    // =================================================================
    printf("[3/5] Vérification Sémantique...\n");
    // Retourne 0 si succès, -1 si erreur
    if (semantic_analysis(arbre) != 0) {
        fprintf(stderr, ">> ECHEC : Erreur sémantique (variable non déclarée ou type incorrect).\n");
        free_tokens(tokens);
        free_ast(arbre); //
        return 1;
    }

    // =================================================================
    // 4. GÉNÉRATION DE CODE (Transpilation C)
    // =================================================================
    printf("[4/5] Génération du code C...\n");
    
    // On change l'extension : "mon_prog.pas" -> "mon_prog.c"
    char* nom_fichier_c = changer_extension(nom_fichier_source, ".c");
    
    if (codegen_generate(arbre, nom_fichier_c) != 0) {
        fprintf(stderr, ">> ECHEC : Impossible d'écrire le fichier %s\n", nom_fichier_c);
        free(nom_fichier_c);
        free_tokens(tokens);
        free_ast(arbre);
        return 1;
    }
    printf("   -> Fichier généré : %s\n", nom_fichier_c);

    // =================================================================
    // 5. COMPILATION FINALE (Appel GCC)
    // =================================================================
    printf("[5/5] Compilation native (GCC)...\n");

    // Nom de l'exécutable : "mon_prog.pas" -> "mon_prog" (ou "mon_prog.exe" sous Windows)
    char* nom_executable = changer_extension(nom_fichier_source, EXE_EXT);

    // Construction de la commande : gcc "fichier.c" -o "fichier.exe"
    char commande[1024];
    snprintf(commande, sizeof(commande), "gcc \"%s\" -o \"%s\"", nom_fichier_c, nom_executable);

    printf("   -> Exécution : %s\n", commande);
    int ret_gcc = system(commande);

    // =================================================================
    // NETTOYAGE ET FIN
    // =================================================================
    
    // Libération de la mémoire du compilateur
    free_tokens(tokens);
    free_ast(arbre);
    
    // Vérification du résultat de GCC
    if (ret_gcc == 0) {
        printf("\n>>> SUCCÈS TOTAL !\n");
        printf(">>> Exécutable créé : ./%s\n", nom_executable);
        
        // Optionnel : Supprimer le fichier .c intermédiaire pour faire propre
        // remove(nom_fichier_c); 
    } else {
        fprintf(stderr, "\n>>> ERREUR : La compilation GCC a échoué.\n");
        fprintf(stderr, ">>> Vérifiez votre code C généré dans %s\n", nom_fichier_c);
    }

    free(nom_fichier_c);
    free(nom_executable);

    return (ret_gcc == 0) ? 0 : 1;
}


// =================================================================
// IMPLÉMENTATION DES UTILITAIRES
// =================================================================

char* lire_fichier(const char* nom_fichier) {
    FILE* f = fopen(nom_fichier, "rb");
    if (!f) return NULL;

    fseek(f, 0, SEEK_END);
    long longueur = ftell(f);
    fseek(f, 0, SEEK_SET);

    char* buffer = malloc(longueur + 1);
    if (buffer) {
        if (fread(buffer, 1, longueur, f) != (size_t)longueur) {
            // Erreur de lecture partielle
            free(buffer);
            fclose(f);
            return NULL;
        }
        buffer[longueur] = '\0';
    }
    fclose(f);
    return buffer;
}

char* changer_extension(const char* nom_entree, const char* nouvelle_ext) {
    char* nouveau_nom;
    char* point = strrchr(nom_entree, '.');
    
    // Calcul de la taille nécessaire
    size_t len_base;
    if (point != NULL && point != nom_entree) {
        len_base = point - nom_entree; // Longueur avant le dernier point
    } else {
        len_base = strlen(nom_entree); // Pas d'extension trouvée
    }

    nouveau_nom = malloc(len_base + strlen(nouvelle_ext) + 1);
    if (!nouveau_nom) return NULL;

    // Construction du nouveau nom
    strncpy(nouveau_nom, nom_entree, len_base);
    nouveau_nom[len_base] = '\0';
    strcat(nouveau_nom, nouvelle_ext);
    
    return nouveau_nom;
}