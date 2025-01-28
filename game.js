class Card{
    constructor(suit, value){
        this.suit = suit;
        this.value = value;
    }
} 
let allCard = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "Jack", "Queen", "King", "Ace"];
let deck = {};
for(let i=1; i<=14; i++){
    deck[allCard[i-1]] = new Card("Clubs", i);
    deck[allCard[i-1]] = new Card("Spades", i);
    deck[allCard[i-1]] = new Card("Hearts", i);
    deck[allCard[i-1]] = new Card("Diamonds", i);
}
console.log(deck);