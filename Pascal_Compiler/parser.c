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
            parser -> currentToken = parser -> tokens -> data[parser -> pos];
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
    ASTNode* noeud_racine = ParserProgramme(parser);
    //Vérifie EOF
    if (parser->currentToken.type != TOK_EOF) {
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
        Token tok_save = parser -> currentToken; //On save le token pour générer le node.
        parser_eat(parser, type);

        ASTNode* node_droite = parser_parseSimpleExpression(parser); // On récupère la partie droite de la comparaison

        node_gauche = init_ast_node(AST_BIN_OP, node_gauche, node_droite, tok_save); //On change le noeud racine en comparaison.
    }
    return node_gauche;
}


ASTNode* parser_parseSimpleExpression(Parser* parser) {
    ASTNode* node_gauche = parser_parseTerm(parser);

    while (parser->currentToken.type == TOK_PLUS || parser->currentToken.type == TOK_MINUS) {
        Token tok_save = parser -> currentToken;
        parser_eat(parser, tok_save.type);

        ASTNode* node_droite = parser_parseTerm(parser);
        node_gauche = init_ast_node(AST_BIN_OP, node_gauche, node_droite, tok_save);
    }
    return node_gauche;
}


ASTNode* parser_parseTerm(Parser* parser) {
    ASTNode* node_gauche = parser_parseFactor(parser);

    while (parser->currentToken.type == TOK_MULT || parser->currentToken.type == TOK_DIV) {
        Token tok_save = parser-> currentToken;
        parser_eat(parser, tok_save.type);

        ASTNode* node_droite = parser_parseFactor(parser);
        node_gauche = init_ast_node(AST_BIN_OP, node_gauche, node_droite, tok_save);
    }
    return node_gauche;
}


ASTNode* parser_parseFactor(Parser* parser) {
    Token tok_save = parser->currentToken;

    if (tok_save.type == TOK_NUMBER) {
        parser_eat(parser, TOK_NUMBER);
        return init_ast_leaf_int(tok_save);

    } else if (tok_save.type == TOK_ID) {
        parser_eat(parser, TOK_ID);
        return init_ast_leaf_var(tok_save);
    } else if (tok_save.type == TOK_LPAREN) {
        parser_eat(parser, TOK_LPAREN);
        ASTNode* node = parser_parseExpression(parser);
        parser_eat(parser, TOK_RPAREN);
        return node;
    }
    
}








ASTNode* parser_parseProgram(Parser* parser) {
    Token tok_save = parser->currentToken;
    parser_eat(parser, TOK_PROGRAM);    //Le premier token est forcément celui du programme.

    parser_eat(parser, TOK_ID);         //Le token d'après est celui du nom de programme 
    parser_eat(parser, TOK_SEMI);       //Le token d'après est un point virgule

    ASTNode* var_node = NULL;   //REstera à NULL si pas de section VAR
    if (parser->currentToken.type == TOK_VAR) {
        var_node = parser_parseVarDeclarations(parser);
    } 

    ASTNode* bloc_node = parser_parseBlock(parser);

    parser_eat(parser, TOK_DOT);

    ASTNode* prog_node = init_ast_node(AST_PROGRAM, var_node,bloc_node, tok_save);
    return prog_node;
}


ASTNode* parser_parseBlock(Parser* parser) {
    Token tok_save = parser -> currentToken;
    parser_eat(parser, TOK_BEGIN);

    if (parser->currentToken.type == TOK_END) {  //gestion du cas où pas d'instructions
        parser_eat(parser, TOK_END);
        return init_ast_node(AST_NOOP, NULL, NULL, tok_save);
    }

    //On sait qu'il y a au moins une expression
    ASTNode* stmt = parser_parseStatement(parser);
    ASTNode* root = init_ast_node(AST_COMPOUND,stmt, NULL, tok_save);
    ASTNode* current =  root;

    while (parser->currentToken.type == TOK_SEMI) {
        parser_eat(parser, TOK_SEMI);

        ASTNode* next_stmt = parser_parseStatement(parser);
        ASTNode* next_node = init_ast_node(AST_COMPOUND, next_stmt, NULL, tok_save=;
        current-> right= next_node;
        current = next_node;
    }

    parser_eat(parser, TOK_END);



}









ASTNode* parser_parseWrite(Parser* parser) {
    Token tok_save = parser -> currentToken;
    parser_eat(parser, TOK_WRITE); // eat le write
    parser_eat(parser, TOK_LPAREN); //eat (

    ASTNode* expr = parser_parseExpression(parser); //parse de la première expression

    ASTNode* node = init_ast_node(AST_WRITE, expr, NULL, tok_save);
    ASTNode* current = node;

    while(parser->currentToken.type == TOK_COMMA) {
        parser_eat(parser, TOK_COMMA);

        ASTNode* next_expr = parser_parseExpression(parser);
        ASTNode* next_node = init_ast_node(AST_WRITE, next_expr, NULL, tok_save);
        current->right = next_node;
        current = next_node;
    }

    parser_eat(parser, TOK_RPAREN);
    return node;
}

void parser_parseType(Parser* parser) {
    if (parser->currentToken.type = TOK_INTEGER) {
        parser_eat(parser, TOK_INTEGER);
    } else {
        parser_error(parser, "Pas le type attendu (Integer)");
    }
}