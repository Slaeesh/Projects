#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "codegen.h"
#include "lexer.h"

static void gen_node(FILE* f, ASTNode* node);
static void gen_expression(FILE* f, ASTNode* node);

static const char* get_c_operator(TokenType op) {
    switch (op) {
        case TOK_PLUS:  return "+";
        case TOK_MINUS: return "-";
        case TOK_MULT:  return "*";
        case TOK_DIV:   return "/"; 
        case TOK_EQ:    return "=="; 
        case TOK_LT:    return "<";
        case TOK_GT:    return ">";
        default:        return "?";
    }
}

static void gen_expression(FILE* f, ASTNode* node) {
    if (!node) return;

    switch (node->type) {
        case AST_INTEGER:
            fprintf(f, "%d", node->int_value);
            break;

        case AST_VARIABLE:
            // Correction : On utilise token.value si string_value est NULL
            fprintf(f, "%s", node->string_value ? node->string_value : node->token.value);
            break;

        case AST_BIN_OP:
            fprintf(f, "(");
            gen_expression(f, node->left);
            fprintf(f, " %s ", get_c_operator(node->op));
            gen_expression(f, node->right);
            fprintf(f, ")");
            break;

        default:
            fprintf(stderr, "Erreur: Type de noeud %d inattendu dans une expression\n", node->type);
            break;
    }
}

static void gen_node(FILE* f, ASTNode* node) {
    if (!node) return;

    switch (node->type) {
        case AST_PROGRAM:
            fprintf(f, "#include <stdio.h>\n");
            fprintf(f, "#include <stdlib.h>\n\n");
            fprintf(f, "int main() {\n");
            
            if (node->left) {
                fprintf(f, "    // Variables\n");
                gen_node(f, node->left);
                fprintf(f, "\n");
            }

            fprintf(f, "    // Programme Principal\n");
            gen_node(f, node->right);

            fprintf(f, "\n    return 0;\n");
            fprintf(f, "}\n");
            break;

        case AST_VAR_DECL:
            // Correction : Utilisation de node->token.value pour éviter le (null)
            fprintf(f, "    int %s;\n", node->token.value);
            
            if (node->right && node->right->type == AST_VAR_DECL) {
                gen_node(f, node->right);
            }
            break;

        case AST_COMPOUND:
            gen_node(f, node->left);
            if (node->right) {
                gen_node(f, node->right);
            }
            break;

        case AST_ASSIGN:
            fprintf(f, "    ");
            gen_expression(f, node->left);
            fprintf(f, " = ");
            gen_expression(f, node->right);
            fprintf(f, ";\n");
            break;

        case AST_WRITE:
            fprintf(f, "    printf(\"%%d\\n\", ");
            gen_expression(f, node->left);
            fprintf(f, ");\n");
            // Gestion de la liste de WRITE si chaînée
            if (node->right && node->right->type == AST_WRITE) {
                gen_node(f, node->right);
            }
            break;

        case AST_IF: {
            // Correction majeure : AST_IF gère la structure, Glue_IF gère le contenu
            fprintf(f, "    if (");
            gen_expression(f, node->left); // La condition
            fprintf(f, ") {\n");
            
            ASTNode* glue = node->right;
            if (glue && glue->type == AST_Glue_IF) {
                gen_node(f, glue->left); // Bloc THEN
                fprintf(f, "    }\n");
                if (glue->right) { // Bloc ELSE existe
                    fprintf(f, "    else {\n");
                    gen_node(f, glue->right);
                    fprintf(f, "    }\n");
                }
            } else {
                gen_node(f, node->right);
                fprintf(f, "    }\n");
            }
            break;
        }

        case AST_WHILE:
            fprintf(f, "    while (");
            gen_expression(f, node->left);
            fprintf(f, ") {\n");
            gen_node(f, node->right);      
            fprintf(f, "    }\n");
            break;

        case AST_NOOP:
        case AST_Glue_IF: // Le Glue est géré par le case AST_IF au-dessus
            break;

        default:
            break;
    }
}

int codegen_generate(ASTNode* root, const char* output_filename) {
    if (!root) return -1;
    FILE* f = fopen(output_filename, "w");
    if (!f) {
        perror("Erreur lors de la création du fichier de sortie");
        return -1;
    }
    gen_node(f, root);
    fclose(f);
    printf(">> Code C généré avec succès dans : %s\n", output_filename);
    return 0;
}