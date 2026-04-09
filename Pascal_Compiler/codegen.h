#ifndef CODEGEN_H
#define CODEGEN_H

#include "ast.h"

/**
 * @brief Génère le code C correspondant à l'arbre AST.
 *
 * @param root La racine de l'AST (AST_PROGRAM).
 * @param output_filename Le nom du fichier de sortie (ex: "output.c").
 * @return 0 si succès, -1 si erreur (ex: impossible d'écrire le fichier).
 */
int codegen_generate(ASTNode* root, const char* output_filename);

#endif