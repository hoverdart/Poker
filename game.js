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

function randomize (arr) {
 
    
    for (let i = arr.length - 1; i > 0; i--){
     
        // Pick a random index from 0 to i inclusive
        let j = Math.floor(Math.random() * (i + 1)); 
        // Swap arr[i] with the element at the random index
        [arr[i], arr[j]] = [arr[j], arr[i]];
    } 
} 

//print the entire deck
randomize(fullDeck)
fullDeck.forEach((element) => console.log(element));