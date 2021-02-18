/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const Main = require('mainscreen.json');
const WhichMovie = require('whichmovie.json');
const Quote = require('quote.json');


/******** HANDLERS ********/

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    if (supportsAPL(handlerInput)) {
      return handlerInput.responseBuilder
        .speak(welcomeMessage)
        .reprompt(welcomeMessage)
        .addDirective({
          type : 'Alexa.Presentation.APL.RenderDocument',
          document : Main,
          datasources : {
            "movieQuoteQuizData": {
              "type": "object",
              "properties": {
                "title": "How Well Do You Know: The Ultimate Trivia Game!"
              }
            }
          }
        })
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(welcomeMessage)
        .reprompt(welcomeMessage)
        .getResponse();
    }
  },
};

const YesIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'NextMovieIntent'
          || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent'
          || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StartOverIntent');
  },
  handle(handlerInput) {
    const speechText = `Let's test your knowledge. Pick a category!`;
    if (handlerInput.requestEnvelope.request.intent.name === 'NextMovieIntent') {
    }
    console.log(handlerInput.requestEnvelope.request.intent);
    
    if (supportsAPL(handlerInput)) {
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .addDirective({
          type : 'Alexa.Presentation.APL.RenderDocument',
          document : WhichMovie,
          datasources : {}
        })
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    }
  },
};

const MovieIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'MovieNameIntent'
      || handlerInput.requestEnvelope.request.intent.name === 'NextQuoteIntent');
  },
  handle(handlerInput) {
    let speechText;
    if (handlerInput.requestEnvelope.request.intent.name === 'MovieNameIntent') {
      currentMovie = handlerInput.requestEnvelope.request.intent.slots.movieName.resolutions.resolutionsPerAuthority[0].values[0].value.name;
      speechText = `Okie dokie, let's test you on ${currentMovie}. Complete this: `;
    } else if (handlerInput.requestEnvelope.request.intent.name === 'NextQuoteIntent') {
      speechText = `Onward! Try completing this one: `;

      if (currentMovie === null) {
        speechText = `Something went wrong.`;
        return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .withSimpleCard(`Oops!`, `Try saying, "Alexa, help"`)
          .getResponse();
      }
    }

    let quote = breakDownSentence(pickSentence(currentMovie));
    console.log(quote);
    speechText += quote.replace('_____', `<emphasis level="strong">blank</emphasis>`);

    if (supportsAPL(handlerInput)) {
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .addDirective({
          type : 'Alexa.Presentation.APL.RenderDocument',
          document : Quote,
          datasources : {
              "movieQuoteQuizData": {
                  "type": "object",
                  "properties": {
                      "title": quote,
                      "backgroundImageRound": "https://i.imgur.com/prffOgH.png",
                      "backgroundImageLandscape": "https://i.imgur.com/sjREu6G.png"
                  }
              }
          }
        })
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    }
  }
};

const AnswerIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AnswerIntent';
  },
  handle(handlerInput) {
    let spokenWord = handlerInput.requestEnvelope.request.intent.slots.word.value;
    let speechText = '';
    let quote = '';
    let directives = ''

    if (currentChosenWord === null) {
      speechText = `Say "help" if you aren't sure what to do!`;

      if (supportsAPL(handlerInput)) {
        return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .addDirective({
              type : 'Alexa.Presentation.APL.RenderDocument',
              document : Main,
              datasources : {
                "movieQuoteQuizData": {
                  "type": "object",
                  "properties": {
                    "title": speechText
                  }
                }
              }
          })
          .getResponse();
      }
    } else if (currentChosenWord === spokenWord) {
      speechText = getSpeechCon(true);
      quote = `${capitalizeFirstLetter(currentChosenWord)} is correct! Say "new question" or you can even choose from another category!`;

      if (supportsAPL(handlerInput)) {
        return handlerInput.responseBuilder
          .speak(speechText + quote)
          .reprompt(speechText + quote)
          .addDirective({
              type : 'Alexa.Presentation.APL.RenderDocument',
              document : Quote,
              datasources : {
                  "movieQuoteQuizData": {
                      "type": "object",
                      "properties": {
                          "title": quote,
                          "backgroundImageRound": "https://i.imgur.com/GOsI1RN.png",
                          "backgroundImageLandscape": "https://i.imgur.com/yHBbX4l.png"
                      }
                  }
              }
          })
          .getResponse();
      }
    } else {
      speechText = getSpeechCon(false);
      quote = `The correct answer was ${currentChosenWord}. Say "new question" or another genre!`;
      
      if (supportsAPL(handlerInput)) {
        return handlerInput.responseBuilder
          .speak(speechText + quote)
          .reprompt(speechText + quote)
          .addDirective({
              type : 'Alexa.Presentation.APL.RenderDocument',
              document : Quote,
              datasources : {
                  "movieQuoteQuizData": {
                      "type": "object",
                      "properties": {
                          "title": quote,
                          "backgroundImageRound": "https://i.imgur.com/qkiABIN.png",
                          "backgroundImageLandscape": "https://i.imgur.com/sfXjUK1.png"
                      }
                  }
              }
          })
          .getResponse();  
      }
    }

    return handlerInput.responseBuilder
        .speak(speechText + quote)
        .reprompt(speechText + quote)
        .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    if (supportsAPL(handlerInput)) {
      return handlerInput.responseBuilder
        .speak(helpMessage)
        .reprompt(helpMessage)
        .addDirective({
          type : 'Alexa.Presentation.APL.RenderDocument',
          document : Main,
          datasources : {
            "movieQuoteQuizData": {
              "type": "object",
              "properties": {
                "title": helpMessage
              }
            }
          }
        })
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(helpMessage)
        .reprompt(helpMessage)
        .getResponse();
    }
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    if (supportsAPL(handlerInput)) {
      return handlerInput.responseBuilder
        .speak(speechText)
        .addDirective({
          type : 'Alexa.Presentation.APL.RenderDocument',
          document : Main,
          datasources : {
            "movieQuoteQuizData": {
              "type": "object",
              "properties": {
                "title": "Thanks for playing!"
              }
            }
          }
        })
        .withShouldEndSession(true)
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(true)
        .getResponse();
    }
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    currentChosenWord = null;
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log("WHOLE ERROR" + JSON.stringify(error));

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

/******** VARIABLES ********/

let currentChosenWord = null;
let currentMovie = null;
const welcomeMessage = `Welcome to Music Game, the hottest quiz game in the world. Are you ready to play?`;
const helpMessage = `Name the category you would like to be tested on, and then guess the missing word!`;
const speechConsCorrect = ['Booya', 'All righty', 'Bam', 'Bazinga', 'Bingo', 'Boom', 'Bravo', 'Cha Ching', 'Cheers', 'Dynomite', 'Hip hip hooray', 'Hurrah', 'Hurray', 'Huzzah', 'Oh dear.  Just kidding.  Hurray', 'Kaboom', 'Kaching', 'Oh snap', 'Phew','Righto', 'Way to go', 'Well done', 'Whee', 'Woo hoo', 'Yay', 'Wowza', 'Yowsa'];
const speechConsWrong = ['Argh', 'Aw man', 'Blarg', 'Blast', 'Boo', 'Bummer', 'Darn', "D'oh", 'Dun dun dun', 'Eek', 'Honk', 'Le sigh', 'Mamma mia', 'Oh boy', 'Oh dear', 'Oof', 'Ouch', 'Ruh roh', 'Shucks', 'Uh oh', 'Wah wah', 'Whoops a daisy', 'Yikes'];
const data = [
  {movieName: 'Global Hits', sentences: [
    `You call me on the telephone, you feel so far away. You tell me to come over, there is some games you want to play`,
    `I been on my own for long enough, Maybe you can show me how to love, maybe, I am going through withdrawals`,
    `I got the horses in the back, Horse tack is attached, Hat is matte black`,
    `Mama said, Fulfill the prophecy, Be something greater, Go make a legacy, Manifest destiny`,
    `Well, I found a woman, stronger than anyone I know, She shares my dreams, I hope that someday I will share her home`,
    `Killed the demons of my mind, Ever since you came around`,
    `Lightning strikes every time she moves, And everybodys watching her.`,
    `She wanna ride me like a cruise, And I am not tryna lose Then you are left in the dust, Unless I stuck by ya`,
    `Who is gonna walk you through the dark side of the morning.`,
    `Some superhero, Some fairytale bliss.`,
    `And I am feeling so small; It was over my head.`,
    'As long as I can feel the beat I dont need no money.',
    'One taught me love, One taught me patience, And one taught me pain.',
    'Crashing, hit a wall; Right now I need a miracle.',
    'No ones ever gonna hurt you, love I am gonna give you all of my love.',
    'I got that sunshine in my pocket, got that good soul in my feet'
  ]},
  
  
  {movieName: 'Rock Music',  sentences: [
    `And when the broken hearted people living in the world agree, There will be an answer`,
    `There's a lady who's sure all that glitters is gold And she's buying a stairway to heaven`,
    `On a dark desert highway, cool wind in my hair, warm smell of colitas, rising up through the air `,
    `I farm for my meals, I get my back into my living, I don't need to fight, To prove I'm right No, I don't need to be forgiven`,
    `When I'm drivin' in my car, and the man come on the radio He's tellin' me more and more about some useless information`,
    `She had the sightless eyes, telling me no lies, Knocking me out with those American thighs`,
    `And we both know hearts can change And it's hard to hold a candle In the cold November rain`,
    `You need cooling Baby, I'm not fooling, I'm gonna send ya Back to schooling`,
    `Get away, You get a good job with good pay and you're okay`,
    `Here come old flat top, He come grooving up slowly, He got joo joo eyeball`
  ]},
  {movieName: 'Top Hollywood Movie Quotes',  sentences: [
    `Frankly, my dear, I don’t give a damn.`,
    `I'm going to make him an offer he can't refuse`,
    `Toto, I've got a feeling we're not in Kansas anymore.`,
    `We got no movement, not a sign of a shadow.`,
    `May the Force be with you`,
    `9 Fasten your seatbelts. It's going to be a bumpy night`,
    `You talking to me?`,
    `They call me Mister Tibbs!`,
    `I'm as mad as hell, and I'm not going to take this anymore! `,
    `Louis, I think this is the beginning of a beautiful friendship.`,
    `A census taker once tried to test me. I ate his liver with some fava beans and a nice Chianti.`,
    `Bond. James Bond.`,
    `There's no place like home`,
    `Show me the money!`,
    `Mama always said life was like a box of chocolates. You never know what you're gonna get`,
    `Houston, we have a problem`,
    `Greed, for lack of a better word, is good.`,
    `Houston, we have a problem`,
    `Keep your friends close, but your enemies closer.`,
    `Elementary, my dear Watson`,
    `Your ego is writing checks your body can't cash`,
  ]},
  {movieName: 'Top Bollywood Movie Quotes',  sentences: [
    `Aaj mere paas gaadi hai, bungla hai, paisa hai.`,
    `Rishte mein toh hum tumhare baap lagte hain, naam hai Shahenshah`,
    `Kaun kambakth hai jo bardasht karne ke liye peeta hai. Main toh peeta hoon ke bas saans le sakoon`,
    `Mein aaj bhi pheke hue paise nahin utha ta.`,
    `Pushpa, I hate tears`,
    `Bade bade shehron mein aisi chhoti chhoti baatein hoti rehti hain, Senorita.`,
    `Mogambo khush hua!`,
    `Dosti ka ek usool hai, madam, no sorry, no thank you.`,
    `Kabhi Kabhi Kuch Jeetne Ke Liya Kuch Haar Na Padta Hai`,
    `Don ko pakadna mushkil hi nahi, namumkin hai`,
    `Haar Ke Jeetne Wale Ko Baazigar Kehte Hai.`,
    `Crime Master Gogo naam hai mera, aankhen nikal ke gotiyan khelti hun main.`,
    `Hum jahan khade ho jaate hain, line wahi se shuru hoti hain.`,
    `Thapad se darr nahi lagta, pyaar se lagta hai`,
    `Babumoshai, zindagi badi honi chahiye, lambi nahi.`,
    `Mere Karan Arjun aayenge.`,
    `Agar maa ka doodh piya hai toh samne aa`,
    `Uska toh na bad luck hi kharab hai`,
    `Mein apni favourite hoon`,
    `Picture abhi baaki hai mere dost`,
    `How’s the josh`,
    `Aap humse humari zindagi maang lete hum aap ko khushi khushi de dete`,
    `Don’t underestimate the power of a common man`,
    `Tumse naa ho payega`,
    `Tension lene ka nahi, sirf dene ka`,
    `Tumse naa ho payega`,
    `Sara shehar mujhe lion ke naam se jaanta hai`,
    `Our business is our business, none of your business`,
    `Don’t angry me`,
    `Har team main bas ek hi gunda ho sakta hai aur iss team ka gunda main hoon`,
    `Jaa Simran; jee le apni zindagi`,
    `Maska hai maska… ek dum jhakaas`,
    `Utha le re baba`,
    `Kabhi kabhi lagta hain ki apun hi bhagwaan hain`
    
    
  ]},
  {movieName: 'All Time Hit Songs',  sentences: [
    `You call me on the telephone, you feel so far away. You tell me to come over, there is some games you want to play`,
    `I been on my own for long enough, Maybe you can show me how to love, maybe, I am going through withdrawals`,
    `I got the horses in the back, Horse tack is attached, Hat is matte black`,
    `Mama said, Fulfill the prophecy, Be something greater, Go make a legacy, Manifest destiny`,
    `Well, I found a woman, stronger than anyone I know, She shares my dreams, I hope that someday I will share her home`,
    `Killed the demons of my mind, Ever since you came around`,
    `Lightning strikes every time she moves, And everybodys watching her.`,
    `She wanna ride me like a cruise, And I am not tryna lose Then you are left in the dust, Unless I stuck by ya`,
    `Who is gonna walk you through the dark side of the morning.`,
    `Some superhero, Some fairytale bliss.`,
    `And I am feeling so small; It was over my head.`,
    'As long as I can feel the beat I dont need no money.',
    'One taught me love, One taught me patience, And one taught me pain.',
    'Crashing, hit a wall; Right now I need a miracle.',
    'No ones ever gonna hurt you, love I am gonna give you all of my love.',
    'I got that sunshine in my pocket, got that good soul in my feet',
    'I never really knew that she could dance like this.',
    'I got that sunshine in my pocket, got that good soul in my feet',
    'Crashing, hit a wall; Right now I need a miracle',
    'I got that sunshine in my pocket, got that good soul in my feet',
    'Lost in your mind, I wanna know. Am I losing my mind.'
    
  ]}
];

/******** HELPER FUNCTIONS ********/

function getRandom(min, max) {
  return Math.floor((Math.random() * ((max - min) + 1)) + min);
}

function getSpeechCon(type) {
  if (type) return `<say-as interpret-as='interjection'>${speechConsCorrect[getRandom(0, speechConsCorrect.length - 1)]}! </say-as><break strength='strong'/>`;
  return `<say-as interpret-as='interjection'>${speechConsWrong[getRandom(0, speechConsWrong.length - 1)]} </say-as><break strength='strong'/>`;
}

function capitalizeFirstLetter(string) {
  let x = string;
  return x.charAt(0).toUpperCase() + x.slice(1);
}

// get a new sentence with a replaced word and the word to be guessed
function breakDownSentence(sent) {
  let arr = sent.split(' ');
  let boringWords = [
    `know`,
    `there`,
    `then`,
    `I'll`,
    `it's`,
    `here`,
    `wait`,
    `some`,
    `like`,
    `mean`,
    `you`,
    `with`,
    `seem`,
    `about`,
    `they're`,
    `that`,
    `I've`,
    `hai`,
    `have`
  ]
  let legalWords = arr.filter(word => {
    return word.length > 3 && !boringWords.includes(word);
  });
  let chosenWord = legalWords[getRandom(0, legalWords.length - 1)];
  arr[arr.indexOf(chosenWord)] = '_____'; // 5 underscores
  currentChosenWord = chosenWord.replace(/[^0-9a-z]/gi, '').toLowerCase();

  return arr.join(' ');
}

function pickSentence(movie) {
  let movieQuotes = data.filter((obj) => {
    return obj.movieName === movie;
  })[0].sentences;
  return movieQuotes[getRandom(0, movieQuotes.length - 1)];
}

function supportsAPL(handlerInput) {
    const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
    const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
    return aplInterface !== null && aplInterface !== undefined;
}

/******** LAMBDA SETUP http://www.whatobuy.in/2018/04/lae-dooba-lyrics/ ********/

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    MovieIntentHandler,
    YesIntentHandler,
    AnswerIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
