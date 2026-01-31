#include "ast.h"

/**
 * @brief initialise a node with the right values for modularity in the code.
 *
 * @param type type of node.
 * @param token the actual token.
 * @return the node (and init of child)
 */
ASTNode* create_node_base(ASTNodeType type, Token token) {
    ASTNode* node = (ASTNode*) malloc(sizeof(ASTNode));
    
    if (node == NULL) {
        fprintf(stderr, "Erreur : Plus de mémoire pour créer l'AST.\n");
        exit(1);
    }

    node->type = type;
    node->token = token;
    
    // Initialisation par défaut de tous les pointeurs à NULL
    node->left = NULL;
    node->right = NULL;
    node->else_branch = NULL;
    
    // Initialisation des valeurs
    node->int_value = 0;
    node->string_value = NULL;
    node->op = NULL; 

    return node;
}


ASTNode* init_ast_node(ASTNodeType type, ASTNode* left, ASTNode* right, Token token) {    
    ASTNode* node = create_node_base(type, token);
    
    node->left = left;
    node->right = right;
    
    // Si c'est une opération binaire (+, -, *, /), on stocke l'opérateur précis
    if (type == AST_BIN_OP) {
        node->op = token.type;
    }

    return node;
}

ASTNode* init_ast_leaf_int(Token token) {
    ASTNode* node = create_node_base(AST_INTEGER, token);

    if (token.value != NULL) {
        node ->  string_value = atoi(token.value);
    } else {
        node -> string_value = 0; // Peut être changer à null car si un + avec rien derrière  -> erreur
    }

    return node;
}

ASTNode* init_ast_leaf_var(Token token) {
    ASTNode* node = create_node_base(AST_VARIABLE, token);

    if (token.value != NULL) {
        node -> string_value = strdup(token.value);
    } else {
        node -> string_value = ''; // Peut être changer à null 
    }
}

free_ast(ASTNode* node) {
    if (node == NULL) {
        return;
    }

    //  On nettoie d'abord les enfants 
    free_ast(node->left);
    free_ast(node->right);
    free_ast(node->else_branch); // N'oublie pas le ELSE s'il existe

    // On free les autres trucs
    if (node->string_value != NULL) {
        free(node->string_value);
    }

    free(node);
}