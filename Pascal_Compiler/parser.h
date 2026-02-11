#ifndef PARSER_H
#define PARSER_H

#include "lexer.h"  // Pour Token, TokenList, TokenType
#include "ast.h"    // Pour les noeuds de l'arbre (ASTNode)


/* Priorités pour le langage Pascal: (plus bas au plus haut)
1 : Les comparaisons (=,<,>,...) -> parser_parseExpression
2 : Les termes (+, -, ...) -> parser_parseSimpleExpression
3 : Les facteurs (=, /,...) -> parser_parseTerme
4 : Les atomes ((,), nbr, variables, ...) -> parser_parseFactor
*/


typedef struct {
    TokenList* tokens;   // La liste complète des jetons générés par le lexer
    size_t pos;          // L'index du jeton actuel dans le tableau (curseur)
    Token currentToken;  // Copie ou référence du jeton actuel (pour accès rapide)
} Parser;

// ====================== Autre ====================
/**
 * @brief Initialise le parser avec la liste de tokens
 * @param tokens La liste générée par lexer_analyser
 */
Parser* parser_init(TokenList* tokens);

/**
 * @brief Vérifie le type du jeton actuel et avance au suivant.
 * * C'est ici qu'on incrémente 'pos'.
 * Si le type attendu ne correspond pas -> Erreur.
 */
void parser_eat(Parser* parser, TokenType type);

/**
 * @brief Affiche une erreur de syntaxe et termine (ou signale) l'échec.
 */
void parser_error(Parser* parser, const char* message);

void parser_free(Parser* parser);
// ====================== Fin Autre ====================




// ====================== Main ====================
/**
 * @brief Point d'entrée UNIQUE du module Parser.
 *
 * Cette fonction s'occupe de tout :
 * 1. Initialiser le parser.
 * 2. Lancer l'analyse du programme.
 * 3. Nettoyer la mémoire du parser (pas l'AST, juste la structure parser).
 * * @param tokens La liste des tokens générée par le lexer.
 * @return La racine de l'AST (AST_PROGRAM) ou NULL en cas d'erreur.
 */
ASTNode* parser_run(TokenList* list);
// ====================== Fin Main ====================








// ====================== Priorités ====================
ASTNode* parser_parseExpression(Parser* parser);
ASTNode* parser_parseSimpleExpression(Parser* parser);
ASTNode* parser_parseTerm(Parser* parser);
ASTNode* parser_parseFactor(Parser* parser);
// ====================== Fin Priorités ====================








// ====================== Début ====================
// Point d'entrée : Analyse PROGRAM ... END.
ASTNode* parser_parseProgram(Parser* parser);
// ====================== Fin Début ====================







// ====================== Instructions ====================
// Analyse la section VAR ... ;
ASTNode* parser_parseVarDeclarations(Parser* parser); 

// Analyse un bloc d'instructions (souvent entre BEGIN et END)
ASTNode* parser_parseBlock(Parser* parser);

// Dispatche vers la bonne fonction selon le token (IF, WHILE, ID...)
ASTNode* parser_parseStatement(Parser* parser);

// Sous-fonctions spécifiques
ASTNode* parser_parseAssignment(Parser* parser); // x := ...
ASTNode* parser_parseIf(Parser* parser);         // IF ... THEN ... ELSE
ASTNode* parser_parseWhile(Parser* parser);      // WHILE ... DO ...
ASTNode* parser_parseWrite(Parser* parser);      // WRITE(...)
void parser_parseType(Parser* parser);          // Vérifie qu'on a bien un type (ex: INTEGER) et consomme le token. Si on veut rajouter des types, c'est ici
// ====================== Fin Instructions ====================

#endif // PARSER_H