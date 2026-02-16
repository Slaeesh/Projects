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
    return parser;
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
    if (parser != NULL) {
        free(parser);
    }
}

ASTNode* parser_run(TokenList* list) {
    //Initialiser le parser
    Parser* parser = parser_init(list);
    //Parser le programme
    ASTNode* noeud_racine = parser_parseProgram(parser);
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
    } else {
        parser_error(parser, "Facteur inattendu (Nombre, Variable ou Parenthèse)");
        return NULL;
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
        ASTNode* next_node = init_ast_node(AST_COMPOUND, next_stmt, NULL, tok_save);
        current-> right= next_node;
        current = next_node;
    }

    parser_eat(parser, TOK_END);

    return root;
}


ASTNode* parser_parseVarDeclarations(Parser* parser) {
    parser_eat(parser, TOK_VAR);

    ASTNode* root = NULL;    // La tête de la liste (le premier noeud)
    ASTNode* current = NULL; // Le curseur (le dernier noeud ajouté)

    // Cela permet de gérer plusieurs lignes :
    //    x : INTEGER;
    //    y : INTEGER;
    while (parser->currentToken.type == TOK_ID) {
        
        // On récupère le nom des variables
        Token ids[100]; // Tableau temporaire pour stocker les tokens (max 100 vars par ligne)
        int count = 0;

        // On prend le premier nom (il existe)
        ids[count++] = parser->currentToken;
        parser_eat(parser, TOK_ID);

        // On regarde s'il y en a d'autres séparés par des virgules
        while (parser->currentToken.type == TOK_COMMA) {
            parser_eat(parser, TOK_COMMA); 
            
            if (parser->currentToken.type == TOK_ID) {
                ids[count++] = parser->currentToken;
                parser_eat(parser, TOK_ID);
            } else {
                parser_error(parser, "Identifiant attendu après la virgule");
            }
        }

        // Gestion du Type
        parser_eat(parser, TOK_COLON);

        // On sauvegarde le token
        Token type_token = parser->currentToken; 
        
        // On vérifie que le type est valide et on le consomme
        parser_parseType(parser); 

        parser_eat(parser, TOK_SEMI); 

        // Création et Chaînage des Noeuds
        // Pour chaque variable trouvée sur cette ligne...
        for (int i = 0; i < count; i++) {
            // Création du noeud VAR_DECL
            // On utilise le token sauvegardé (ids[i]) qui contient le nom "x", ligne 5, etc.
            ASTNode* node = init_ast_node(AST_VAR_DECL, NULL, NULL, ids[i]);

            // Si c'est le tout premier noeud de la section VAR
            if (root == NULL) {
                root = node;
            } else {
                // Sinon, on l'accroche à la suite du précédent
                current->right = node;
            }
            
            // On déplace le curseur sur le nouveau noeud
            current = node;
        }
    }

    return root;
}


ASTNode* parser_parseStatement(Parser* parser) {
    TokenType type = parser->currentToken.type;

    switch (type)
    {
    case TOK_IF:
        return parser_parseIf(parser);

    case TOK_WHILE:
        return parser_parseWhile(parser);

    case TOK_ID:
        return parser_parseAssignment(parser);
    
    case TOK_WRITE:
        return parser_parseWrite(parser);

    case TOK_BEGIN:   // <--- AJOUT: Gestion des blocs imbriqués
        return parser_parseBlock(parser);

    }

    return init_ast_node(AST_NOOP, NULL, NULL, parser->currentToken); //robustesse
}





ASTNode* parser_parseIf(Parser* parser) {

    Token tok_if = parser -> currentToken;
    parser_eat(parser, TOK_IF);

    //On analyse la condition 
    ASTNode* condition = parser_parseExpression(parser);

    //Analyse du then
    parser_eat(parser, TOK_THEN);
    
    //Bloc IF
    // Attention, il faut utiliser parse_statement car si on utilise PARSE_BLOCK, on force l'utilisation de BEGIN et END. 
    // Pour la V1, on utilisera parse_block et on changera plus tard.
    ASTNode* then_branch = parser_parseBlock(parser);

    ASTNode* else_branch = NULL;
    // Cas s'il y a un ELSE
    if(parser->currentToken.type == TOK_ELSE) {
        parser_eat(parser, TOK_ELSE);
        else_branch = parser_parseBlock(parser);
    }

    ASTNode* branches = init_ast_node(AST_COMPOUND, then_branch, else_branch, tok_if); // gauche:then, droite: else ou NULL
    return init_ast_node(AST_IF, condition, branches, tok_if); // gauche: condition, droite: branches (then + else)
}

ASTNode* parser_parseAssignment(Parser* parser) {
    Token tok_var = parser->currentToken;

    parser_eat(parser, TOK_ID);
    parser_eat(parser, TOK_ASSIGN);

    ASTNode* expr = parser_parseExpression(parser); //Analyse de l'expression à droite du :=
    ASTNode* var_node = init_ast_leaf_var(tok_var); //Création du noeud variable (feuille)
    return init_ast_node(AST_ASSIGN, var_node, expr, tok_var); //Création 
}   

ASTNode* parser_parseWhile(Parser* parser) {
    Token tok_while = parser-> currentToken;
    parser_eat(parser, TOK_WHILE);
    
    ASTNode* condition = parser_parseExpression(parser);

    parser_eat(parser, TOK_DO);

    ASTNode* bloc = parser_parseBlock(parser);

    return init_ast_node(AST_WHILE, condition, bloc, tok_while);
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
    if (parser->currentToken.type == TOK_INTEGER) {
        parser_eat(parser, TOK_INTEGER);
    } else {
        parser_error(parser, "Pas le type attendu (Integer)");
    }
}
