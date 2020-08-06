//object that contains the entire blackjack game
var blackjackGame = {
  //variables that will be used to link to document objects
  dealerCashText: null,
  gamesContainer: null,
  playButton: null,
  playerCashText: null,
  bettedAmmountInput: null,
  dealerCardsContainer: null,
  dealerScore: null,
  dealerScoreText: null,
  gameExplanationText: null,
  restartGameButton: null,
  //variables to control dealer actions
  dealerCash: null,
  dealerInitialCash: null,
  playerCash: null,
  bettedInitialAmmount: null,
  //variables to control the flow of the game
  deckCards: [],
  dealerCards: [],
  playerCards: [],
  numberActiveGames: 0,

  //function called at the start of the game used to initialize the game
  init: function ( dealer_initial_cash) {
    //links all necessary variables to HTML document elements
    blackjackGame.gamesContainer = document.getElementById("gamesContainer");
    blackjackGame.playButton = document.getElementById("playButton");
    blackjackGame.dealerCashText = document.getElementById("dealerCashText");
    blackjackGame.playerCashText = document.getElementById("playerCashText");
    blackjackGame.bettedAmmountInput = document.getElementById(
      "bettedAmmountInput"
    );
    blackjackGame.dealerCardsContainer = document.getElementById(
      "dealerCardsContainer"
    );
    blackjackGame.dealerScoreText = document.getElementById("dealerScoreText");
    blackjackGame.gameExplanationText = document.getElementById(
      "gameExplanationText"
    );
    blackjackGame.restartGameButton = document.getElementById(
      "restartGameButton"
    );

    //sets functionality of play button, which is to start a new round of blackjack
    blackjackGame.playButton.addEventListener("click", blackjackGame.startGame);

    blackjackGame.restartGameButton.addEventListener("click", function () {
      blackjackGame.init(300);
    });

    //initializes dealer and player cash variables as well as the betting ammount for the game.
    blackjackGame.dealerCash = dealer_initial_cash;
    blackjackGame.dealerInitialCash = dealer_initial_cash;
    blackjackGame.playerCash = 300;
    blackjackGame.bettedAmmountInput.defaultValue = 10;
    blackjackGame.gameExplanationText.innerHTML = "";

    //shows and hides game objects for the start of a game
    blackjackGame.gamesContainer.classList.add("ninja");
    blackjackGame.playButton.classList.remove("ninja");
    blackjackGame.dealerCardsContainer.classList.add("ninja");
    blackjackGame.restartGameButton.classList.add("ninja");
    //updates UI of the dealer and player dealer cash texts;
    blackjackGame.setPlayerDealerCashTexts();
  },

  startGame: function () {
    //functions used to set up a new game
    blackjackGame.dealerCards = [];
    blackjackGame.deckCards = [];
    blackjackGame.playerCards = [];
    blackjackGame.numberActiveGames = 0;
    blackjackGame.gameExplanationText.innerHTML = "";

    blackjackGame.getFreshDeck();
    blackjackGame.getInitialBet();
    blackjackGame.setupDealerHand();
    blackjackGame.addGame();
    blackjackGame.setupPlayerHands();
    //hides and shows elements of the game as needed
    blackjackGame.playButton.classList.add("ninja");
    blackjackGame.bettedAmmountInput.classList.add("ninja");
    blackjackGame.gamesContainer.classList.remove("ninja");
    blackjackGame.dealerCardsContainer.classList.remove("ninja");
  },

  getFreshDeck: function () {
    //Get 2 decks of cards in order 104 cards
    for (let k = 0; k < 2; k++) {
      for (let i = 0; i < 4; i++) {
        for (let j = 1; j < 14; j++) {
          //here we push an element to the deck made up of {s:i,n:j}

          let value = null;
          let symbol = null;

          switch (j) {
            case 1:
              value = "A";
              break;
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
              value = `${j}`;
              break;
            case 11:
              value = "J";
              break;
            case 12:
              value = "Q";
              break;
            case 13:
              value = "K";
              break;
          }

          switch (i) {
            case 0:
              symbol = "H";
              break;
            case 1:
              symbol = "D";
              break;

            case 2:
              symbol = "C";
              break;
            case 3:
              symbol = "S";
              break;
          }
          blackjackGame.deckCards.push({
            // Number
            // 1 = Ace
            // 2 to 10 = As-it-is
            // 11 = Jack
            // 12 = Queen
            // 13 = King
            n: value,
            // Shape
            // 0 = Heart
            // 1 = Diamond
            // 2 = Club
            // 3 = Spade
            s: symbol,
          });
        }
      }
    }

    //shuffle deck according to Fisher-Yates Algorithm
    for (let i = blackjackGame.deckCards.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * i);
      let temp = blackjackGame.deckCards[i];
      blackjackGame.deckCards[i] = blackjackGame.deckCards[j];
      blackjackGame.deckCards[j] = temp;
    }
  },
  getInitialBet: function () {
    //limits the initial bet to be between 5 and the cash that the dealer currently has, bet ammounts are multiple of 5
    blackjackGame.bettedAmmountInput.value =
      Math.floor(blackjackGame.bettedAmmountInput.value / 5) * 5;

    if (blackjackGame.bettedAmmountInput.value > blackjackGame.playerCash)
      blackjackGame.bettedAmmountInput.value = blackjackGame.playerCash;
    if (
      blackjackGame.bettedAmmountInput.value < 5 &&
      blackjackGame.playerCash > 0
    )
      blackjackGame.bettedAmmountInput.value = 5;
  },

  setupDealerHand: function () {
    blackjackGame.draw(1);
    blackjackGame.draw(1);
    //load UI settings
    blackjackGame.setDealerCardsUI();
    blackjackGame.calculateHandScore(1);
  },

  //sets up player hand, by creating each element individually.
  setupPlayerHands: function () {
    //removes all previous children of the gamesContainer
    blackjackGame.gamesContainer
      .querySelectorAll("*")
      .forEach((n) => n.remove());
    //loops through all of player hands and creates the elements.
    for (let i = 0; i < blackjackGame.playerCards.length; i++) {
      //if a certain game has already ended don't show it
      if (blackjackGame.playerCards[i].hasGameEnded) continue;

      var game = document.createElement("div");
      game.id = "game" + blackjackGame.playerCards[i].gameID;
      game.classList.add("game");
      blackjackGame.gamesContainer.appendChild(game);

      var cardsContainer = document.createElement("div");
      cardsContainer.classList.add("playerCardsContainer");

      var cards = document.createElement("div");
      cards.classList.add("playerCards");

      //creates cards for all the player hands
      for (var j = 0; j < blackjackGame.playerCards[i].gameCards.length; j++) {
        var image = document.createElement("img");
        image.classList.add("cards");
        image.src = `./images/cards/${blackjackGame.playerCards[i].gameCards[j].n}${blackjackGame.playerCards[i].gameCards[j].s}.png`;
        cards.appendChild(image);
      }

      cardsContainer.appendChild(cards);

      var Pscore = document.createElement("p");
      Pscore.classList.add("playerScore");
      Pscore.innerHTML =
        "player points: " + blackjackGame.calculateHandScore(0, i);

      cardsContainer.appendChild(Pscore);
      game.appendChild(cardsContainer);

      //bet container used to create betting chips for each game???????
      var betContainer = document.createElement("div");
      betContainer.classList.add("betContainer");
      var bettedChips = document.createElement("div");
      bettedChips.classList.add("bettedChips");

      //variables to know how many chip images of each type we will need to have
      var FHnumber = parseInt(
        Math.floor(blackjackGame.playerCards[i].betValue / 500)
      );
      var FHremainder = blackjackGame.playerCards[i].betValue % 500;
      var OHnumber = parseInt(Math.floor(FHremainder / 100));
      var OHremainder = FHremainder % 100;
      var TFnumber = parseInt(Math.floor(OHremainder / 25));
      var TFremainder = OHremainder % 25;
      var Fnumber = parseInt(Math.floor(TFremainder / 5));

      var fiveChipRack = document.createElement("div");
      fiveChipRack.classList.add("chipRack");
      for (var v = 0; v < Fnumber; v++) {
        var imageFiveChip = document.createElement("img");
        imageFiveChip.classList.add("chip");
        imageFiveChip.src = "./images/chips/5chip.png";
        fiveChipRack.appendChild(imageFiveChip);
      }

      //game elements used to make the chips and stack them
      var twentyfiveChipRack = document.createElement("div");
      if (TFnumber > 0) {
        twentyfiveChipRack.classList.add("chipRack");
        for (var v = 0; v < TFnumber; v++) {
          var imageTwentyFiveChip = document.createElement("img");
          imageTwentyFiveChip.classList.add("chip");
          imageTwentyFiveChip.src = "./images/chips/25chip.png";
          twentyfiveChipRack.appendChild(imageTwentyFiveChip);
        }
      }

      var onehundredChipRack = document.createElement("div");
      if (OHnumber > 0) {
        onehundredChipRack.classList.add("chipRack");
        for (var v = 0; v < OHnumber; v++) {
          var imageOneHundredChip = document.createElement("img");
          imageOneHundredChip.classList.add("chip");
          imageOneHundredChip.src = "./images/chips/100chip.png";
          onehundredChipRack.appendChild(imageOneHundredChip);
        }
      }

      var fivehundredChipRack = document.createElement("div");
      if (FHnumber > 0) {
        fivehundredChipRack.classList.add("chipRack");
        for (var v = 0; v < FHnumber; v++) {
          var imageFiveHundredChip = document.createElement("img");
          imageFiveHundredChip.classList.add("chip");
          imageFiveHundredChip.src = "./images/chips/500chip.png";
          fivehundredChipRack.appendChild(imageFiveHundredChip);
        }
      }

      bettedChips.appendChild(fiveChipRack);
      bettedChips.appendChild(twentyfiveChipRack);
      bettedChips.appendChild(onehundredChipRack);
      bettedChips.appendChild(fivehundredChipRack);

      var bettedAmmountText = document.createElement("p");
      bettedAmmountText.classList.add("bettedAmmountText");
      bettedAmmountText.innerText =
        "Bet: " + blackjackGame.playerCards[i].betValue;

      betContainer.appendChild(bettedChips);
      betContainer.appendChild(bettedAmmountText);

      game.appendChild(betContainer);

      // blackjackGame.setAvailableButtons(i);

      //container for all the buttons
      var buttonsContainer = document.createElement("div");
      buttonsContainer.classList.add("buttonsContainer");

      var hitButton = document.createElement("button");
      hitButton.classList.add("hitButton");
      hitButton.addEventListener("click", function () {
        blackjackGame.onHit(i);
      });
      hitButton.innerHTML = "Hit";

      var standButton = document.createElement("button");
      standButton.classList.add("standButton");
      standButton.addEventListener("click", function () {
        blackjackGame.onStand(i);
      });
      standButton.innerHTML = "Stand";

      var doubleDownButton = document.createElement("button");
      doubleDownButton.classList.add("doubleDownButton");
      doubleDownButton.addEventListener("click", function () {
        blackjackGame.onDoubleDown(i);
      });
      doubleDownButton.innerHTML = "Double Down";

      var splitButton = document.createElement("button");
      splitButton.classList.add("splitButton");
      splitButton.addEventListener("click", function () {
        blackjackGame.onSplit(i);
      });
      splitButton.innerHTML = "Split";

      var insuranceButton = document.createElement("button");
      insuranceButton.classList.add("insuranceButton");
      insuranceButton.addEventListener("click", function () {
        blackjackGame.onInsurance(i);
      });
      insuranceButton.innerHTML = "Insurance";

      var surrenderButton = document.createElement("button");
      surrenderButton.classList.add("surrenderButton");
      surrenderButton.addEventListener("click", function () {
        blackjackGame.onSurrender(i);
      });
      surrenderButton.innerHTML = "Surrender";

      //shows/hides a specific games buttons
      if (!blackjackGame.playerCards[i].canHit) {
        hitButton.classList.add("ninja");
      } else {
        hitButton.classList.remove("ninja");
      }
      if (!blackjackGame.playerCards[i].canStand) {
        standButton.classList.add("ninja");
      } else {
        standButton.classList.remove("ninja");
      }
      if (!blackjackGame.playerCards[i].canDoubleDown) {
        doubleDownButton.classList.add("ninja");
      } else {
        doubleDownButton.classList.remove("ninja");
      }
      if (!blackjackGame.playerCards[i].canSplit) {
        splitButton.classList.add("ninja");
      } else {
        splitButton.classList.remove("ninja");
      }
      if (!blackjackGame.playerCards[i].canInsure) {
        insuranceButton.classList.add("ninja");
      } else {
        insuranceButton.classList.remove("ninja");
      }
      if (!blackjackGame.playerCards[i].canSurrender) {
        surrenderButton.classList.add("ninja");
      } else {
        surrenderButton.classList.remove("ninja");
      }

      buttonsContainer.appendChild(hitButton);
      buttonsContainer.appendChild(standButton);
      buttonsContainer.appendChild(doubleDownButton);
      buttonsContainer.appendChild(splitButton);
      buttonsContainer.appendChild(insuranceButton);
      buttonsContainer.appendChild(surrenderButton);

      game.appendChild(buttonsContainer);
    }
  },

  addGame: function () {
    blackjackGame.numberActiveGames++;
    blackjackGame.playerCards.push({
      gameID: blackjackGame.numberActiveGames - 1,
      canHit: true,
      canStand: true,
      canSurrender: true,
      canSplit: false,
      canDoubleDown: false,
      canInsure: false,
      isInsured: false,
      isStanding: false,
      hasGameEnded: false,
      betValue: blackjackGame.bettedAmmountInput.value,
      gameScore: null,
      gameCards: [],
    });
    blackjackGame.draw(0, blackjackGame.numberActiveGames - 1);
    blackjackGame.draw(0, blackjackGame.numberActiveGames - 1);

    blackjackGame.setAvailableButtons(blackjackGame.numberActiveGames - 1);
  },
  removeGame: function (game, hasWon, cashBetted) {
    if (cashBetted == null)
      cashBetted = blackjackGame.playerCards[game].betValue;

    if (blackjackGame.playerCards.length != 1) {
      if (hasWon) {
        blackjackGame.playerCash += cashBetted;
        blackjackGame.dealerCash -= cashBetted;
      } else {
        blackjackGame.playerCash -= cashBetted;
        blackjackGame.dealerCash += cashBetted;
      }

      console.log("player Cash on removeGame: " + blackjackGame.playerCash)
      console.log("dealer Cash on removeGame: " + blackjackGame.dealerCash)


      blackjackGame.playerCards[game].hasGameEnded = true;
      blackjackGame.setupPlayerHands();
      blackjackGame.setPlayerDealerCashTexts();
    } else {
      if (hasWon) {
        blackjackGame.playerCash += parseInt(cashBetted);
        blackjackGame.dealerCash -= cashBetted;
        blackjackGame.gameExplanationText.innerHTML = "Player has Won";
      } else {
        if (cashBetted == 0) {
          blackjackGame.gameExplanationText.innerHTML = "Game is a tie";
        } else {
          blackjackGame.playerCash -= cashBetted;
          blackjackGame.dealerCash += parseInt(cashBetted);
          blackjackGame.gameExplanationText.innerHTML = "Dealer has Won";
        }
      }
      blackjackGame.playButton.classList.remove("ninja");
      blackjackGame.bettedAmmountInput.classList.remove("ninja");

      //hides the buttons container of the last active game
      blackjackGame.playerCards[game].canHit = false;
      blackjackGame.playerCards[game].canStand = false;
      blackjackGame.playerCards[game].canDoubleDown = false;
      blackjackGame.playerCards[game].canSplit = false;
      blackjackGame.playerCards[game].canSurrender = false;
      blackjackGame.playerCards[game].canInsure = false;

      blackjackGame.setupPlayerHands();
      blackjackGame.setPlayerDealerCashTexts();
    }

    blackjackGame.checkGameEnded();
  },

  DealerPlays: function () {
    if (blackjackGame.dealerCards.length == 2) {
      //shows the hidden dealer card and the score
      blackjackGame.dealerScoreText.innerHTML = 
      "dealer points: " + blackjackGame.dealerScore;
      blackjackGame.dealerCardsContainer
        .querySelectorAll("img")
        .forEach((n) => n.remove());
      for (var i = 0; i < blackjackGame.dealerCards.length; i++) {
        var card = blackjackGame.dealerCards[i];
        var cardImage = document.createElement("img");
        cardImage.src = `./images/cards/${card.n}${card.s}.png`;
        cardImage.classList.add("cards");
        blackjackGame.dealerCardsContainer.appendChild(cardImage);
      }
    }

    //In here we assume that the game has not ended, and that all of the player games are standing, and that a blackjack has not happened
    if (blackjackGame.dealerScore < 17) {
      blackjackGame.draw(1);
      blackjackGame.calculateHandScore(1);
      blackjackGame.setDealerCardsUI();
      blackjackGame.DealerPlays();
    }

    if (blackjackGame.dealerScore >= 17) {
      for (let i = 0; i < blackjackGame.playerCards.length; i++) {
        //checks if any Player blackjacks
        if (blackjackGame.playerCards[i].gameScore == 21) {
          if (blackjackGame.dealerScore == 21) {
            if (blackjackGame.playerCards[i].isInsured) {
              blackjackGame.removeGame(
                i,
                true,
                parseInt(
                  Math.floor((blackjackGame.playerCards[i].betValue * 2) / 3)
                )
              );
            } else {
              blackjackGame.removeGame(i, false, 0);
            }
          } else if (blackjackGame.playerCards[i].gameCards.length == 2) {
            if (blackjackGame.playerCards[i].isInsured) {
              blackjackGame.removeGame(
                i,
                true,
                blackjackGame.playerCards[i].betValue
              );
              blackjackGame.gameExplanationText.innerHTML = "Even Money.";
            } else {
              blackjackGame.removeGame(
                i,
                true,
                blackjackGame.playerCards[i].betValue * 1.5
              );
              blackjackGame.gameExplanationText.innerHTML = "Blackjack!!!";
            }
          }
        }

        //dealer has busted
        else if (blackjackGame.dealerScore > 21) {
          if (blackjackGame.playerCards[i].isInsured) {
            blackjackGame.removeGame(
              i,
              true,
              parseInt(
                Math.floor((blackjackGame.playerCards[i].betValue * 2) / 3)
              )
            );
          } else {
            blackjackGame.removeGame(
              i,
              true,
              blackjackGame.playerCards[i].betValue
            );
          }
        }

        //see who has more points
        //player wins
        else if (
          blackjackGame.playerCards[i].gameScore > blackjackGame.dealerScore
        ) {
          if(blackjackGame.playerCards[i].isInsured){
            blackjackGame.removeGame(i,true,parseInt(Math.floor((blackjackGame.playerCards[i].betValue * 2) / 3)))
          } else{
            blackjackGame.removeGame(i,true,blackjackGame.playerCards[i].betValue)
          }
        } 
        //player loses
        else if (
          blackjackGame.playerCards[i].gameScore < blackjackGame.dealerScore
        ) {
          blackjackGame.removeGame(
            i,
            false,
            blackjackGame.playerCards[i].betValue
          );
        }
        //Game ended in a tie
        else {
          if (blackjackGame.playerCards[i].isInsured) {
            blackjackGame.removeGame(
              i,
              true,
              parseInt(
                Math.floor((blackjackGame.playerCards[i].betValue * 2) / 3)
              )
            );
          } else {
            blackjackGame.removeGame(i, false, 0);
          }
        }
      }
    }
  },

  draw: function (target, game) {
    //target 0 is for player and 1 for dealer

    var card = blackjackGame.deckCards.pop();

    if (target) {
      blackjackGame.dealerCards.push(card);
    } else {
      blackjackGame.playerCards[game].gameCards.push(card);
    }
  },

  //functions that control the player decisions during each game
  onHit: function (game) {
    blackjackGame.draw(0, game);
    blackjackGame.setAvailableButtons(game);
    blackjackGame.setupPlayerHands();
    blackjackGame.setPlayerDealerCashTexts()
    blackjackGame.checkIfBusted(0, game);
  },
  onStand: function (game) {
    blackjackGame.gameExplanationText.innerHTML =
      "One or more games standing, finish all games";

    //hides the buttons container of the last active game
    blackjackGame.playerCards[game].canHit = false;
    blackjackGame.playerCards[game].canStand = false;
    blackjackGame.playerCards[game].canDoubleDown = false;
    blackjackGame.playerCards[game].canSplit = false;
    blackjackGame.playerCards[game].canSurrender = false;
    blackjackGame.playerCards[game].canInsure = false;

    blackjackGame.setupPlayerHands();
    blackjackGame.playerCards[game].isStanding = true;

    if (blackjackGame.checkAllGamesStanding()) {
      blackjackGame.DealerPlays();
    }
  },
  onDoubleDown: function (game) {
    blackjackGame.playerCards[game].betValue *= 2;
    blackjackGame.playerCards[game].canDoubleDown = false;
    blackjackGame.setupPlayerHands();
  },
  onSplit: function (game) {
    //a new game and a new hand are created
    blackjackGame.addGame();

    //a temporary object is used to switch the last card of the current game with the last card of the newly created one
    var temp = blackjackGame.playerCards[game].gameCards[1];
    blackjackGame.playerCards[game].gameCards[1] =
      blackjackGame.playerCards[game + 1].gameCards[1];
    blackjackGame.playerCards[game + 1].gameCards[1] = temp;
    blackjackGame.setupPlayerHands();
  },
  onInsurance: function (game) {
    blackjackGame.playerCards[game].betValue *= 1.5;
    blackjackGame.playerCards[game].isInsured = true;
    blackjackGame.playerCards[game].canInsure = false;
    blackjackGame.setupPlayerHands();
  },
  onSurrender: function (game) {
    var lostAmmount = parseInt(
      Math.floor(blackjackGame.playerCards[game].betValue / 2)
    );
    blackjackGame.gameExplanationText.innerHTML = "Game Surrendered";
    blackjackGame.removeGame(game, false, lostAmmount);
  },

  //calculates the best possible score for each hand
  calculateHandScore: function (target, game) {
    // target 0 for player 1 for dealer, game is for the player's current active Hand
    if (target) {
      var score = 0;
      var aceCounter = 0;
      for (var i = 0; i < blackjackGame.dealerCards.length; i++) {
        card = blackjackGame.dealerCards[i];
        switch (card.n) {
          case "K":
          case "Q":
          case "J":
            score += 10;
            break;
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9":
          case "10":
            score += parseInt(card.n);
            break;
          case "A":
            aceCounter++;
            break;
        }
      }
      if (aceCounter != 0) {
        var minmax = [];
        for (var elevens = 0; elevens <= aceCounter; elevens++) {
          var calc = score + elevens * 11 + (aceCounter - elevens);
          minmax.push(calc);
        }

        score = minmax[0];
        for (var i of minmax) {
          if (i > score && i <= 21) {
            score = i;
          }
        }
      }

      //here the dealer's hand score is also shown to the user, if we have more than 2 cards
      blackjackGame.dealerScore = score;
      if (blackjackGame.dealerCards.length == 2) {
        blackjackGame.dealerScoreText.innerHTML = "delaer points: ?";
      } else {
        blackjackGame.dealerScoreText.innerHTML =
          "dealer points: " + blackjackGame.dealerScore;
      }
    } else {
      //in case of player

      var score = 0;
      var aceCounter = 0;
      for (
        var i = 0;
        i < blackjackGame.playerCards[game].gameCards.length;
        i++
      ) {
        card = blackjackGame.playerCards[game].gameCards[i];
        switch (card.n) {
          case "K":
          case "Q":
          case "J":
            score += 10;
            break;
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9":
          case "10":
            score += parseInt(card.n);
            break;
          case "A":
            aceCounter++;
            break;
        }
      }
      if (aceCounter != 0) {
        var minmax = [];
        for (var elevens = 0; elevens <= aceCounter; elevens++) {
          var calc = score + elevens * 11 + (aceCounter - elevens);
          minmax.push(calc);
        }

        score = minmax[0];
        for (var i of minmax) {
          if (i > score && i <= 21) {
            score = i;
          }
        }
      }

      blackjackGame.playerCards[game].gameScore = score;
      return score;
    }
  },

  checkIfBusted: function (target, game) {
    if (target) {
    } else {
      if (blackjackGame.playerCards[game].gameScore > 21) {
        blackjackGame.gameExplanationText.innerHTML = "Player busted";
        blackjackGame.removeGame(game, false, blackjackGame.playerCards[game].betValue);
      }
    }
  },
  checkAllGamesStanding: function () {
    var allStanding = true;
    for (let i = 0; i < blackjackGame.playerCards.length; i++) {
      if (!blackjackGame.playerCards[i].isStanding) {
        allStanding = false;
      }
    }
    return allStanding;
  },
  checkGameEnded: function () {
    if (blackjackGame.playerCash <= 0) {
      blackjackGame.playButton.classList.add("ninja");
      blackjackGame.restartGameButton.classList.remove("ninja");
      blackjackGame.gameExplanationText.innerHTML =
      "You have lost, better luck next time."
    } else if (blackjackGame.dealerCash <= 0) {
      blackjackGame.playButton.classList.add("ninja");
      blackjackGame.restartGameButton.classList.remove("ninja");
      blackjackGame.gameExplanationText.innerHTML =
        "Congratulations, you have won!!!";
    }
  },
  setAvailableButtons: function (game) {
    currentGame = blackjackGame.playerCards[game];

    if (currentGame.gameCards.length == 2) {
      if (blackjackGame.dealerCards[0].n == "A") currentGame.canInsure = true;

      if (currentGame.gameCards[0].n == currentGame.gameCards[1].n)
        currentGame.canSplit = true;

      if (
        parseInt(currentGame.gameCards[0].n) +
          parseInt(currentGame.gameCards[1].n) <=
        11
      )
        currentGame.canDoubleDown = true;

      if (
        currentGame.gameCards[0].n == "A" ||
        currentGame.gameCards[1].n == "A"
      )
        currentGame.canDoubleDown = true;
    } else {
      currentGame.canSplit = false;
      currentGame.canDoubleDown = false;
      currentGame.canSurrender = false;
    }
  },
  setPlayerDealerCashTexts: function () {
    blackjackGame.playerCashText.innerHTML =
      "Player Cash: " + blackjackGame.playerCash;
    blackjackGame.dealerCashText.innerHTML =
      "Dealer Cash: " + blackjackGame.dealerCash;
  },
  setDealerCardsUI() {
    blackjackGame.dealerCardsContainer
      .querySelectorAll("img")
      .forEach((n) => n.remove());

    for (var i = 0; i < blackjackGame.dealerCards.length; i++) {
      var card = blackjackGame.dealerCards[i];
      var cardImage = document.createElement("img");
      cardImage.src = `./images/cards/${card.n}${card.s}.png`;
      //if we only have 2 cards for the dealer hide the second card
      if (
        blackjackGame.dealerCards.length == 2 &&
        card == blackjackGame.dealerCards[1]
      ) {
        cardImage.src = "./images/cards/gray_back.png";
      }
      cardImage.classList.add("cards");
      blackjackGame.dealerCardsContainer.appendChild(cardImage);
    }
  },
};

//starts the game on page load
window.addEventListener("load", blackjackGame.init( 300));
