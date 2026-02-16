#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h> // Pour isalpha, isdigit, isspace

#include "lexer.h"


TokenList* init_token_list() {
    TokenList* list = malloc(sizeof(TokenList));
    list->data = NULL; // On gère la mémoire au fur et à mesure pour n'allouer que la mémoire nécessaire
    list->count = 0;
    list->has_error = 0;
    
    return list;
}

void grow_token_list(TokenList* list) {
    size_t new_size = list->count + 1;

    Token* temp = realloc(list->data, sizeof(Token) * new_size); // Rajouter de la place pour un token

    if (temp == NULL) {
        fprintf(stderr, "Erreur : Plus de mémoire disponible pour le Lexer.\n");
        exit(1);
    }

    list->data = temp;
}

void add_token(TokenList* list, TokenType type, char* value, int line) {
    grow_token_list(list);

    // On écrit les données à partir de la dernière postion. Comme on vient de refaire de la place, c'est exactement count
    int index = list->count;
    
    list->data[index].type = type;
    list->data[index].value = value;
    list->data[index].line = line;
    
    // Augmenter nombres tokens
    list->count++;
}

TokenType check_keyword(char* text) {
    // On ne prend que des majuscules pour le moment.
    if (strcmp(text, "PROGRAM") == 0) return TOK_PROGRAM;
    if (strcmp(text, "VAR") == 0)     return TOK_VAR;
    if (strcmp(text, "BEGIN") == 0)   return TOK_BEGIN;
    if (strcmp(text, "END") == 0)     return TOK_END;
    if (strcmp(text, "IF") == 0)      return TOK_IF;
    if (strcmp(text, "THEN") == 0)    return TOK_THEN;
    if (strcmp(text, "ELSE") == 0)    return TOK_ELSE;
    if (strcmp(text, "WHILE") == 0)   return TOK_WHILE;
    if (strcmp(text, "DO") == 0)      return TOK_DO;
    if (strcmp(text, "INTEGER") == 0) return TOK_INTEGER;
    if (strcmp(text, "WRITE") == 0)   return TOK_WRITE;
    
    return TOK_ID; // si les caracteres ne sont pas des commandes, c'est une variable.
}



TokenList* lexer_analyser(const char* source) {
    TokenList* list = init_token_list();
    int i = 0;           // Position curseur
    int line = 1;        // Numéro de ligne actuel

    while (source[i] != '\0') {
        char c = source[i];

        if (isspace(c)) {
            if (c == '\n') line++; // On compte les lignes
            i++;
            continue; // On retourne au début de la boucle
        }

        if (c == '{') {
            while (source[i] != '}' && source[i] != '\0') {
                if (source[i] == '\n') line++;
                i++;
            }
            if (source[i] == '}') i++; // On saute le fermant
            continue;
        }

        // Cas pour les lettres
        if (isalpha(c) || c == '_') {
            int start = i;
            // On avance tant que c'est lettre ou chiffre
            while (source[i] != '\0' && (isalnum(source[i]) || source[i] == '_')) { 
                i++; 
            }
            
            // Extraction du mot
            int length = i - start;
            char* word = malloc(length + 1);
            strncpy(word, source + start, length);
            word[length] = '\0';

            // Vérification dans le dictionnaire
            TokenType type = check_keyword(word);
            
            // Si c'est un mot-clé, on n'a pas besoin de garder la valeur textuelle
            // Si c'est un ID, on garde le nom (ex: "compteur")
            if (type != TOK_ID) {
                free(word); // Pas besoin de stocker "BEGIN"
                word = NULL;
            }
            add_token(list, type, word, line);
            continue;
        }

        // Cas pour les chiffres
        if (isdigit(c)) {
            int start = i;
            
            // On regarde le nbr de chiffres
            while (isdigit(source[i])) {
                i++;
            }
            
            // Cas où une variable commence par un chiffre => erreur
            if (isalpha(source[i]) || source[i] == '_') {
                printf("Erreur Lexicale ligne %d : Identifiant invalide commençant par un chiffre.\n", line);
                
                // On arrête la compilation
                list->has_error = 1;
                return list; 
            }
            
            // On crée le token
            int length = i - start;
            char* number_str = malloc(length + 1);
            
            // Copie manuelle ou strncpy
            strncpy(number_str, source + start, length);
            number_str[length] = '\0';

            add_token(list, TOK_NUMBER, number_str, line);
            continue;
        }

        // Cas pour les symboles
        switch (c) {
            case ';': add_token(list, TOK_SEMI, NULL, line); i++; break;
            case '.': add_token(list, TOK_DOT, NULL, line); i++; break;
            case '+': add_token(list, TOK_PLUS, NULL, line); i++; break;
            case '-': add_token(list, TOK_MINUS, NULL, line); i++; break;
            case '*': add_token(list, TOK_MULT, NULL, line); i++; break;
            case '/': add_token(list, TOK_DIV, NULL, line); i++; break;
            case ',': add_token(list, TOK_COMMA, NULL, line); i++; break;
            case '=': add_token(list, TOK_EQ, NULL, line); i++; break;
            case '<': add_token(list, TOK_LT, NULL, line); i++; break;
            case '>': add_token(list, TOK_GT, NULL, line); i++; break;
            case '(': add_token(list, TOK_LPAREN, NULL, line); i++; break;
            case ')': add_token(list, TOK_RPAREN, NULL, line); i++; break;
            
            // Cas spécial : Le Deux-points (:) ou l'Affectation (:=)
            case ':':
                if (source[i+1] == '=') {
                    // C'est :=
                    add_token(list, TOK_ASSIGN, NULL, line);
                    i += 2; // On saute les deux caractères
                } else {
                    // C'est juste :
                    add_token(list, TOK_COLON, NULL, line);
                    i++;
                }
                break;

            default:
                printf("Erreur Lexicale: Caractère '%c' inconnu à la ligne %d\n", c, line);
                list->has_error = 1;
                i++;
                break;
        }

    }

    add_token(list, TOK_EOF, NULL, line);
    return list;
}


