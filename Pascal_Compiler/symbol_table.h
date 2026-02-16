#ifndef SYMBOL_TABLE_H
#define SYMBOL_TABLE_H

#include "lexer.h"
#include <stdbool.h>

typedef struct Symbol {
    char* name;             // Nom de la variable (ex: "count")
    TokenType type;         // Type (ex: TOK_INTEGER)
    bool is_init;     // warning "variable utilisée non initialisée"
    struct Symbol* next;    // prochaine Symbol
} Symbol;

typedef struct SymbolTable {
    Symbol* head;          // Tête de la liste chaînée des symboles
    int count;             // Nombre de symboles dans la table
} SymbolTable;

// Fonctions

SymbolTable* st_init();
int st_add(SymbolTable* st, char* name, TokenType type); // Retourne 0 si succès, -1 si déjà existe
Symbol* st_lookup(SymbolTable* st, char* name);          // Retourne le symbole ou NULL
void st_free(SymbolTable* st);

#endif