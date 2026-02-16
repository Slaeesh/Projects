#ifndef SEMANTIC_H
#define SEMANTIC_H

#include "ast.h"

/**
 * @brief Lance l'analyse sémantique complète sur l'arbre AST.
 * Cette fonction va :
 * - Créer une table des symboles vide.
 * - Faire le Type Checking pour chaque nœud de l'AST.
 * - Nettoyer la table à la fin.
 *
 * @param root La racine de l'AST (AST_PROGRAM).
 * @return 0 si tout est OK, -1 s'il y a des erreurs bloquantes.
 */
int semantic_analysis(ASTNode* root);

#endif