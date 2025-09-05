import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, 
  ScrollView, SafeAreaView, StatusBar, Modal, Alert, FlatList, Switch,
  Linking, Clipboard
} from 'react-native';
import { useShareIntent } from 'expo-share-intent';
import { classifyText, classifyTextWithSuggestions, saveApiKey, getApiKey, hasApiKey } from './geminiApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const REELS_STORAGE_KEY = '@saved_reels';
const CATEGORIES_STORAGE_KEY = '@custom_categories';
const SETTINGS_STORAGE_KEY = '@app_settings';

// Default categories
const DEFAULT_CATEGORIES = [
  'Motivational', 'Gym', 'AI/ML', 'Entertainment', 'Communication', 
  'Ideas', 'Coding', 'UI/UX', 'Job', 'Internships', 'Love', 
  'Poetry', 'Songs', 'News', 'Sports', 'Food', 'Travel', 'Fashion'
];

export default function App() {
  // Basic state
  const [sharedUrl, setSharedUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('');
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  
  // Enhanced features state
  const [currentView, setCurrentView] = useState('home'); // 'home', 'library', 'settings'
  const [savedReels, setSavedReels] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredReels, setFilteredReels] = useState([]);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [autoSave, setAutoSave] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Category suggestions state
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [primarySuggestion, setPrimarySuggestion] = useState('');
  const [pendingReelData, setPendingReelData] = useState(null);

  // Initialize share intent hook
  const { data, disabled } = useShareIntent();

  // Load data on app start
  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle shared data when it changes
  useEffect(() => {
    if (data && data.text) {
      handleSharedContent(data.text);
    }
  }, [data, autoSave]);

  // Filter reels based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = savedReels.filter(reel => 
        reel.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reel.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredReels(filtered);
    } else if (selectedCategory) {
      filterReelsByCategory(selectedCategory);
    } else {
      setFilteredReels(savedReels);
    }
  }, [searchQuery, savedReels, selectedCategory]);

  // Load initial data
  const loadInitialData = async () => {
    await checkApiKey();
    await loadSavedReels();
    await loadCustomCategories();
    await loadSettings();
  };

  // Check if API key is set
  const checkApiKey = async () => {
    try {
      const keyExists = await hasApiKey();
      setIsApiKeySet(keyExists);
      if (!keyExists) {
        setShowApiKeyModal(true);
      }
    } catch (error) {
      console.error('Error checking API key:', error);
    }
  };

  // Load saved reels from storage
  const loadSavedReels = async () => {
    try {
      const stored = await AsyncStorage.getItem(REELS_STORAGE_KEY);
      if (stored) {
        const reels = JSON.parse(stored);
        setSavedReels(reels);
        setFilteredReels(reels);
      }
    } catch (error) {
      console.error('Error loading reels:', error);
    }
  };

  // Load custom categories from storage
  const loadCustomCategories = async () => {
    try {
      const stored = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (stored) {
        setCustomCategories(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Load app settings
  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        setAutoSave(settings.autoSave ?? true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Save app settings
  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Get all available categories
  const getAllCategories = () => {
    return [...DEFAULT_CATEGORIES, ...customCategories].sort();
  };

  // Handle shared content from Instagram
  const handleSharedContent = async (content) => {
    // Extract Instagram URL if present
    const instagramMatch = content.match(/https?:\/\/(?:www\.)?instagram\.com\/reel\/[A-Za-z0-9_-]+\/?/);
    const finalUrl = instagramMatch ? instagramMatch[0] : content;
    
    // Start the category selection workflow
    handleReelShare(finalUrl);
  };

  // Handle reel sharing workflow
  const handleReelShare = async (url) => {
    setCurrentView('home');
    
    // Store the shared reel data
    setPendingReelData({
      url: url,
      caption: url.includes('instagram.com') ? 'Shared Instagram reel' : url,
      timestamp: new Date().toISOString()
    });

    // Get AI suggestions if API key is available
    if (isApiKeySet) {
      try {
        setIsClassifying(true);
        const captionText = url.includes('instagram.com') ? 
          'Shared Instagram reel content' : url;
        
        const result = await classifyTextWithSuggestions(captionText, customCategories);
        setPrimarySuggestion(result.primary);
        setCategorySuggestions(result.suggestions);
      } catch (error) {
        console.error('AI suggestion failed:', error);
        setPrimarySuggestion('');
        setCategorySuggestions([]);
      } finally {
        setIsClassifying(false);
      }
    }

    // Show category selection modal
    setShowCategorySuggestions(true);
  };

  // Auto classify and show suggestions
  const handleAutoClassifyAndSave = async (url) => {
    if (!isApiKeySet) {
      Alert.alert('Setup Required', 'Please set up your Gemini API key first.');
      setShowApiKeyModal(true);
      return;
    }

    try {
      setIsClassifying(true);
      setError('');
      
      // Extract caption from URL or use the URL itself
      const captionText = url.includes('instagram.com') ? 
        'Shared Instagram reel content' : url;
      
      // Get category suggestions from AI
      const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];
      const result = await classifyTextWithSuggestions(captionText, customCategories);
      
      // Store the reel data temporarily
      setPendingReelData({
        url: url,
        caption: captionText,
        timestamp: new Date().toISOString()
      });
      
      // Show category suggestions to user
      setPrimarySuggestion(result.primary);
      setCategorySuggestions(result.suggestions);
      setShowCategorySuggestions(true);
      
    } catch (error) {
      setError(error.message);
      // Fall back to manual categorization
      setCaption(url);
      Alert.alert(
        'Manual Classification Needed',
        'Auto-classification failed. Please classify manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsClassifying(false);
    }
  };

  // Manual classify text
  const handleClassify = async () => {
    if (!caption.trim()) {
      setError('Please enter some text to classify');
      return;
    }

    if (!isApiKeySet) {
      setShowApiKeyModal(true);
      return;
    }

    try {
      setIsClassifying(true);
      setError('');
      const result = await classifyText(caption);
      setCategory(result);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsClassifying(false);
    }
  };

  // Save reel to storage
  const saveReel = async (url, text, cat) => {
    try {
      setIsSaving(true);
      
      const newReel = {
        id: Date.now().toString(),
        url: url || sharedUrl,
        caption: text || caption,
        category: cat || category,
        timestamp: new Date().toISOString(),
        dateAdded: new Date().toLocaleDateString()
      };

      const updatedReels = [newReel, ...savedReels];
      await AsyncStorage.setItem(REELS_STORAGE_KEY, JSON.stringify(updatedReels));
      
      setSavedReels(updatedReels);
      setFilteredReels(updatedReels);
      
      // Clear inputs
      setSharedUrl('');
      setCaption('');
      setCategory('');
      
      if (!autoSave) {
        Alert.alert('Success', 'Reel saved successfully!');
      }
      
    } catch (error) {
      Alert.alert('Error', 'Failed to save reel: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Save reel with user-selected category from suggestions
  const saveReelWithSelectedCategory = async (selectedCategory) => {
    // First prompt for additional notes
    Alert.prompt(
      'Add Notes (Optional)',
      'Any additional details about this reel?',
      [
        { text: 'Skip', onPress: () => saveReelToStorage(selectedCategory, '') },
        { 
          text: 'Save', 
          onPress: (notes) => saveReelToStorage(selectedCategory, notes || '')
        }
      ],
      'plain-text',
      '',
      'default'
    );
  };

  // Save reel with new category (creates category and saves reel)
  const saveReelWithNewCategory = async (newCategory) => {
    // First prompt for additional notes
    Alert.prompt(
      'Add Notes (Optional)',
      'Any additional details about this reel?',
      [
        { text: 'Skip', onPress: () => saveReelToStorageWithNewCategory(newCategory, '') },
        { 
          text: 'Save', 
          onPress: (notes) => saveReelToStorageWithNewCategory(newCategory, notes || '')
        }
      ],
      'plain-text',
      '',
      'default'
    );
  };

  // Actually save reel to storage
  const saveReelToStorage = async (selectedCategory, notes) => {
    try {
      setIsSaving(true);
      
      const newReel = {
        id: Date.now().toString(),
        url: pendingReelData.url,
        caption: pendingReelData.caption,
        category: selectedCategory,
        notes: notes,
        timestamp: pendingReelData.timestamp,
        dateAdded: new Date().toLocaleDateString(),
        timeAdded: new Date().toLocaleTimeString()
      };

      const updatedReels = [newReel, ...savedReels];
      await AsyncStorage.setItem(REELS_STORAGE_KEY, JSON.stringify(updatedReels));
      
      setSavedReels(updatedReels);
      setFilteredReels(updatedReels);
      
      // Clear pending data and close modal
      setPendingReelData(null);
      setShowCategorySuggestions(false);
      setPrimarySuggestion('');
      setCategorySuggestions([]);
      
      Alert.alert(
        'Reel Saved! 🎉', 
        `Your reel has been saved to "${selectedCategory}"${notes ? ' with your notes' : ''}.`,
        [
          { text: 'OK' }, 
          { text: 'View Library', onPress: () => setCurrentView('library') }
        ]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Failed to save reel: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Save reel with new category and notes
  const saveReelToStorageWithNewCategory = async (newCategory, notes) => {
    try {
      setIsSaving(true);
      
      // Add the new category to custom categories if it doesn't exist
      const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];
      if (!allCategories.includes(newCategory)) {
        const updatedCustomCategories = [...customCategories, newCategory];
        setCustomCategories(updatedCustomCategories);
        await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updatedCustomCategories));
      }
      
      // Save the reel with the new category
      const newReel = {
        id: Date.now().toString(),
        url: pendingReelData.url,
        caption: pendingReelData.caption,
        category: newCategory,
        notes: notes,
        timestamp: pendingReelData.timestamp,
        dateAdded: new Date().toLocaleDateString(),
        timeAdded: new Date().toLocaleTimeString()
      };

      const updatedReels = [newReel, ...savedReels];
      await AsyncStorage.setItem(REELS_STORAGE_KEY, JSON.stringify(updatedReels));
      
      setSavedReels(updatedReels);
      setFilteredReels(updatedReels);
      
      // Clear inputs and close modal
      setPendingReelData(null);
      setShowCategorySuggestions(false);
      setPrimarySuggestion('');
      setCategorySuggestions([]);
      setNewCategoryName('');
      
      Alert.alert(
        'Category Created & Reel Saved! 🎉', 
        `New category "${newCategory}" created and your reel has been saved${notes ? ' with your notes' : ''}.`,
        [
          { text: 'OK' }, 
          { text: 'View Library', onPress: () => setCurrentView('library') }
        ]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Failed to save reel: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter reels by category
  const filterReelsByCategory = (cat) => {
    if (!cat || cat === 'All') {
      setFilteredReels(savedReels);
      setSelectedCategory('');
    } else {
      const filtered = savedReels.filter(reel => reel.category === cat);
      setFilteredReels(filtered);
      setSelectedCategory(cat);
    }
    setSearchQuery('');
  };

  // Add custom category
  const addCustomCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    const allCategories = getAllCategories();
    if (allCategories.includes(newCategoryName)) {
      Alert.alert('Error', 'Category already exists');
      return;
    }

    const updated = [...customCategories, newCategoryName.trim()];
    await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
    setCustomCategories(updated);
    setNewCategoryName('');
    setShowAddCategory(false);
    Alert.alert('Success', `Category "${newCategoryName}" added successfully!`);
  };

  // Remove custom category
  const removeCustomCategory = async (categoryToRemove) => {
    Alert.alert(
      'Remove Category',
      `Are you sure you want to remove "${categoryToRemove}"? Reels in this category will not be deleted.`,
      [
        { text: 'Cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updated = customCategories.filter(cat => cat !== categoryToRemove);
            await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
            setCustomCategories(updated);
          }
        }
      ]
    );
  };

  // Save API key
  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter a valid API key');
      return;
    }

    try {
      await saveApiKey(apiKey);
      setIsApiKeySet(true);
      setShowApiKeyModal(false);
      setApiKey('');
      Alert.alert('Success', 'API key saved successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Delete reel
  const deleteReel = async (reelId) => {
    Alert.alert(
      'Delete Reel',
      'Are you sure you want to delete this reel?',
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = savedReels.filter(reel => reel.id !== reelId);
            await AsyncStorage.setItem(REELS_STORAGE_KEY, JSON.stringify(updated));
            setSavedReels(updated);
            filterReelsByCategory(selectedCategory);
          }
        }
      ]
    );
  };

  // Toggle auto-save setting
  const toggleAutoSave = async (value) => {
    setAutoSave(value);
    await saveSettings({ autoSave: value });
  };

  // Render navigation tabs
  const renderNavigationTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tab, currentView === 'home' && styles.activeTab]}
        onPress={() => setCurrentView('home')}
      >
        <Text style={[styles.tabText, currentView === 'home' && styles.activeTabText]}>
          🏠 Home
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, currentView === 'library' && styles.activeTab]}
        onPress={() => setCurrentView('library')}
      >
        <Text style={[styles.tabText, currentView === 'library' && styles.activeTabText]}>
          📚 Library ({savedReels.length})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, currentView === 'settings' && styles.activeTab]}
        onPress={() => setCurrentView('settings')}
      >
        <Text style={[styles.tabText, currentView === 'settings' && styles.activeTabText]}>
          ⚙️ Settings
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render home view
  const renderHomeView = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Instagram Reel Classifier</Text>
      
      {/* Share Instructions */}
      <View style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>📱 How to use:</Text>
        <Text style={styles.instructionText}>
          1. Share any Instagram reel to this app{'\n'}
          2. Reels will be {autoSave ? 'automatically' : 'manually'} categorized{'\n'}
          3. Browse your saved reels in the Library tab
        </Text>
      </View>

      {/* Shared URL Display */}
      {sharedUrl ? (
        <View style={styles.sharedUrlContainer}>
          <Text style={styles.sectionTitle}>Shared Content:</Text>
          <Text style={styles.sharedUrl}>{sharedUrl}</Text>
        </View>
      ) : null}

      {/* Manual Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.sectionTitle}>Manual Classification:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter reel caption or paste URL here..."
          value={caption}
          onChangeText={setCaption}
          multiline
          numberOfLines={4}
        />
        
        <TouchableOpacity 
          style={[styles.button, isClassifying && styles.buttonDisabled]}
          onPress={handleClassify}
          disabled={isClassifying}
        >
          {isClassifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>🔍 Classify</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Classification Result */}
      {category ? (
        <View style={styles.resultContainer}>
          <Text style={styles.sectionTitle}>Category: {category}</Text>
          <TouchableOpacity 
            style={[styles.button, styles.saveButton, isSaving && styles.buttonDisabled]}
            onPress={() => saveReel()}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>💾 Save Reel</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Error Display */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      ) : null}
    </ScrollView>
  );

  // Render category filter
  const renderCategoryFilter = () => {
    const categories = ['All', ...getAllCategories()];
    
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              (selectedCategory === cat || (cat === 'All' && !selectedCategory)) && styles.selectedCategoryChip
            ]}
            onPress={() => filterReelsByCategory(cat)}
          >
            <Text style={[
              styles.categoryChipText,
              (selectedCategory === cat || (cat === 'All' && !selectedCategory)) && styles.selectedCategoryChipText
            ]}>
              {cat} {cat !== 'All' ? `(${savedReels.filter(r => r.category === cat).length})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // Render reel item with playlist-like design
  const renderReelItem = ({ item }) => {
    const openReel = () => {
      Alert.alert(
        '🎬 Open Reel',
        'Choose how to view this reel:',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: '🔗 Open Link', 
            onPress: () => {
              // Open the Instagram URL
              Linking.openURL(item.url).catch(err => 
                Alert.alert('Error', 'Could not open link')
              );
            }
          },
          {
            text: '📋 Copy Link',
            onPress: () => {
              Clipboard.setString(item.url);
              Alert.alert('Copied!', 'Reel link copied to clipboard');
            }
          }
        ]
      );
    };

    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    };

    return (
      <TouchableOpacity 
        style={styles.playlistItem} 
        onPress={openReel}
        activeOpacity={0.7}
      >
        <View style={styles.playlistItemLeft}>
          {/* Thumbnail placeholder */}
          <View style={styles.reelThumbnail}>
            <Text style={styles.thumbnailIcon}>🎬</Text>
          </View>
          
          <View style={styles.reelInfo}>
            <Text style={styles.reelTitle} numberOfLines={2}>
              {item.caption.length > 50 ? 
                item.caption.substring(0, 50) + '...' : 
                item.caption
              }
            </Text>
            
            {item.notes && (
              <Text style={styles.reelNotes} numberOfLines={1}>
                💭 {item.notes}
              </Text>
            )}
            
            <View style={styles.reelMeta}>
              <Text style={styles.reelCategory}>📁 {item.category}</Text>
              <Text style={styles.reelTime}>⏰ {formatTime(item.timestamp)}</Text>
            </View>
            
            <Text style={styles.reelUrlPreview} numberOfLines={1}>
              🔗 {item.url}
            </Text>
          </View>
        </View>
        
        <View style={styles.playlistItemRight}>
          <TouchableOpacity 
            style={styles.playButton}
            onPress={openReel}
          >
            <Text style={styles.playButtonIcon}>▶️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                'Delete Reel',
                'Are you sure you want to remove this reel from your library?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteReel(item.id) }
                ]
              );
            }}
          >
            <Text style={styles.deleteButtonIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Render library view
  const renderLibraryView = () => (
    <View style={styles.container}>
      <Text style={styles.title}>📚 Your Reel Library</Text>
      
      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Search reels..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      {/* Category Filter */}
      {renderCategoryFilter()}
      
      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Showing {filteredReels.length} of {savedReels.length} reels
          {selectedCategory ? ` in "${selectedCategory}"` : ''}
        </Text>
      </View>
      
      {/* Reels List */}
      {filteredReels.length > 0 ? (
        <FlatList
          data={filteredReels}
          renderItem={renderReelItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {savedReels.length === 0 
              ? '🎬 No reels saved yet.\nShare some Instagram reels to get started!' 
              : '🔍 No reels found for current filter.'
            }
          </Text>
        </View>
      )}
    </View>
  );

  // Render settings view
  const renderSettingsView = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>⚙️ Settings</Text>
      
      {/* Auto-save Setting */}
      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Text style={styles.settingTitle}>🤖 Auto-save Shared Reels</Text>
          <Text style={styles.settingDescription}>
            Automatically classify and save reels when shared from Instagram
          </Text>
        </View>
        <Switch
          value={autoSave}
          onValueChange={toggleAutoSave}
        />
      </View>

      {/* API Key Setting */}
      <View style={styles.settingItem}>
        <TouchableOpacity 
          style={styles.settingButton}
          onPress={() => setShowApiKeyModal(true)}
        >
          <Text style={styles.settingTitle}>🔑 Gemini API Key</Text>
          <Text style={styles.settingDescription}>
            {isApiKeySet ? 'API key is configured' : 'Set up your Gemini API key'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories Management */}
      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>📂 Manage Categories</Text>
        
        <TouchableOpacity 
          style={styles.addCategoryButton}
          onPress={() => setShowAddCategory(true)}
        >
          <Text style={styles.addCategoryButtonText}>➕ Add Custom Category</Text>
        </TouchableOpacity>

        <Text style={styles.subsectionTitle}>Default Categories:</Text>
        <View style={styles.categoriesGrid}>
          {DEFAULT_CATEGORIES.map((cat) => (
            <View key={cat} style={styles.defaultCategoryChip}>
              <Text style={styles.defaultCategoryText}>{cat}</Text>
            </View>
          ))}
        </View>

        {customCategories.length > 0 && (
          <>
            <Text style={styles.subsectionTitle}>Custom Categories:</Text>
            <View style={styles.categoriesGrid}>
              {customCategories.map((cat) => (
                <View key={cat} style={styles.customCategoryChip}>
                  <Text style={styles.customCategoryText}>{cat}</Text>
                  <TouchableOpacity onPress={() => removeCustomCategory(cat)}>
                    <Text style={styles.removeCategoryText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}
      </View>

      {/* App Info */}
      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>ℹ️ App Information</Text>
        <Text style={styles.infoText}>
          Version: 1.0.0{'\n'}
          Total Reels Saved: {savedReels.length}{'\n'}
          Custom Categories: {customCategories.length}
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Navigation Tabs */}
      {renderNavigationTabs()}
      
      {/* Main Content */}
      {currentView === 'home' && renderHomeView()}
      {currentView === 'library' && renderLibraryView()}
      {currentView === 'settings' && renderSettingsView()}

      {/* API Key Modal */}
      <Modal visible={showApiKeyModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>🔑 Set up Gemini API Key</Text>
            <Text style={styles.modalDescription}>
              To classify reels automatically, you need a Gemini API key.{'\n'}
              Get one free at: ai.google.dev
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your Gemini API key..."
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowApiKeyModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalSaveButton}
                onPress={handleSaveApiKey}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Category Modal */}
      <Modal visible={showAddCategory} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>➕ Add Custom Category</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Enter category name..."
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowAddCategory(false);
                  setNewCategoryName('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalSaveButton}
                onPress={addCustomCategory}
              >
                <Text style={styles.modalSaveText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Selection Modal */}
      <Modal visible={showCategorySuggestions} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.categoryModalContainer]}>
            <Text style={styles.modalTitle}>📁 Choose Category</Text>
            <Text style={styles.modalDescription}>
              Save your reel to a category (like adding to a playlist):
            </Text>
            
            <ScrollView style={styles.categoryScrollView} showsVerticalScrollIndicator={false}>
              {/* AI Suggestions Section */}
              {(primarySuggestion || categorySuggestions.length > 0) && (
                <View style={styles.aiSuggestionsSection}>
                  <Text style={styles.sectionTitle}>🤖 AI Suggestions:</Text>
                  
                  {primarySuggestion && (
                    <TouchableOpacity 
                      style={[styles.categoryOption, styles.primarySuggestionOption]}
                      onPress={() => saveReelWithSelectedCategory(primarySuggestion)}
                      disabled={isSaving}
                    >
                      <Text style={styles.categoryOptionIcon}>✨</Text>
                      <Text style={[styles.categoryOptionText, styles.primarySuggestionText]}>
                        {primarySuggestion}
                      </Text>
                      <Text style={styles.recommendedBadge}>Recommended</Text>
                    </TouchableOpacity>
                  )}
                  
                  {categorySuggestions.map((suggestion, index) => (
                    <TouchableOpacity 
                      key={`ai-${index}`}
                      style={[styles.categoryOption, styles.aiSuggestionOption]}
                      onPress={() => saveReelWithSelectedCategory(suggestion)}
                      disabled={isSaving}
                    >
                      <Text style={styles.categoryOptionIcon}>🔮</Text>
                      <Text style={styles.categoryOptionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {/* Default Categories Section */}
              <View style={styles.defaultCategoriesSection}>
                <Text style={styles.sectionTitle}>📋 Default Categories:</Text>
                {DEFAULT_CATEGORIES.map((category, index) => (
                  <TouchableOpacity 
                    key={`default-${index}`}
                    style={styles.categoryOption}
                    onPress={() => saveReelWithSelectedCategory(category)}
                    disabled={isSaving}
                  >
                    <Text style={styles.categoryOptionIcon}>📂</Text>
                    <Text style={styles.categoryOptionText}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Custom Categories Section */}
              {customCategories.length > 0 && (
                <View style={styles.customCategoriesSection}>
                  <Text style={styles.sectionTitle}>🎨 Your Categories:</Text>
                  {customCategories.map((category, index) => (
                    <TouchableOpacity 
                      key={`custom-${index}`}
                      style={[styles.categoryOption, styles.customCategoryOption]}
                      onPress={() => saveReelWithSelectedCategory(category)}
                      disabled={isSaving}
                    >
                      <Text style={styles.categoryOptionIcon}>⭐</Text>
                      <Text style={styles.categoryOptionText}>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {/* Add New Category Section */}
              <View style={styles.addCategorySection}>
                <Text style={styles.sectionTitle}>➕ Create New:</Text>
                <View style={styles.newCategoryInputContainer}>
                  <TextInput
                    style={styles.newCategoryInput}
                    placeholder="Enter new category name..."
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    onSubmitEditing={() => {
                      if (newCategoryName.trim()) {
                        saveReelWithNewCategory(newCategoryName.trim());
                      }
                    }}
                  />
                  <TouchableOpacity 
                    style={[styles.addCategoryButton, !newCategoryName.trim() && styles.addCategoryButtonDisabled]}
                    onPress={() => {
                      if (newCategoryName.trim()) {
                        saveReelWithNewCategory(newCategoryName.trim());
                      }
                    }}
                    disabled={!newCategoryName.trim() || isSaving}
                  >
                    <Text style={styles.addCategoryButtonText}>Add & Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowCategorySuggestions(false);
                  setPendingReelData(null);
                  setPrimarySuggestion('');
                  setCategorySuggestions([]);
                  setNewCategoryName('');
                }}
                disabled={isSaving}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            
            {isSaving && (
              <View style={styles.savingIndicator}>
                <Text style={styles.savingText}>💾 Saving reel...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Navigation Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: '600',
  },
  
  // Common Styles
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 10,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
    marginTop: 15,
    marginBottom: 10,
  },
  
  // Home View Styles
  instructionCard: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  sharedUrlContainer: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  sharedUrl: {
    fontSize: 14,
    color: '#2e7d32',
    fontFamily: 'monospace',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  resultContainer: {
    backgroundColor: '#d4edda',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
  },
  
  // Library View Styles
  searchInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  categoryFilter: {
    marginBottom: 15,
  },
  categoryChip: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#007bff',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  selectedCategoryChipText: {
    color: '#fff',
  },
  statsContainer: {
    marginBottom: 15,
  },
  statsText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  
  // Playlist-style Reel Item Styles
  playlistItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  playlistItemLeft: {
    flex: 1,
    flexDirection: 'row',
  },
  reelThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  thumbnailIcon: {
    fontSize: 24,
  },
  reelInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  reelTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    lineHeight: 18,
    marginBottom: 4,
  },
  reelNotes: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  reelMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reelCategory: {
    fontSize: 11,
    color: '#007bff',
    fontWeight: '500',
  },
  reelTime: {
    fontSize: 11,
    color: '#6c757d',
  },
  reelUrlPreview: {
    fontSize: 10,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  playlistItemRight: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 8,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  playButtonIcon: {
    fontSize: 16,
    color: '#fff',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonIcon: {
    fontSize: 12,
  },
  
  // Legacy styles for compatibility
  reelItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  reelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reelDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  reelCaption: {
    fontSize: 14,
    color: '#212529',
    marginBottom: 8,
    lineHeight: 20,
  },
  reelUrl: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  reelActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#dc3545',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Settings View Styles
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  settingLeft: {
    flex: 1,
  },
  settingButton: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  settingSection: {
    marginTop: 20,
  },
  addCategoryButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  addCategoryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  defaultCategoryChip: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    margin: 4,
  },
  defaultCategoryText: {
    fontSize: 12,
    color: '#495057',
  },
  customCategoryChip: {
    backgroundColor: '#007bff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    margin: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  customCategoryText: {
    fontSize: 12,
    color: '#fff',
    marginRight: 5,
  },
  removeCategoryText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6c757d',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  modalSaveText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  
  // Category Suggestions Modal Styles
  primarySuggestionContainer: {
    marginBottom: 20,
  },
  primarySuggestionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 8,
  },
  primarySuggestionButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  primarySuggestionText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  otherSuggestionsContainer: {
    marginBottom: 20,
  },
  otherSuggestionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 8,
  },
  suggestionsScrollView: {
    maxHeight: 150,
  },
  suggestionButton: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  savingText: {
    textAlign: 'center',
    color: '#007bff',
    marginTop: 10,
    fontStyle: 'italic',
  },
  
  // Enhanced Category Selection Modal Styles
  categoryModalContainer: {
    maxHeight: '80%',
  },
  categoryScrollView: {
    maxHeight: 400,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
    marginTop: 8,
  },
  aiSuggestionsSection: {
    marginBottom: 20,
  },
  defaultCategoriesSection: {
    marginBottom: 20,
  },
  customCategoriesSection: {
    marginBottom: 20,
  },
  addCategorySection: {
    marginBottom: 10,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  primarySuggestionOption: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  aiSuggestionOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007bff',
  },
  customCategoryOption: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
  },
  categoryOptionIcon: {
    fontSize: 16,
    marginRight: 10,
    width: 20,
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
    fontWeight: '500',
  },
  recommendedBadge: {
    backgroundColor: '#28a745',
    color: '#fff',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: '600',
  },
  newCategoryInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newCategoryInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  addCategoryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addCategoryButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  addCategoryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  savingIndicator: {
    alignItems: 'center',
    marginTop: 10,
  },
});
