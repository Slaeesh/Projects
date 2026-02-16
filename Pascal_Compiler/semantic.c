#include "semantic.h"
#include"symbol_table.h"

int semantic_analysis(ASTNode* root) {
    SymbolTable* st = st_init(); // On init la table des symboles
    int result = semantic_visit(root, st); // On visite l'AST pour faire le type checking
    st_free(st); // On nettoie la table des symboles
    return result;
}

int semantic_visit(ASTNode* node, SymbolTable* sym_table) {
    if (node == NULL) return 0; //Pas de code = pas d'erreur

    ASTNodeType node_type = node->type;
    switch(node_type) {
        //General structure
        case AST_PROGRAM:
            semantic_visit(node->left, sym_table); // Déclarations de variables
            semantic_visit(node->right, sym_table); // bloc de code principal
            break;
        case AST_VAR_DECL:
            st_add(sym_table, node->token.value, node->token.type); // Ajouter la variable à la table des symboles. token.value est un char* par definition
            break;
        case AST_COMPOUND:
            semantic_visit(node->left, sym_table); // Déclarations de variables
            semantic_visit(node->right, sym_table); // bloc de code principal
            break;

        //Instructions
        case AST_ASSIGN:
            // On vérifie d'abord la droite de l'expression est valide (variable déclarée et même type de variable)

                //Vérifier que chaque variable est déclarée et initialisée (verifié dans le case AST_VARIABLE)
            semantic_visit(node->right, sym_table);

                // Vérifier que les types sont compatibles
            TokenType type_right = get_node_type(node->right, sym_table);
            if (type_right == TOK_ERROR) {
                printf("Erreur Sémantique: Type Incompatible dans l'affectation à la ligne %d\n", node->token.line);
                return -1;
            }

            // On peut passer à gauche (variable déclarée ?)
            char* var_name = node->left->string_value; // le nom de la variable à gauche du :=
            Symbol* sym = st_lookup(sym_table, var_name);

            if (sym == NULL) {
                printf("Erreur Sémantique: Variable '%s' non déclarée à la ligne %d\n", var_name, node->token.line);
                return -1;
            }

            if (sym->type != type_right) {
                printf("Erreur Sémantique: Type Incompatible pour la variable '%s' à la ligne %d\n", var_name, node->token.line);
                return -1;
            }

            sym->is_init = true; // Marquer la variable comme initialisée
            break;


        case AST_IF:
        case AST_Glue_IF:        
        case AST_WHILE:        
        case AST_WRITE:        
        case AST_NOOP:         

        // Expressions
        case AST_BIN_OP:     
        case AST_INTEGER:   
        case AST_VARIABLE:
        default:
            printf("Erreur Sémantique: Noeud de type %d non géré dans semantic_visit (ligne %d)\n", node_type, node->token.line);
            return -1;
    }
}






// Savoir le type d'un noeud pour un expression.
// exemple: x:= a+b, si a réel et b int, il faut x réel. 
// cette fonction donne le type de "a+b"
TokenType get_node_type(ASTNode* node, SymbolTable* st) {
    if (!node) return TOK_ERROR;

    switch(node->type) {
        // CAS BASE : un seul type -> on le retourne directement
        case AST_INTEGER: return TOK_INTEGER;
        case AST_REAL:    return TOK_REAL;

        // CAS BASE : Une variable
        case AST_VARIABLE: {
            Symbol* s = st_lookup(st, node->string_value);
            if (s) return s->type; 
            return TOK_ERROR; // Variable inconnue
        }

        // CAS RÉCURSIF : Une opération avec plusieurs variables de possible types différents
        case AST_BIN_OP: {
            // On récupère les types des enfants
            TokenType tLeft = get_node_type(node->left, st);
            TokenType tRight = get_node_type(node->right, st);

            // Vérification des erreurs
            if (tLeft == TOK_ERROR || tRight == TOK_ERROR) return TOK_ERROR;

            // Règle de compatibilité des types pour les opérations binaires :
            
            // Si les deux sont des entiers -> Résultat Entier
            if (tLeft == TOK_INTEGER && tRight == TOK_INTEGER) {
                return TOK_INTEGER; 
            }
            
            // Si l'un des deux est un Réel  -> Résultat Réel
            if ((tLeft == TOK_REAL && tRight == TOK_INTEGER) ||
                (tLeft == TOK_INTEGER && tRight == TOK_REAL) ||
                (tLeft == TOK_REAL && tRight == TOK_REAL)) {
                return TOK_REAL;
            }

            // Sinon incompatible (reel + char par exemple)
            return TOK_ERROR; 
        }

        default: return TOK_ERROR;
    }
}