// Recursive descent algorithm

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "parser.h"
#include "ast.h"





Parser* parser_init(TokenList* tokens) {
    Parser* parser = malloc(sizeof(Parser));
    parser -> tokens = tokens;
    parser -> pos = 0;
    parser -> currentToken = tokens -> data[0];
}

void parser_error(Parser* parser, const char* message) {
    fprintf(stderr, "[Erreur Syntaxique] Ligne %d: %s. Trouvé: '%s'\n", 
            parser->currentToken.line, 
            message, 
            parser->currentToken.value ? parser->currentToken.value : "Mot-clé");
    exit(1); // compiler stop
}

void parser_eat(Parser* parser, TokenType type) {
    if (parser -> currentToken.type == type) {
        parser -> pos++;

        if (parser->pos < parser->tokens->count) { // inférieur strict pour ne pas prendre en compte l'EOF.
            parser -> currentToken = parser -> token -> data[parser -> pos];
        } else {
            char msg[100];
            sprintf(msg, "Attendu: Type %d, Trouvé: Type %d", type, parser->currentToken.type);
            parser_error(parser, msg);
        }
    }
}

void parser_free(Parser* parser) {

}

ASTNode* parser_run(TokenList* list) {
    //Initialiser le parser
    Parser* parser = parser_init(list);
    //Parser le programme
    noeud_racine = ParserProgramme(parser);
    //Vérifie EOF
    if (list->currentToken->type != TOK_EOF) {
        parser_error(parser, "Pas de TOken EOF");
    }
    //Free le parser
    parser_free(parser);

    return noeud_racine;
    
}

ASTNode* parser_parseExpression(Parser* parser) {
    
    ASTNode* node_gauche = parser_parseSimpleExpression(parser); //On parse la partie gauche de la comparaison
    TokenType type = parser->currentToken.type; // On récupère le type de token de comparaison

    if ( type == TOK_LT || type == TOK_GT || type ==TOK_EQ) { 
        Token tok_save = parser -> currentToken //On save le token pour générer le node.
        parser_eat(parser, type);

        ASTNode* node_droite = parser_parseSimpleExpression(parser); // On récupère la partie droite de la comparaison

        node gauche = init_ast_node(AST_BIN_OP, node_gauche, node_droite, tok_save) //On change le noeud racine en comparaison.
    }
    return node_gauche
}



ASTNode* parser_parseWrite(Parser* parser) {
    Token tok_save = parser -> currentToken
    parser_eat(parser, TOK_WRITE); // eat le write
    parser_eat(parser, TOK_LPAREN); //eat (

    ASTNode* expr = parser_parseExpression(parser); //parse de la première expression

    ASTNode* node = init_ast_node(AST_WRITE, expr, NULL, tok_save)
    ASTNode* current = node;

    while(parser->currentToken.type == TOK_COMMA) {
        parser_eat(parser, TOK_COMMA);

        ASTNode* next_expr = parser_parseExpression(parser);
        ASTNode* next_node = init_ast_node(AST_WRITE, next_expr, NULL, tok_save);
        current->right = next_node
        current = next_node
    }

    parser_eat(parser, TOK_RPAREN);
    return node;
}

void parser_parseType(Parser* parser) {
    if (parser->currentToken->type = TOK_INTEGER) {
        parser_eat(parser, TOK_INTEGER)
    } else {
        parser_error(parser, "Pas le type attendu (Integer)")
    }
}