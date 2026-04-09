CC = gcc
CFLAGS = -Wall -Wextra -g

# Liste de tous tes fichiers .c
# Assure-toi que tu as bien créé les .c correspondant aux .h !
SRC = main.c lexer.c parser.c ast.c symbol_table.c semantic.c codegen.c

# Transformation des .c en .o
OBJ = $(SRC:.c=.o)

# Nom de ton exécutable final (ton compilateur)
EXEC = pcompile

all: $(EXEC)

$(EXEC): $(OBJ)
	$(CC) $(OBJ) -o $(EXEC)

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJ) $(EXEC) *.o

# Nettoyage complet (y compris les fichiers générés par les tests)
clean_tests: clean
	rm -f *.s *.c *.exe test_program