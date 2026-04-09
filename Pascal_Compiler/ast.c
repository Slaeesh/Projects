#include <stdio.h>
#include <stdlib.h>
#include <string.h> // Nécessaire pour strdup

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
    node->op = TOK_NULL; 

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
        node ->  int_value = atoi(token.value);
    } else {
        node -> int_value = 0; // Peut être changer à null car si un + avec rien derrière  -> erreur
    }

    return node;
}

ASTNode* init_ast_leaf_var(Token token) {
    ASTNode* node = create_node_base(AST_VARIABLE, token);

    if (token.value != NULL) {
        node -> string_value = strdup(token.value);
    } else {
        node -> string_value = NULL; 
    }
    return node;
}

void free_ast(ASTNode* node) {
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

void print_ast(ASTNode* node, int level) {
    // Gestion de l'indentation
    for (int i = 0; i < level; i++) printf(i == level - 1 ? "|-- " : "|   ");

    // Gestion du NULL
    if (node == NULL) {
        printf("(NULL)\n");
        return;
    }

    // Affichage des informations du noeud
    switch (node->type) {
        case AST_PROGRAM:   printf("PROGRAM\n"); break;
        //case AST_VAR_DECLS: printf("VAR_DECLS\n"); break; // On a plus besoin de ce noeud, on gère les déclarations de variables directement avec AST_VAR_DECL
        case AST_COMPOUND:  printf("BLOCK (BEGIN..END)\n"); break;
        case AST_ASSIGN:    printf("ASSIGN (:=)\n"); break;
        case AST_WHILE:     printf("WHILE\n"); break;
        case AST_WRITE:     printf("WRITE\n"); break;
        case AST_NOOP:      printf("NOOP\n"); break;

        case AST_VAR_DECL:
            printf("DECL: %s (Type: %s)\n", 
                   node->token.value, 
                   node->string_value ? node->string_value : "Integer");
            break;

        case AST_INTEGER:
            printf("INTEGER: %d\n", node->int_value);
            // C'est une feuille, on arrête la récursion ici
            return; 

        case AST_VARIABLE:
            printf("VARIABLE: %s\n", node->string_value);
            // C'est une feuille, on arrête la récursion ici
            return;

        case AST_BIN_OP:
            printf("OP: ");
            // Conversion "inline" des opérateurs pour éviter une fonction externe
            switch(node->op) {
                case TOK_PLUS: printf("+"); break;
                case TOK_MINUS: printf("-"); break;
                case TOK_MULT: printf("*"); break;
                case TOK_DIV: printf("/"); break;
                case TOK_EQ: printf("="); break;
                case TOK_LT: printf("<"); break;
                case TOK_GT: printf(">"); break;
                default: printf("?"); break;
            }
            printf("\n");
            break;

        case AST_IF:
            printf("IF\n");
            // Traitement spécifique pour IF afin d'inclure le ELSE
            print_ast(node->left, level + 1);       // Condition
            print_ast(node->right, level + 1);      // Then
            if (node->else_branch) {                // Else (optionnel)
                for (int i = 0; i < level+1; i++) printf(i == level ? "|-- " : "|   ");
                printf("[ELSE]\n");
                print_ast(node->else_branch, level + 2);
            }
            return; // On a géré la récursion manuellement pour le IF

        default:
            printf("UNKNOWN [%d]\n", node->type);
            break;
    }

    // Récursion standard (Gauche / Droite)
    // On affiche NULL si l'enfant n'existe pas
    print_ast(node->left, level + 1);
    print_ast(node->right, level + 1);
}
