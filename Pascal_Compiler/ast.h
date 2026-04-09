#ifndef AST_H
#define AST_H

#include "lexer.h"


typedef enum {
    // General Structure
    AST_PROGRAM,      // La racine (contient les variables + le bloc principal)
    //AST_VAR_DECLS,    // Une liste de déclarations de variables
    AST_VAR_DECL,     // Une déclaration spécifique (ex: x : INTEGER)
    AST_COMPOUND,     // Un bloc de code (BEGIN ... END)

    // Instructions
    AST_ASSIGN,       // Affectation (x := 5)
    AST_IF,           // Condition (IF ... THEN ... ELSE)
    AST_Glue_IF,         // Pour stocker un IF en entier, il faut 3 choses: condition, then et else. On utilise un noeud GLUE pour les coller ensemble. S'occupe du bloc IF et du else
    AST_WHILE,        // Boucle (WHILE ... DO)
    AST_WRITE,        // Affichage (WRITE)
    AST_NOOP,         // Instruction vide (No Operation)

    // Expressions
    AST_BIN_OP,       // Opération binaire (+, -, *, /, >, <...)
    AST_INTEGER,      // Un nombre entier (feuille de l'arbre)
    AST_REAL,         // Un nombre réel (feuille de l'arbre) PAS ENCORE IMPLEMENTE MAIS A FAIRE
    AST_VARIABLE      // Une variable utilisée dans un calcul (feuille)
} ASTNodeType;


typedef struct ASTNode {
    ASTNodeType type;           // Le type du noeud (ex: AST_IF)

    // Child Node
    struct ASTNode* left;       // Enfant Gauche
    struct ASTNode* right;      // Enfant Droit

    /* Utilisation Guide :
       - AST_BIN_OP (+): left = 5, right = 10
       - AST_ASSIGN (:=): left = Variable(x), right = Expression(5+10)
       - AST_IF: left = Condition, right = Bloc THEN (on verra pour le ELSE plus tard)
       - AST_WHILE: left = Condition, right = Bloc DO
       - AST_COMPOUND: left = Instruction 1, right = Instruction Suivante (Liste chainée)
    */

    struct ASTNode* else_branch; //sera NULL si pas de else

    Token token;                // On garde le token original (pour le debug et erreurs ligne)
    
    // Specific values (pour éviter de tout parser à nouveau)
    int int_value;              // Si c'est un AST_INTEGER (ex: 42)
    char* string_value;         // Si c'est AST_VARIABLE (ex: "compteur") 
                                // ou AST_VAR_DECL (ex: "INTEGER")
    TokenType op;               // Si c'est AST_BIN_OP (ex: TOK_PLUS)

} ASTNode;



// Créer un noeud simple (ex: une opération ou une instruction)
ASTNode* init_ast_node(ASTNodeType type, ASTNode* left, ASTNode* right, Token token);

// Créer une feuille "Nombre"
ASTNode* init_ast_leaf_int(Token token);

// Créer une feuille "Variable"
ASTNode* init_ast_leaf_var(Token token);

// Libérer toute la mémoire de l'arbre (récursif)
void free_ast(ASTNode* node);

// Afficher l'AST 
void print_ast(ASTNode* node, int level);

#endif