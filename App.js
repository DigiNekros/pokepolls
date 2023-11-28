
import React, {useState, useEffect, useRef} from 'react';
import {
    Text,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    TextInput,
    ImageBackground,
    Alert,
} from 'react-native';
import 'react-native-gesture-handler'
import { CurrentRenderContext, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import SoundPlayer from 'react-native-sound';
import AppContext from './AppContext'
import { Section } from 'react-native-paper/lib/typescript/components/Drawer/Drawer';

// PokeAPI: https://pokeapi.co/api/v2/pokemon?limit=1017&offset=0
const Stack = createNativeStackNavigator();
const bgImage = {uri: 'https://purepng.com/public/uploads/large/purepng.com-pokeballpokeballdevicepokemon-ballpokemon-capture-ball-17015278258617bdog.png'}
const Home = ({navigation}) => {
  const context = React.useContext(AppContext);
  return (
    <SafeAreaProvider style = {style.root}>
      <SafeAreaView style = {style.hmImage}>
        <ImageBackground source={bgImage} resizeMode="cover" style={style.hmImage}>
          <Text style = {style.title}>PokePolls!</Text>
          <Text style = {style.subtitle}>Can you name them all?</Text>
          <TouchableOpacity style = {style.hmButton} onPress = {() => navigation.navigate('Game')}>
            <Text style = {style.hmText}>Play Game!</Text>
          </TouchableOpacity>
          <TouchableOpacity style = {style.hmButton} onPress = {() => navigation.navigate('Username')}>
            <Text style = {style.hmText}>Set Username</Text>
          </TouchableOpacity>
          <TouchableOpacity style = {style.hmButton} onPress = {() => navigation.navigate('Leaderboard')}>
            <Text style = {style.hmText}>Leaderboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style = {style.hmButton} onPress = {() => navigation.navigate('Credits')}>
            <Text style = {style.hmText}>Credits</Text>
          </TouchableOpacity>
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const Game = ({navigation}) => {
  const context = React.useContext(AppContext);
  const [guessList, setGuessList] = useState([{name: "empty"}])
  const [pokenames, setPokenames] = useState([])
  const [pokeguess, setPokeguess] = useState("")
  const [score, setScore] = useState(0)
  const [sec,setSec] = useState(0);
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(true);
  const [gameActive, setGameActive] = useState(true);
  const intervalRef = useRef(null); 
  const startTimeRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  
  
  // useEffect hook to call api
  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=1017&offset=0')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setPokenames([...data.results, {name: data.name, url: data.url, recorded: false}])
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);
  const checkGuess = (guess) => {
    let answers = [...pokenames];
    const isGuessRepeated = guessList.some((item) => item.name.toLowerCase() === guess.toLowerCase());
    if (isGuessRepeated) {
      Alert.alert('Repeated Guess', 'You have already guessed this Pokemon.');
      return;
    }
    const isValidGuess = answers.some((pokemon) => pokemon.name === guess.toLowerCase());
    if (!isValidGuess) {
      Alert.alert('Invalid Guess', 'Please enter a valid Pokemon name.');
      return;
    }
    answers.forEach(a=> {
      if (a.name === guess.toLowerCase()) {
        guessList.forEach(b => {
          if ((b.name === "empty" && score > 0) || (b.name === guess.toLowerCase() && b.recorded == true)) {
            setIndex(index+1);
            if (index > 1) {
              return;
            }
            return;
          }
          else {
            setScore(score+1)
            setGuessList([...guessList, {name: guess, url: pokenames.url, recorded: !a.recorded}])
            setPokeguess('')
          }
        })
      }
    })
  }
  const startTime = () => {
    startTimeRef.current=Date.now()-sec*1000;
    intervalRef.current = setInterval(() => {
      setSec(Math.floor((Date.now()-
      startTimeRef.current) / 1000));
    }, 1000);
    setRunning(!running)
  };
  const stopTime = () => { 
    clearInterval(intervalRef.current); 
    setRunning(!running); 
  };
  const replaceEntry = () => {
    const new_list = context.userList.map(t => {
      if (t.username === context.username && ((t.pokemon < score) || (t.pokemon == score && sec < t.seconds))) {
        return {...context.userList, username: context.username, pokemon: score, seconds: sec}
      }
      return t
    })
    context.setUserList(new_list)
    context.setUsername(context.username)
  }
  const giveUp = () => {
    stopTime()
    replaceEntry()
    setGameActive(!gameActive);
  }
  useEffect(() => {
    if (gameActive == false && context.username) {
      Alert.alert("Well done, " + context.username + "!", "You answered " + score + " Pokemon in " + formatTime(sec) + "!", [{text: "OK", onPress: () => navigation.goBack()}])
    }
    if (gameActive == false && !context.username) {
      Alert.alert("Well done!", "You answered " + score + " Pokemon in " + formatTime(sec) + "!", [{text: "OK", onPress: () => navigation.goBack()}])
    }
  });

  const formatTime = () => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }
  return (
    <SafeAreaProvider style = {style.root}>
      <SafeAreaView style = {style.hmImage}>
        <ImageBackground source={bgImage} resizeMode="cover" style={style.hmImage}>
          {running == false ? 
          <TextInput
            style = {game.TIBox}
            onChangeText={setPokeguess}
            value={pokeguess}
            placeholder="Enter your guess here"
          ></TextInput> :
          <SafeAreaView style = {game.gameOffBox}>
            <Text style = {game.gameOffText}>Press Start to play</Text>
          </SafeAreaView>
          }
          <TouchableOpacity style = {game.submitBox} onPress = {() => checkGuess(pokeguess)}>
            <Text style = {game.submitText}>Submit</Text>
          </TouchableOpacity>
          <SafeAreaView style = {game.PABox}>
            <Text style = {game.PATitle}>Past Answers</Text>
            <FlatList
            inverted
            data={guessList}
            renderItem={({ item }) => (
              <Text style = {game.PAEntry}>{item.name === "empty" ? "" : item.name}</Text>
            )}
            style = {game.PAEntry}
            keyExtractor={(item, index) => index.toString()}
            />
          </SafeAreaView>
          <SafeAreaView style = {game.scoreBox}>
            <Text style = {game.scoreText}>Score: {score}</Text>
            <Text style = {game.scoreText}>Time: {formatTime(sec)}</Text>
          </SafeAreaView>
          <SafeAreaView style = {{flexDirection: "row", alignSelf: "center", top: 25,}}>
            {running == true ? (
              <TouchableOpacity style = {game.timeBox} onPress = {() => startTime()}>
                <Text style = {game.timeText}>Start</Text>
              </TouchableOpacity>
            ) :
            (
              <TouchableOpacity style = {game.timeBox} onPress = {() => stopTime()}>
                <Text style = {game.timeText}>Stop</Text>
              </TouchableOpacity>
            )
          }
            <TouchableOpacity style = {game.giveUpBox} onPress = {() => giveUp()}>
              <Text style = {game.giveUpText}>Give Up</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const Username = ({navigation}) => {
  const context = React.useContext(AppContext);
  const createEntry = (username) => {
    const userExists = context.userList.some((item) => item.username === username);
    if (userExists) {
      Alert.alert('Username Exists', 'This username is already taken. Please choose a different username.');
    }
    else {
      context.setUserList([...context.userList, {username: username, pokemon: 0, seconds: 0}])
    }
  }
  return (
    <SafeAreaProvider style = {style.root}>
      <SafeAreaView style = {style.hmImage}>
        <ImageBackground source={bgImage} resizeMode="cover" style={style.hmImage}>
          <SafeAreaView style = {un.unNoteBox}>
            <Text style = {un.unNoteText}>If you already entered your name into the Leaderboard, type your username into the box and then press Back to Menu.</Text>
          </SafeAreaView>
          <SafeAreaView style = {un.unTIBox}>
            <TextInput
              style = {un.unTIText}
              onChangeText = {context.setUsername}
              value = {context.username}
              placeholder = "What is your name?"
            ></TextInput>
          </SafeAreaView>
          <SafeAreaView style = {{flexDirection: "row", alignSelf: "center", top: 25,}}>
            <SafeAreaView style = {un.unSUNBox}>
              <TouchableOpacity onPress = {() => createEntry(context.username)}>
                <Text style = {un.unSUNText}>Submit</Text>
              </TouchableOpacity>
            </SafeAreaView>
            <SafeAreaView style = {un.unBTMBox}>
              <TouchableOpacity onPress = {() => navigation.goBack()}>
                <Text style = {un.unBTMText}>Back To Menu</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </SafeAreaView>
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const Leaderboard = ({navigation}) => {
  const context = React.useContext(AppContext);
  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }
  /*
  
   */
  return (
    <SafeAreaProvider style = {style.root}>
      <SafeAreaView style = {style.hmImage}>
        <ImageBackground source={bgImage} resizeMode="cover" style={style.hmImage}>
          {context.userList.length === 0 ? 
            (
              <SafeAreaView style={leaderboard.noUsersBox}>
                <Text style={leaderboard.noUsersText}>
                  Please enter a username to appear on the Leaderboard.
                </Text>
              </SafeAreaView>
            ) : (
              <SafeAreaView style = {{alignSelf: "center"}}>
                <FlatList
                  style = {{alignSelf: 'center'}}
                  data={context.userList}
                  renderItem={({item}) =>
                    <SafeAreaView style = {leaderboard.entryBox}>
                      <Text style = {leaderboard.entryText}>{item.username}: {item.pokemon} pokemon guessed</Text>
                      <Text style = {leaderboard.entryText}>Record: {formatTime(item.seconds)}</Text>
                    </SafeAreaView>
                  }
                  ></FlatList>
              </SafeAreaView>
            )
          }
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const Credits = ({navigation}) => {
  const context = React.useContext(AppContext);
  return (
    <SafeAreaProvider style = {style.root}>
      <SafeAreaView style = {style.hmImage}>
        <ImageBackground source={bgImage} resizeMode="cover" style={style.hmImage}>
          <SafeAreaView style = {credits.box1}>
            <Text style = {credits.credits1}>I do not own Pokemon, the brand belongs to © Nintendo/Creatures Inc./GAME FREAK Inc.</Text>
          </SafeAreaView>
          <SafeAreaView style = {credits.box2}>
            <Text style = {credits.credits2}>Made by Parker Nguyen, a humble (and sleep deprived) CSUF student</Text>
          </SafeAreaView>
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const App = () => {
  const [pokenames, setPokenames] = useState([])
  const [username, setUsername] = useState("")
  const [userList, setUserList] = useState([])
  // test function to find api
  const FetchDataComponent = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);  
    useEffect(() => {
      fetch('https://pokeapi.co/api/v2/pokemon?limit=1017&offset=0')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          setPokenames([...data.results, {name: data.name, url: data.url, recorded: false}])
          setLoading(false);
        })
        .catch((error) => {
          setError(error);
          setLoading(false);
        });
    }, []);
    if (error) {
      return <Text>Error: {error.message}</Text>;
    }
    return (
      <SafeAreaView>
        <FlatList
            data={pokenames}
            renderItem={({ item }) => (
              <Text style = {game.PAEntry}>{item.name}</Text>
            )}
            style = {game.PAEntry}
            keyExtractor={(item, index) => index.toString()}
            />
      </SafeAreaView>
    );
  }
  const contextVal = {
    userList,
    setUserList,
    username,
    setUsername,
    pokenames,
    setPokenames,
    FetchDataComponent,
  }
  useEffect(() => {
    const bgm = new SoundPlayer('home_theme.wav', SoundPlayer.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Error loading the sound', error);
        return;
      }
      console.log("Sound loaded successfully");
      bgm.setNumberOfLoops(-1);
      bgm.setVolume(0.5);
      bgm.play((success) => {
        if (success) {
          console.log('Sound played successfully');
        } else {
          console.log('Sound playback failed due to audio decoding errors');
        }
      });
    });
    return () => {
      if (bgm) {
        bgm.stop();
        bgm.release();
        console.log('Sound stopped and released');
      }
    };
  }, []);
  return (
    <AppContext.Provider value = {contextVal}>   
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen name = "Home" component = {Home}></Stack.Screen>
        <Stack.Screen name = "Game" component = {Game}></Stack.Screen>
        <Stack.Screen name = "Username" component = {Username}></Stack.Screen>
        <Stack.Screen name = "Leaderboard" component = {Leaderboard}></Stack.Screen>
        <Stack.Screen name = "Credits" component = {Credits}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  </AppContext.Provider>
  );
}

const style = StyleSheet.create ({
  title: {
    fontFamily: 'PokemonSolidNormal',
    fontSize: 50,
    textAlign: 'center',
    color: 'black',
    textShadowColor: 'white',
    textShadowRadius: 5,
    bottom: 50
  },
  subtitle: {
    fontFamily: 'pkmnfl',
    fontSize: 25,
    color: 'black',
    textAlign: 'center',
    bottom: 50
  },
  root: {flex: 1},
  hmBG: {
    alignItems: 'center',
    opacity: '0.7'
  },
  hmImage: {
    justifyContent: 'center',
    flex: 1,
  },
  hmButton: {
    backgroundColor:'#BDC2C4',
    width: 200,
    height: 50,
    borderRadius: 5,
    borderColor: 'black',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20
  },
  hmText: {
    fontFamily: 'pkmndp',
    fontSize: 20,
    textAlign: 'center',
    color: 'black',
  },
})

const game = StyleSheet.create ({
  gameOffBox: {
    backgroundColor:'#BDC2C4',
    width: 300,
    height: 55,
    fontSize: 30,
    color: 'black',
    alignSelf: 'center',
    textAlign: 'center',
    fontFamily: 'pkmnrs',
    borderRadius: 5,
    bottom: 40},
  gameOffText: {
    fontFamily: 'pkmndp',
    fontSize: 30,
    textAlign: 'center',
    color: 'black',
    top: 10,
  },
  TIBox: {
    backgroundColor:'#BDC2C4',
    width: 300,
    height: 55,
    fontSize: 30,
    color: 'black',
    alignSelf: 'center',
    textAlign: 'center',
    fontFamily: 'pkmnrs',
    borderRadius: 5,
    bottom: 40
  },
  PABox: {
    backgroundColor:'#BDC2C4',
    width: 300,
    height: 100,
    borderRadius: 10,
    borderColor: 'black',
    justifyContent: 'center',
    alignSelf: 'center',
    bottom: 10,
  },
  PATitle: {
    fontFamily: 'pkmndp',
    fontSize: 30,
    textAlign: 'center',
    color: 'black',
  },
  PAEntry: {
    textAlign: 'center',
    color: 'black',
    fontFamily: 'pkmnfl',
    fontSize: 20,
  },
  submitBox: {
    backgroundColor:'#BDC2C4',
    width: 200,
    height: 50,
    borderRadius: 5,
    borderColor: 'black',
    justifyContent: 'center',
    alignSelf: 'center',
    bottom: 25
  },
  submitText: {
    fontFamily: 'pkmndp',
    fontSize: 30,
    textAlign: 'center',
    color: 'black',
  },
  timeBox: {
    backgroundColor:'#BDC2C4',
    width: 150,
    height: 50,
    borderRadius: 5,
    borderColor: 'black',
    justifyContent: 'center',
    alignSelf: 'center',
    right: 25
  },
  timeText: {
    fontFamily: 'pkmndp',
    fontSize: 30,
    textAlign: 'center',
    color: 'black',
  },
  scoreBox: {
    backgroundColor:'#BDC2C4',
    width: 200,
    height: 75,
    borderRadius: 5,
    borderColor: 'black',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  scoreText: {
    fontFamily: 'pkmndp',
    fontSize: 30,
    textAlign: 'center',
    color: 'black',
  },
  giveUpBox: {
    backgroundColor:'#BDC2C4',
    width: 150,
    height: 50,
    borderRadius: 5,
    borderColor: 'black',
    justifyContent: 'center',
    alignSelf: 'center',
    left: 25
  },
  giveUpText: {
    fontFamily: 'pkmndp',
    fontSize: 30,
    textAlign: 'center',
    color: 'black',
  },
})

const credits = StyleSheet.create ({
  box1: {
    backgroundColor:'#BDC2C4',
    width: 350,
    height: 120,
    borderRadius: 10,
    borderColor: 'black',
    justifyContent: 'center',
    alignSelf: 'center',
    bottom: 110,
  },
  box2: {
    backgroundColor:'#BDC2C4',
    width: 350,
    height: 120,
    borderRadius: 10,
    borderColor: 'black',
    justifyContent: 'center',
    alignSelf: 'center',
    top: 100
  },
  credits1: {fontFamily: 'pkmnrs', fontSize: 30, color: 'black', textAlign: 'center'},
  credits2: {fontFamily: 'pkmnrs', fontSize: 30, color: 'black', textAlign: 'center'}
})

const un = StyleSheet.create({
  unTIBox: {
    backgroundColor:'#BDC2C4',
    width: 250,
    height: 100,
    borderRadius: 5,
    borderColor: 'black',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  unTIText: {
    fontFamily: 'pkmndp',
    fontSize: 30,
    textAlign: 'center',
    color: 'black',
  },
  unSUNBox: {
    backgroundColor:'#BDC2C4',
    width: 150,
    height: 75,
    borderRadius: 5,
    borderColor: 'black',
    justifyContent: 'center',
    alignSelf: 'center',
    right: 20,
  },
  unSUNText: {
    fontFamily: 'pkmndp',
    fontSize: 30,
    textAlign: 'center',
    color: 'black',
  },
  unBTMBox: {
    backgroundColor:'#BDC2C4',
    width: 150,
    height: 75,
    borderRadius: 5,
    borderColor: 'black',
    justifyContent: 'center',
    alignSelf: 'center',
    left: 20
  },
  unBTMText: {
    fontFamily: 'pkmndp',
    fontSize: 30,
    textAlign: 'center',
    color: 'black',
  },
  unNoteBox: {
    backgroundColor:'#BDC2C4',
    width: 350,
    height: 175,
    borderRadius: 5,
    borderColor: 'black',
    justifyContent: 'center',
    alignSelf: 'center',
    bottom: 100
  },
  unNoteText: {
    fontFamily: 'pkmndp',
    fontSize: 30,
    textAlign: 'center',
    color: 'black',
  },
})

const leaderboard = StyleSheet.create({
  entryBox: {
    backgroundColor:'#BDC2C4',
    width: 350,
    height: 100,
    borderRadius: 5,
    borderColor: 'black',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 25
  },
  entryText: {
    fontFamily: 'pkmndp',
    fontSize: 30,
    textAlign: 'center',
    color: 'black',
  },
  noUsersBox: {
    backgroundColor:'#BDC2C4',
    width: 200,
    height: 125,
    borderRadius: 5,
    borderColor: 'black',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  noUsersText: {
    fontFamily: 'pkmndp',
    fontSize: 30,
    textAlign: 'center',
    color: 'black',
  },
})

export default App;
