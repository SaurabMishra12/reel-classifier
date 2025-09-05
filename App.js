import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, SafeAreaView, StatusBar, Modal, Alert } from 'react-native';
import { useShareIntent } from 'expo-share-intent';
import { classifyText, saveApiKey, getApiKey, hasApiKey } from './geminiApi';

export default function App() {
  // State variables
  const [sharedUrl, setSharedUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('');
  const [isClassifying, setIsClassifying] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [isApiKeySet, setIsApiKeySet] = useState(false);

  // Initialize share intent hook
  const { data, disabled } = useShareIntent();

  // Check if API key is set on app load
  useEffect(() => {
    checkApiKey();
  }, []);

  // Handle shared data when it changes
  useEffect(() => {
    if (data && data.text) {
      setSharedUrl(data.text);
    }
  }, [data]);
  
  // Check if API key is already stored
  const checkApiKey = async () => {
    const hasKey = await hasApiKey();
    setIsApiKeySet(hasKey);
    
    if (!hasKey) {
      // Show API key modal if no key is set
      setShowApiKeyModal(true);
    } else {
      // Load the API key for display (masked)
      const key = await getApiKey();
      if (key) {
        // Mask the API key for display
        setApiKey(maskApiKey(key));
      }
    }
  };
  
  // Mask API key for display
  const maskApiKey = (key) => {
    if (!key || key.length < 8) return '';
    return key.substring(0, 4) + '...' + key.substring(key.length - 4);
  };
  
  // Save API key
  const handleSaveApiKey = async () => {
    if (!apiKey || apiKey.length < 10) {
      Alert.alert('Invalid API Key', 'Please enter a valid Gemini API key');
      return;
    }
    
    try {
      await saveApiKey(apiKey);
      setIsApiKeySet(true);
      setShowApiKeyModal(false);
      Alert.alert('Success', 'API key saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key: ' + error.message);
    }
  };
  
  // Change API key
  const handleChangeApiKey = () => {
    setApiKey('');
    setShowApiKeyModal(true);
  };

  // Function to handle classification
  const handleClassify = async () => {
    if (!caption && !sharedUrl) {
      setError('Please enter a caption or share a reel first');
      return;
    }

    try {
      setIsClassifying(true);
      setError('');
      setCategory('');
      
      // Use caption if provided, otherwise use the shared URL
      const textToClassify = caption || sharedUrl;
      
      // Call the Gemini API to classify the text
      const result = await classifyText(textToClassify);
      
      // Update the category state with the result
      setCategory(result);
    } catch (error) {
      setError(error.message || 'Failed to classify. Please try again.');
    } finally {
      setIsClassifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Reel Classifier</Text>
          <Text style={styles.subtitle}>Classify Instagram Reels</Text>
        </View>

        {/* Shared URL display */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shared URL</Text>
          {sharedUrl ? (
            <View style={styles.urlContainer}>
              <Text style={styles.url} numberOfLines={3}>{sharedUrl}</Text>
            </View>
          ) : (
            <Text style={styles.placeholder}>
              Share a reel from Instagram to classify it.
            </Text>
          )}
        </View>

        {/* Caption input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Caption</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter or edit reel caption here"
            value={caption}
            onChangeText={setCaption}
            multiline
          />
        </View>

        {/* Classification button */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleClassify}
          disabled={isClassifying}
        >
          {isClassifying ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Classify Reel</Text>
          )}
        </TouchableOpacity>

        {/* Error message */}
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        {/* Classification result */}
        {category ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Category:</Text>
            <Text style={styles.resultValue}>{category}</Text>
          </View>
        ) : null}
        
        {/* API Key Settings Button */}
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={handleChangeApiKey}
        >
          <Text style={styles.settingsButtonText}>
            {isApiKeySet ? 'Change API Key' : 'Set API Key'}
          </Text>
        </TouchableOpacity>
        
        {/* API Key Modal */}
        <Modal
          visible={showApiKeyModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            if (!isApiKeySet) {
              Alert.alert('API Key Required', 'You must set a Gemini API key to use this app');
            } else {
              setShowApiKeyModal(false);
            }
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Gemini API Key</Text>
              <Text style={styles.modalSubtitle}>
                Enter your Gemini API key to use the classification feature.
                The app will try Gemini 2.5 Pro first and fall back to Gemini 2.0 if needed.
              </Text>
              
              <TextInput
                style={styles.apiKeyInput}
                placeholder="Enter your Gemini API key"
                value={apiKey}
                onChangeText={setApiKey}
                secureTextEntry={isApiKeySet}
              />
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveApiKey}
              >
                <Text style={styles.saveButtonText}>Save API Key</Text>
              </TouchableOpacity>
              
              {isApiKeySet && (
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowApiKeyModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  urlContainer: {
    backgroundColor: '#e8e8e8',
    padding: 12,
    borderRadius: 8,
  },
  url: {
    color: '#0066cc',
  },
  placeholder: {
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
    padding: 15,
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#4a86e8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  error: {
    color: '#d32f2f',
    textAlign: 'center',
    marginVertical: 10,
  },
  resultContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a86e8',
  },
  // API Key Settings styles
  settingsButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  settingsButtonText: {
    color: '#555',
    fontWeight: '500',
    fontSize: 14,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  apiKeyInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    marginBottom: 20,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4a86e8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 16,
  },
});