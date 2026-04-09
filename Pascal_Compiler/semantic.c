#include "semantic.h"
#include"symbol_table.h"
#include "lexer.h"

#include <stdio.h>
#include <stdlib.h>

//Prototypes des fonctions internes
int semantic_visit(ASTNode* node, SymbolTable* sym_table);
TokenType get_node_type(ASTNode* node, SymbolTable* st);
int check_comparison(TokenType t1, TokenType t2);

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
            if (semantic_visit(node->left, sym_table) == -1) { // section var
                printf("Erreur Sémantique dans la section VAR du programme à la ligne %d\n", node->token.line);
                return -1;
            }
            if (semantic_visit(node->right, sym_table) == -1) { // bloc de code principal
                printf("Erreur Sémantique dans le bloc principal du programme à la ligne %d\n", node->token.line);
                return -1;
            }
            break;
            
        case AST_VAR_DECL:
            if (st_add(sym_table, node->token.value, node->op) == -1) { // Ajouter la variable à la table des symboles. token.value est un char* par definition
                printf("Erreur Sémantique: Variable '%s' déclarée deux fois ou plus dans le même block à la ligne %d\n", node->token.value, node->token.line);
                return -1;
            }
            if (node->right != NULL) {
                return semantic_visit(node->right, sym_table);
            }
            break;

        case AST_COMPOUND:
            if (semantic_visit(node->left, sym_table) == -1) { // Déclarations de variables
                printf("Erreur Sémantique dans les déclarations de variables du bloc à la ligne %d\n", node->token.line);
                return -1;
            }
            if (semantic_visit(node->right, sym_table) == -1) { // bloc de code principal
                printf("Erreur Sémantique dans le bloc principal du programme à la ligne %d\n", node->token.line);
                return -1;
            }
            break;

        //Instructions
        case AST_ASSIGN: {
            // On vérifie d'abord la droite de l'expression est valide (variable déclarée et même type de variable)

                //Vérifier que chaque variable est déclarée et initialisée (verifié dans le case AST_VARIABLE)
            if (semantic_visit(node->right, sym_table) == -1) {
                printf("Erreur Sémantique: Expression invalide dans l'affectation à la ligne %d\n", node->token.line);
                return -1;
            }

                // Vérifier que les types sont compatibles
            TokenType type_right = get_node_type(node->right, sym_table);  
            if (type_right == TOK_ERROR) {
                printf("Erreur Sémantique: Type Incompatible dans l'affectation à la ligne %d\n", node->token.line);
                exit(1);
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
        }


        case AST_IF: {
            // Vérifier la condition
            ASTNode* condition = node->left;
            semantic_visit(condition, sym_table); // Vérifier que la condition est valide (variables déclarées et initialisées)
                // 2 cas: condition est une comparaison ou booléen
                
                if (condition->type == AST_BIN_OP) {    //Cas d'une comparaison
                    //On vérifie d'abord que c'est bien une comparaison
                    TokenType op = condition->token.type;
                    bool is_comparison = (op == TOK_LT || op == TOK_GT || op == TOK_EQ); //il reste à implémenter <=, >=, !=

                    if (!is_comparison) {
                        printf("Erreur Sémantique: Opérateur non valide dans la condition IF à la ligne %d\n", node->token.line);
                        exit(1);
                    }

                    TokenType type_right = get_node_type(condition->right, sym_table);
                    TokenType type_left = get_node_type(condition->left, sym_table);

                    if (check_comparison(type_left, type_right) == -1) {
                        printf("Erreur Sémantique: Types incompatibles dans la condition IF à la ligne %d\n", node->token.line);
                        exit(1);
                    }
                }

                else if (get_node_type(condition, sym_table) == TOK_BOOL) { // Cas d'un booléen
                    break; // Pas de vérification supplémentaire à faire pour les booléens
                }

                else { //Normalement on arrive jamais là mais si la condition n'est ni une comparaison ni un booléen, c'est une erreur
                    printf("Erreur Sémantique: Condition IF doit être une comparaison ou un booléen à la ligne %d\n", node->token.line);
                    exit(1);

                }
               

            // vérifier le bloc.
            // En fait on arrivera sur AST_GLUE_IGF qui colle le THEN et le ELSE ensemble, donc on vérifie les deux en même temps.
            if (semantic_visit(node->right, sym_table) == -1) return -1; 
            break;
        }

        case AST_Glue_IF:   // gère le code du if à gauche et le else à droite   
            //Cas du THEN
            if (semantic_visit(node->left, sym_table) == -1) {
                printf("Erreur Sémantique dans le THEN du IF à la ligne %d\n", node->token.line);
                exit(1);
            }  

            //Cas du ELSE (s'il existe)
            if (node-> right == NULL) break; // Pas de ELSE, pas besoin de vérifier
            if (semantic_visit(node->right, sym_table) == -1) {
                printf("Erreur Sémantique dans le ELSE du IF à la ligne %d\n", node->token.line);
                exit(1);
            }
            break;

        case AST_WHILE: {  //Même Logique que le IF sans le ELSE
            //Analyse de la condition 
            ASTNode* condition = node->left;
            semantic_visit(condition, sym_table); // Vérifier que la condition est valide (variables déclarées et initialisées)
                // 2 cas: condition est une comparaison ou booléen
                
                if (condition->type == AST_BIN_OP) {    //Cas d'une comparaison
                    //On vérifie d'abord que c'est bien une comparaison
                    TokenType op = condition->token.type;
                    bool is_comparison = (op == TOK_LT || op == TOK_GT || op == TOK_EQ); //il reste à implémenter <=, >=, !=

                    if (!is_comparison) {
                        printf("Erreur Sémantique: Opérateur non valide dans la condition IF à la ligne %d\n", node->token.line);
                        exit(1);
                    }

                    TokenType type_right = get_node_type(condition->right, sym_table);
                    TokenType type_left = get_node_type(condition->left, sym_table);

                    if (check_comparison(type_left, type_right) == -1) {
                        printf("Erreur Sémantique: Types incompatibles dans la condition IF à la ligne %d\n", node->token.line);
                        exit(1);
                    }
                }
                else if (get_node_type(condition, sym_table) == TOK_BOOL) { // Cas d'un booléen
                    break; // Pas de vérification supplémentaire à faire pour les booléens
                }
                else { //Normalement on arrive jamais là mais si la condition n'est ni une comparaison ni un booléen, c'est une erreur
                    printf("Erreur Sémantique: Condition IF doit être une comparaison ou un booléen à la ligne %d\n", node->token.line);
                    exit(1);
                }

            //Analyse du bloc de code   
            if (semantic_visit(node->right, sym_table) == -1) {
                printf("Erreur Sémantique dans le bloc DO du WHILE à la ligne %d\n", node->token.line);
                exit(1);
            }
            break;
        }

        case AST_WRITE: // Gauche: expression acutelle, droite:expressions suivantes    
            if (semantic_visit(node->left, sym_table) == -1) return -1; // Vérifier que la première expression est valide
            ASTNode* current = node->right;
            while (current != NULL) { // Vérifier que les expressions suivantes sont valides
                if (semantic_visit(current->left, sym_table) == -1) return -1;
                current = current->right;
            }
            break;

        case AST_NOOP:       
            break; // Pas de vérification à faire pour une instruction vide

        // Expressions
        case AST_BIN_OP:  //presque la même logique que pour vérifier une condition dans un IF
            // On vérifie que les deux côtés de l'opération sont valides (variables déclarées et initialisées)
            if (semantic_visit(node->left, sym_table) == -1) {
                printf("Erreur Sémantique: Expression invalide dans l'opération binaire (gauche) à la ligne %d\n", node->token.line);
                exit(1);
            }

            if (semantic_visit(node->right, sym_table) == -1) {
                printf("Erreur Sémantique: Expression invalide dans l'opération binaire (droite) à la ligne %d\n", node->token.line);
                exit(1);
            }

            //On vérifie que les types sont compatibles pour les opérations binaires
            TokenType type_right = get_node_type(node->right, sym_table);
            TokenType type_left = get_node_type(node->left, sym_table);

            if (type_right == TOK_ERROR || type_left == TOK_ERROR) {
                printf("Erreur Sémantique: variable non déclarée dans l'opération binaire à la ligne %d\n", node->token.line);
                exit(1);
            }

            if (check_comparison(type_left, type_right) == -1) {
                printf("Erreur Sémantique: Types incompatibles dans l'opération binaire à la ligne %d\n", node->token.line);
                exit(1);
            }

            break;
            


        case AST_VARIABLE: { //Vérifier que la variable est déclarée et initialisée avant utilisation
            Symbol* sym; 
            if ((sym = st_lookup(sym_table, node->string_value)) == NULL) {
                printf("Erreur Sémantique: Variable '%s' non déclarée à la ligne %d\n", node->string_value, node->token.line);
                return -1;
            }
            if (!sym->is_init) {
                printf("Erreur Sémantique: Variable '%s' utilisée sans être initialisée à la ligne %d\n", node->string_value, node->token.line);
                return -1;
            }
            break;
        }


        case AST_INTEGER: 
            break; // Pas de vérification à faire pour une feuille
        
        case AST_REAL:
            break; // Pas de vérification à faire pour une feuille

        default:
            printf("Erreur Sémantique: Noeud de type %d non géré dans semantic_visit (ligne %d)\n", node_type, node->token.line);
            return -1;
    }
    return 0;
}






