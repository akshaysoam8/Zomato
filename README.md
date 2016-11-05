# Zomato
Scrapping script for all restaurants in zomato website

The website maintains a hierarchy of first the cities -> locations inside cities -> list of restaurants distributed on different pages through pagination.

The code also flows in a similiar manner. It first clears all the csv files present in the Data folder and then start the execution. First the cities -> locations inside the city -> all the restraunts going from one page to another.

This whole code executes in a parallel manner. Node's async library is used to maintain a proper execution flow of the program.

![Alt text](/Screenshots/zomato1.png?raw=true "Screenshot 1")

![Alt text](/Screenshots/zomato2.png?raw=true "Screenshot 2")
