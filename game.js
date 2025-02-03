class Card{
    constructor(suit, value){
        this.suit = suit;
        this.value = value;
        this.name=this.value;
        if(this.value==13){
        this.name="King"
        }
        if(this.value==12){
            this.name="Queen"
        }
        if(this.value==11){
            this.name="Jack"
        }
        if(this.value==1){
            this.name="Ace"
        }
    }
} 
/*
let allCard = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "Jack", "Queen", "King", "Ace"];

let deck = {};
for(let i=1; i<=14; i++){
    deck[allCard[i-1]] = new Card("Clubs", i);
    deck[allCard[i-1]] = new Card("Spades", i);
    deck[allCard[i-1]] = new Card("Hearts", i);
    deck[allCard[i-1]] = new Card("Diamonds", i);
}
console.log(deck);
*/
//Abdullah's code ^

//Arjun's Code V
var fullDeck= new Array(52);
var tempSuite=""
var index=0;
for(var i=0; i<4; i++){
    for(var j=1; j<14;j++){
        if(i==0){
         fullDeck[index]= new Card("Spades",j)
        }
        if(i==1){
            fullDeck[index]= new Card("Hearts",j)
        }
        if(i==2){
            fullDeck[index]= new Card("Diamonds",j)
        }
        if(i==3){
            fullDeck[index]= new Card("Clubs",j)
        }
        index++
           
    }
}
fullDeck.forEach((element) => console.log(element));