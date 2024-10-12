import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Image,
  ImageBackground,
} from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import axios from 'axios';

// Define the drawer navigator
const Drawer = createDrawerNavigator();

function HomeScreen() {
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  const songs = [
    {
      title: 'Unnai Naan',
      uri: require('./assets/unnai naan.mp3'),
    },
    {
      title: 'Yellow',
      uri: require('./assets/Yellow.mp3'),
    },
    {
      title: 'Mundhinam',
      uri: require('./assets/mundhinam.mp3'),
    },
  ];

  useEffect(() => {
    // Load dark mode preference from AsyncStorage on app start
    AsyncStorage.getItem('darkMode').then((value) => {
      if (value !== null) {
        setIsDarkMode(value === 'true');
      }
    });
    loadSound();
  }, [currentSongIndex]);

  // Create and load the audio sound object
  const loadSound = async () => {
    try {
      if (sound) {
        await sound.unloadAsync(); // Stop and unload previous sound
      }
      const { sound: newSound } = await Audio.Sound.createAsync(songs[currentSongIndex].uri);
      setSound(newSound);
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  };

  const togglePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNextSong = () => {
    if (currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
    } else {
      setCurrentSongIndex(0);
    }
  };

  // Update dark mode preference in AsyncStorage
  const toggleDarkMode = (value) => {
    setIsDarkMode(value);
    AsyncStorage.setItem('darkMode', value.toString());
  };

  return (
    <View style={isDarkMode ? styles.containerDark : styles.containerLight}>
      <ImageBackground source={require('./assets/background.jpg')} style={styles.backgroundImage}>
        <View style={styles.topBar}>
          <Image source={require('./assets/logo.png')} style={styles.logo} />
          <Text style={isDarkMode ? styles.titleDark : styles.titleLight}>Music Player</Text>
          <Switch
            value={isDarkMode}
            onValueChange={(value) => toggleDarkMode(value)}
            thumbColor="#fff"
          />
        </View>
        <TouchableOpacity onPress={togglePlayPause}>
          <AntDesign name={isPlaying ? 'pausecircle' : 'playcircle'} size={50} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={playNextSong}>
          <Text style={isDarkMode ? styles.songTitleDark : styles.songTitleLight}>
            Next: {songs[(currentSongIndex + 1) % songs.length].title}
          </Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}

function PlaylistScreen() {
  const apiUrl = 'https://api.spotify.com/v1/me/playlists';
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const accessToken = 'your_access_token'; // Replace with the user's access token
        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setPlaylists(response.data.items);
      } catch (error) {
        console.error('Error fetching playlists:', error);
      }
    };
    fetchPlaylists();
  }, []);

  return (
    <View style={styles.containerLight}>
      <Text style={styles.titleLight}>Playlists</Text>
      {playlists.map((playlist, index) => (
        <Text key={index}>{playlist.name}</Text>
      ))}
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Playlists" component={PlaylistScreen} />
        {/* Add more screens as needed */}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  containerLight: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#121212',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 20,
  },
  logo: {
    width: 50,
    height: 50,
  },
  titleLight: {
    fontSize: 24,
    color: '#000',
  },
  titleDark: {
    fontSize: 24,
    color: '#fff',
  },
  songTitleLight: {
    fontSize: 18,
    color: '#000',
  },
  songTitleDark: {
    fontSize: 18,
    color: '#fff',
  },
});
