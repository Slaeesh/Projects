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
            parser -> currentToken = parser -> token -> data[parser -> pos];
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
    noeud_racine = ParserProgramme(parser);
    //Vérifie EOF
    if (list->currentToken->type != TOK_EOF) {
        parser_error(parser, "Pas de TOken EOF");
    }
    //Free le parser
    parser_free(parser);

    return noeud_racine;
    
}

ASTNode* parser_parseWrite(Parser* parser) {
    Token tok_save = parser -> currentToken
    parser_eat(parser, TOK_WRITE); // eat le write
    parser_eat(parser, TOK_LPAREN); //eat (

    ASTNode* expr = parser_parseExpression(parser); //parse de la première expression

    ASTNode* node = init_ast_node(AST_WRITE, expr, NULL, tok_save)
    ASTNode* current = node;

    while(parser->currentToken.type == TOK_COMMA) {
        parser_eat(parser, TOK_COMMA);

        ASTNode* next_expr = parser_parseExpression(parser);
        ASTNode* next_node = init_ast_node(AST_WRITE, next_expr, NULL, tok_save);
        current->right = next_node
        current = next_node
    }

    parser_eat(parser, TOK_RPAREN);
    return node;
}

void parser_parseType(Parser* parser) {
    if (parser->currentToken->type = TOK_INTEGER) {
        parser_eat(parser, TOK_INTEGER)
    } else {
        parser_error(parser, "Pas le type attendu (Integer)")
    }
}



/*
ALGORITHME : PARSEUR_PASCAL_COMPLET

VARIABLES GLOBALES :
    JetonActuel  : Le jeton en cours de lecture (Type, Valeur)
    ListeJetons  : La liste complète des jetons fournie par le Lexer

// Fonction utilitaire

// FONCTION Consommer(type_attendu)
    SI JetonActuel.Type == type_attendu ALORS
        JetonActuel = JetonSuivant(ListeJetons)
    SINON
        ERREUR "Erreur de syntaxe : Attendu " + type_attendu + " mais trouvé " + JetonActuel.Type
    FIN SI
FIN FONCTION

// Entrée du programme

FONCTION ParserProgramme() RETOURNE NœudAST
    // Règle : PROGRAM id ; Bloc .
    Consommer("PROGRAM")
    nom_programme = JetonActuel.Valeur
    Consommer("ID")
    Consommer(";")
    
    corps_programme = ParserInstruction() // Traite le gros BLOC principal
    
    Consommer(".") // Le point final
    
    RETOURNER NouveauNœud(Type="PROGRAM", Nom=nom_programme, Corps=corps_programme)
FIN FONCTION


// Gestion des instructions

FONCTION ParserInstruction() RETOURNE NœudAST
    
    // CAS 1 : C'est un BLOC (BEGIN ... END)
    SI JetonActuel.Type == "BEGIN" ALORS
        Consommer("BEGIN")
        liste_enfants = []
        
        // On boucle tant qu'on n'a pas fermé le bloc
        TANT QUE JetonActuel.Type != "END" FAIRE
            instruction = ParserInstruction()
            Ajouter instruction à liste_enfants
            
            // Gestion du séparateur (le point-virgule est optionnel avant le END en Pascal strict, 
            // mais souvent présent entre les instructions)
            SI JetonActuel.Type == ";" ALORS
                Consommer(";")
            FIN SI
        FIN TANT QUE
        
        Consommer("END")
        RETOURNER NouveauNœud(Type="BLOCK", Enfants=liste_enfants)

    // CAS 2 : C'est une CONDITION (IF ... THEN ... ELSE)
    SINON SI JetonActuel.Type == "IF" ALORS
        Consommer("IF")
        condition = ParserExpression() // On part analyser la logique math/bool
        Consommer("THEN")
        si_vrai = ParserInstruction()
        
        si_faux = NULL
        SI JetonActuel.Type == "ELSE" ALORS
            Consommer("ELSE")
            si_faux = ParserInstruction()
        FIN SI
        
        RETOURNER NouveauNœud(Type="IF", Cond=condition, Vrai=si_vrai, Faux=si_faux)

    // CAS 3 : C'est une BOUCLE (WHILE ... DO)
    SINON SI JetonActuel.Type == "WHILE" ALORS
        Consommer("WHILE")
        condition = ParserExpression()
        Consommer("DO")
        corps = ParserInstruction()
        
        RETOURNER NouveauNœud(Type="WHILE", Cond=condition, Corps=corps)

    // CAS 4 : C'est une ASSIGNATION (Variable := ...)
    SINON SI JetonActuel.Type == "ID" ALORS
        nom_variable = JetonActuel.Valeur
        Consommer("ID")
        Consommer(":=")
        valeur = ParserExpression()
        
        RETOURNER NouveauNœud(Type="ASSIGN", Var=nom_variable, Expr=valeur)

    // CAS PAR DÉFAUT (Instruction vide ou inconnue)
    SINON
        RETOURNER NœudVide()
    FIN SI
FIN FONCTION

// Gestion des expressions

// Niveau 1 : Additions, Soustractions, Comparaisons (Priorité Faible)
FONCTION ParserExpression() RETOURNE NœudAST
    gauche = ParserTerme() // On descend d'un niveau

    TANT QUE JetonActuel.Type EST DANS ["+", "-", ">", "<", "="] FAIRE
        operateur = JetonActuel.Type
        Consommer(operateur)
        droite = ParserTerme()
        // L'opérateur devient parent
        gauche = NouveauNœud(Type="BIN_OP", Op=operateur, Gauche=gauche, Droite=droite)
    FIN TANT QUE
    
    RETOURNER gauche
FIN FONCTION

// Niveau 2 : Multiplications, Divisions (Priorité Moyenne)
FONCTION ParserTerme() RETOURNE NœudAST
    gauche = ParserFacteur() // On descend d'un niveau

    TANT QUE JetonActuel.Type EST DANS ["*", "/"] FAIRE
        operateur = JetonActuel.Type
        Consommer(operateur)
        droite = ParserFacteur()
        gauche = NouveauNœud(Type="BIN_OP", Op=operateur, Gauche=gauche, Droite=droite)
    FIN TANT QUE
    
    RETOURNER gauche
FIN FONCTION

// Niveau 3 : Atomes, Parenthèses (Priorité Haute)
FONCTION ParserFacteur() RETOURNE NœudAST
    SI JetonActuel.Type == "NOMBRE" ALORS
        valeur = JetonActuel.Valeur
        Consommer("NOMBRE")
        RETOURNER NouveauNœud(Type="LITTERAL", Valeur=valeur)
        
    SINON SI JetonActuel.Type == "ID" ALORS
        nom = JetonActuel.Valeur
        Consommer("ID")
        RETOURNER NouveauNœud(Type="VAR", Valeur=nom)
        
    SINON SI JetonActuel.Type == "(" ALORS
        Consommer("(")
        nœud = ParserExpression() // Récursion : on remonte tout en haut pour l'intérieur
        Consommer(")")
        RETOURNER nœud
        
    SINON SI JetonActuel.Type == "+" OU "-" ALORS
        // Gestion des signes unaires (ex: -5)
        op = JetonActuel.Type
        Consommer(op)
        facteur = ParserFacteur()
        RETOURNER NouveauNœud(Type="UNARY_OP", Op=op, Expr=facteur)
        
    SINON
        ERREUR "Attendu : Nombre, Variable ou Parenthèse"
    FIN SI
FIN FONCTION

*/