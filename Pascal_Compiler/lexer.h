#ifndef LEXER_H
#define LEXER_H

#include <stdlib.h> // Pour size_t


typedef enum {
    // Special Tokens
    TOK_EOF,         // Enf of File
    TOK_ERROR,       // Unknown caracter

    // Pascal Commands Tokends
    TOK_PROGRAM,
    TOK_VAR,        
    TOK_BEGIN,      
    TOK_END,        
    TOK_IF,         
    TOK_THEN,      
    TOK_ELSE,       
    TOK_WHILE,     
    TOK_DO,          
    TOK_INTEGER,   
    TOK_WRITE,       

    // --- Données variables ---
    TOK_ID,          // Variable (ex: "maVariable", "x", "compteur").Pour le moment les variables ne peuvent pas contenir de _.
    TOK_NUMBER,      // Integer only (ex: "42", "100")

    // --- Symboles et Opérateurs ---
    TOK_ASSIGN,      // ":=" (Affectation)
    TOK_COLON,       // ":"  (Deux-points)
    TOK_SEMI,        // ";"  (Point-virgule)
    TOK_DOT,         // "."  (Point final)
    TOK_COMMA,       // ","  (Virgule)
    TOK_LPAREN,      // "("
    TOK_RPAREN,      // ")"
    TOK_PLUS,        // "+"
    TOK_MINUS,       // "-"
    TOK_MULT,        // "*"
    TOK_DIV,         // "/"
    TOK_EQ,          // "="  
    TOK_LT,          // "<"  
    TOK_GT           // ">" 

} TokenType;

typedef struct {
    TokenType type;     // L'étiquette (ex: TOK_NUMBER)
    char* value;        // Le texte exact (ex: "42" ou "maVar")
    int line;           // Le numéro de ligne (pour les erreurs)
} Token;

typedef struct {
    Token* data;        // Tableau dynamique de Tokens
    size_t count;       // Nombre actuel de tokens
    int has_error;      // 1 si une erreur lexicale a eu lieu, 0 sinon
} TokenList;


/**
 * @brief Fonction principale du lexer
 *
 * Son but est de transformer un fichier .pas en liste de tokens.
 *
 * @param source fichier source .pas.
 * @return liste de Tokens.
 */
TokenList* lexer_analyser(const char* source);

/**
 * @brief Verifie si le lexer a rencontre une erreur.
 *
 * @param list liste des Tokens.
 * @return .
 */
int lexer_a_echoue(TokenList* list);
 
/**
 * @brief Clear memory once finished
 *
 * @param list liste des Tokens.
 */
void free_tokens(TokenList* list);

/**
 * @brief Print the list of tokens.
 *
 * @param list liste des Tokens.
 */
void lexer_print_debug(TokenList* list);

#endif