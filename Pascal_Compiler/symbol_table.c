#include <stdlib.h>
#include <string.h>
#include <stdio.h>

#include "lexer.h"
#include "symbol_table.h"


SymbolTable* st_init() {
    SymbolTable* st = (SymbolTable*)malloc(sizeof(SymbolTable));

    if  (st == NULL) {
        fprintf(stderr, "Erreur d'allocation mémoire pour la table des symboles\n");
        exit(1);
    }
    st->head = NULL;
    st->count = 0;
    return st;
}

// Fonction uniquement appelé lors d'une décla de variable -> AST VAR_DECL
int st_add(SymbolTable* st, char* name, TokenType type) {
    
    if (st_lookup(st, name) != NULL) {
        return -1; // Variable déjà déclarée
    }

    Symbol* new_symb = (Symbol*)malloc(sizeof(Symbol));
    if (new_symb == NULL) {
        fprintf(stderr, "Erreur d'allocation mémoire\n");
        exit(1);
    }
    new_symb->name = strdup(name);
    new_symb->type = type;
    new_symb->is_init = false;

    // On ajoute en début de liste (pour éviter de devoir parcourir toute la liste à chaque ajout)
    new_symb->next = st->head; //On relie le nouveau symbole à la liste
    st->head = new_symb; // On met à jour la liste pour que le nouveau symbole soit la tête

    st->count++;
    return 0;
}

Symbol* st_lookup(SymbolTable* st, const char* name) {
    if (st == NULL) return NULL;

    Symbol* current = st->head;
    while (current!=NULL) {
        if (strcmp(current->name,name) == 0) {
            return current; // Symbole trouvé
        }
        current = current->next;
    }
    return NULL; // Symbole non trouvé
}

void st_free(SymbolTable* st) {
    if (st == NULL) return;

    Symbol* current = st->head;
    while (current != NULL) {
        Symbol* next = current->next;
        free(current->name); // Libération du nom de la variable
        free(current); // Libération du symbole lui-même
        current = next;
    }

    free(st); // Libération de la table des symboles
}