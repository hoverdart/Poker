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
class Deck{
    fullDeck= new Array(52);
    constructor(){
       
        var tempSuite=""
        var index=0;
        for(var i=0; i<4; i++){
            for(var j=1; j<14;j++){
                if(i==0){
                 this.fullDeck[index]= new Card("Spades",j)
                }
                if(i==1){
                    this.fullDeck[index]= new Card("Hearts",j)
                }
                if(i==2){
                    this.fullDeck[index]= new Card("Diamonds",j)
                }
                if(i==3){
                    this.fullDeck[index]= new Card("Clubs",j)
                }
                index++
                   
            }
        }
    } //constructor ends 

    shuffle(){
        for (let i = this.fullDeck.length - 1; i > 0; i--){
     
            // Pick a random index from 0 to i inclusive
            let j = Math.floor(Math.random() * (i + 1)); 
            // Swap fullDeck[i] with the element at the random index
            [this.fullDeck[i], this.fullDeck[j]] = [this.fullDeck[j], this.fullDeck[i]];
        } 
    }

    print(){
        //print the full deck
        this.fullDeck.forEach((element) => console.log(element));
    }
}

class Game{
    playerHands = {};
    players = 0;
    deck = new Deck();
    start(){
        this.players = prompt("How many players?");
        this.deck.shuffle();
        for(let i=0; i<this.players; i++){
            for(let x=0; x<2; x++){
                //gives each player 2 cards could change to give each one twice?
                this.playerHands[i] = [this.deck.fullDeck.shift(), this.deck.fullDeck.shift()];
            }
        }
    }

    print(){
        console.log(this.playerHands);
    }
}

let game = new Game();
game.start();
game.print();


// var deck= new Deck();
// console.log("Unshuffled deck: ")
// deck.print();
// deck.shuffle();
// console.log("Shuffled deck")
// deck.print();