// Savoir le type d'un noeud pour un expression.
// exemple: x:= a+b, si a réel et b int, il faut x réel. 
// cette fonction donne le type de "a+b"
// s'occupe aussi de vérifier que les variables utilisées sont déclarées 
TokenType get_node_type(ASTNode* node, SymbolTable* st) {
    if (!node) return TOK_ERROR;

    switch(node->type) {
        // CAS BASE : un seul type -> on le retourne directement
        case AST_INTEGER: return TOK_INTEGER;
        case AST_REAL:    return TOK_REAL;

        // CAS BASE : Une variable
        case AST_VARIABLE: {        //normalement on devrait jamais tomber sur une variable non déclarée car ça serait déjà une erreur dans semantic_visit, mais on vérifie quand même pour être sûr.
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


// A COMPLETER AVEC D AUTRES TYPES (genre BOOL, CHAR, etc) et d'autres opérateurs (<=, >=, !=)
// Renvoie 0 si les types sont compatibles pour une comparaison (<, >, =), -1 sinon
int check_comparison(TokenType t1, TokenType t2) {
    // Cas 1 : Types identiques (Int vs Int, Real vs Real, Char vs Char)
    if (t1 == t2) return 0;

    // Cas 2 : Mixte Numérique (Int vs Real ou Real vs Int) -> Accepté
    if ((t1 == TOK_INTEGER && t2 == TOK_REAL) || 
        (t1 == TOK_REAL && t2 == TOK_INTEGER)) {
        return 0;
    }

    // Tout le reste est interdit (ex: Char vs Int, Bool vs Real)
    return -1;
}