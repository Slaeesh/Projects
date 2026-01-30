#ifndef PARSER_H
#define PARSER_H

#include "lexer.h"  // Pour Token, TokenList, TokenType
#include "ast.h"    // Pour les noeuds de l'arbre (ASTNode)

/**
 * @brief Structure du Parser adapté à une TokenList
 * * Au lieu d'appeler le lexer à chaque fois, on navigue
 * dans le tableau de tokens déjà généré.
 */
typedef struct {
    TokenList* tokens;   // La liste complète des jetons générés par le lexer
    size_t pos;          // L'index du jeton actuel dans le tableau (curseur)
    Token currentToken;  // Copie ou référence du jeton actuel (pour accès rapide)
} Parser;

/* =========================================================================
 * INITIALISATION & UTILITAIRES
 * ========================================================================= */

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

/* =========================================================================
 * FONCTIONS D'ANALYSE (Recursive Descent)
 * Ces fonctions correspondent aux boîtes de ton diagramme Mermaid.
 * ========================================================================= */

// --- NIVEAU 1 : STRUCTURE GLOBALE ---

// Point d'entrée : Analyse PROGRAM ... END.
ASTNode* parser_parseProgram(Parser* parser);

// Analyse la section VAR ... ;
ASTNode* parser_parseVarDeclarations(Parser* parser); 


// --- NIVEAU 2 : INSTRUCTIONS ---

// Analyse un bloc complet (souvent entre BEGIN et END)
ASTNode* parser_parseBlock(Parser* parser);

// Analyse une seule instruction (IF, WHILE, Affectation, ou un Bloc imbriqué)
ASTNode* parser_parseStatement(Parser* parser);

// Sous-fonctions pour les instructions spécifiques
ASTNode* parser_parseAssignment(Parser* parser); 
ASTNode* parser_parseIf(Parser* parser);         
ASTNode* parser_parseWhile(Parser* parser);      


// --- NIVEAU 3 : EXPRESSIONS (Maths) ---

// Gère les additions/soustractions (priorité faible)
ASTNode* parser_parseExpression(Parser* parser);

// Gère les multiplications/divisions (priorité moyenne)
ASTNode* parser_parseTerm(Parser* parser);

// Gère les nombres, variables et parenthèses (priorité haute)
ASTNode* parser_parseFactor(Parser* parser);

#endif // PARSER_H