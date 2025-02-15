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
    players = 0;
    deck = new Deck();
    allPlayers = [];
    pot = 0;
    small = 0;
    big = 0;
    startingMoney = 0;
    boardCards = [];
    start(){

        while (this.players<2 || this.players>10){
            console.log(this.players);
            this.players = prompt("How many players?(Min. 2, Max. 10)");
            this.small = prompt("Small Blind Amount");
            this.big = prompt("Big Blind Amount")
            this.startingMoney = prompt("Starting Money")
        }
        this.deck.shuffle();
       
        for(let i=0; i<this.players; i++){
            
            this.allPlayers.push(new Player());
            console.log("New player created, i="+i);
            if(i==0){
                this.allPlayers[i].playerBlind = "small";
            }
            else if (i==1){
                this.allPlayers[i].playerBlind = "big";
            }
            this.allPlayers[i].playerHand = [this.deck.fullDeck.shift(), this.deck.fullDeck.shift()];
            this.allPlayers[i].playerMoney = this.startingMoney;
        }
    }

    nextRound(){
        //burn card
        this.deck.fullDeck.splice(0, 1);
        
        for(let i=0; i<3; i++){
            this.boardCards[i] = this.deck.fullDeck.shift();
        }

        for(let i = 0; i<this.allPlayers.length; i++){
            if(this.allPlayers[i].playerBlind == "small"){
                if(this.allPlayers[i].playerMoney >= this.small){
                    this.allPlayers[i].playerMoney -= this.small;
                }
            }
            else if(this.allPlayers[i].playerBlind == "big"){
                if(this.allPlayers[i].playerMoney >= this.big){
                    this.allPlayers[i].playerMoney -= this.big;
                }
            }
        }
        
    }

    print(){
        console.log(this.allPlayers);
    }
}

class Player{
    constructor(){
        this.playerBlind = "";
        this.playerMoney = 0;
        this.playerHand = [];
    }
}

let game = new Game();
game.start();
game.print();
game.nextRound();
game.print();