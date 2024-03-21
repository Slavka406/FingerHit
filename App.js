import React from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width, height} = Dimensions.get('window');

const App = () => {
  const [count, setCount] = React.useState(0);
  const [timer, setTimer] = React.useState(10000);
  const [timeToStart, setTimeToStart] = React.useState(3);
  const [isGameStarted, setIsGameStarted] = React.useState(false);
  const [highScore, setHighScore] = React.useState(0);
  const [isNewRecord, setIsNewRecord] = React.useState(false);

  React.useEffect(() => {
    const getHighScore = async () => {
      try {
        const _highScore = await AsyncStorage.getItem('highScore');
        if (_highScore !== null) {
          setHighScore(_highScore);
        }
      } catch (e) {
        console.log(e);
      }
    };
    getHighScore();
  }, [isGameStarted]);

  const handlePress = () => {
    if (isGameStarted && timer > 0 && timeToStart === 0) {
      setCount(count + 1);
    }
  };

  const startGame = () => {
    if (!isGameStarted) {
      setIsGameStarted(true);
      setTimer(10000);
      setTimeToStart(3);
      setCount(0);
      setIsNewRecord(false);
    }
  };

  React.useEffect(() => {
    if (isGameStarted && timeToStart > 0) {
      const interval = setInterval(() => {
        setTimeToStart(timeToStart - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isGameStarted, timeToStart]);

  React.useEffect(() => {
    const checkHighScore = async () => {
      try {
        const _highScore = await AsyncStorage.getItem('highScore');
        if (_highScore === null) {
          await AsyncStorage.setItem('highScore', count.toString());
        } else if (count > +_highScore) {
          await AsyncStorage.setItem('highScore', count.toString());
          setIsNewRecord(true);
        }
      } catch (e) {
        console.log(e);
      }
    };
    if (isGameStarted && timeToStart === 0 && timer > 0) {
      const interval = setInterval(() => {
        setTimer(timer - 10);
      }, 1);

      return () => clearInterval(interval);
    }

    if (timer === 0) {
      setIsGameStarted(false);
      checkHighScore();
    }
  }, [isGameStarted, timer, timeToStart, count]);

  const formatTime = time => {
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);

    const formattedSeconds = String(seconds).padStart(2, '0');
    const formattedMilliseconds = String(milliseconds).padStart(2, '0');

    return `${formattedSeconds}:${formattedMilliseconds}`;
  };

  const timerText = isNewRecord
    ? '🎉🎉🎉\nNew Record!'
    : timeToStart === 0
    ? formatTime(timer)
    : isGameStarted && timeToStart;

  return (
    <View style={styles.wrapper}>
      <Image
        source={require('./assets/background.jpg')}
        style={{width, height}}
      />
      <View style={styles.highScoreContainer}>
        <Text style={styles.highScore}>High Score: {highScore}</Text>
      </View>
      <View style={[styles.timerContainer, isNewRecord && styles.newRecord]}>
        <Text
          style={[
            styles.timer,
            timeToStart !== 0 && styles.timeToStart,
            isNewRecord && styles.newRecord,
          ]}>
          {timerText}
        </Text>
      </View>
      <Pressable
        style={styles.container}
        onPress={handlePress}
        onLongPress={startGame}>
        <Text style={styles.text}>{count}</Text>
      </Pressable>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highScoreContainer: {position: 'absolute', top: 80, right: 20},
  highScore: {color: 'white'},
  container: {
    position: 'absolute',
    backgroundColor: 'white',
    width: '60%',
    height: width * 0.6,
    borderRadius: (width * 0.6) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  timerContainer: {
    position: 'absolute',
    paddingBottom: width * 0.6 + 120,
    width: 96,
  },
  timer: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  timeToStart: {textAlign: 'center'},
  newRecord: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
});