int lexer_a_echoue(TokenList* list) {
    return list->has_error;
}

void free_tokens(TokenList* list) {
    for (size_t i = 0; i < list->count; i++) {
        if (list->data[i].value != NULL) {
            free(list->data[i].value);
        }
    }
    free(list->data);
    free(list);
}

// Fonction utilitaire pour traduire l'enum en texte
const char* token_type_to_string(TokenType type) {
    switch (type) {
        case TOK_EOF: return "EOF";
        case TOK_ERROR: return "ERROR";
        case TOK_PROGRAM: return "PROGRAM";
        case TOK_VAR: return "VAR";
        case TOK_BEGIN: return "BEGIN";
        case TOK_END: return "END";
        case TOK_IF: return "IF";
        case TOK_THEN: return "THEN";
        case TOK_ELSE: return "ELSE";
        case TOK_WHILE: return "WHILE";
        case TOK_DO: return "DO";
        case TOK_INTEGER: return "INTEGER";
        case TOK_WRITE: return "WRITE";
        case TOK_ID: return "ID";
        case TOK_NUMBER: return "NUMBER";
        case TOK_ASSIGN: return "ASSIGN (:=)";
        case TOK_COLON: return "COLON (:)";
        case TOK_SEMI: return "SEMI (;)";
        case TOK_DOT: return "DOT (.)";
        case TOK_COMMA: return "COMMA (,)";
        case TOK_LPAREN: return "LPAREN (()";
        case TOK_RPAREN: return "RPAREN ())";
        case TOK_PLUS: return "PLUS (+)";
        case TOK_MINUS: return "MINUS (-)";
        case TOK_MULT: return "MULT (*)";
        case TOK_DIV: return "DIV (/)";
        case TOK_EQ: return "EQ (=)";
        case TOK_LT: return "LT (<)";
        case TOK_GT: return "GT (>)";
        default: return "UNKNOWN";
    }
}

void lexer_print_debug(TokenList* list) {
    printf(" LISTE DES TOKENS (%zu trouvés) \n", list->count);
    printf("%-15s | %-15s | %s\n", "TYPE", "VALEUR", "LIGNE");
    printf("------------------------------------------------\n");

    for (size_t i = 0; i < list->count; i++) {
        Token t = list->data[i];
        const char* type_str = token_type_to_string(t.type);
        
        // Si la valeur est NULL (pour les mots-clés ou symboles), on affiche "-"
        char* val_str = (t.value != NULL) ? t.value : "-";

        printf("%-15s | %-15s | %d\n", type_str, val_str, t.line);
    }
}