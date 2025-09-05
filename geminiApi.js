/**
 * geminiApi.js
 * 
 * This file contains the functionality to classify Instagram reel captions
 * using the Gemini API (with support for Gemini 2.5 Pro and 2.0 models).
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API URLs for different Gemini models
const API_URL_2_5_PRO = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';
const API_URL_2_0 = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Storage key for the API key
const API_KEY_STORAGE_KEY = '@reel_classifier_gemini_api_key';

/**
 * Saves the Gemini API key to secure storage
 * 
 * @param {string} apiKey - The Gemini API key to save
 * @returns {Promise<void>}
 */
export const saveApiKey = async (apiKey) => {
  try {
    await AsyncStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    return true;
  } catch (error) {
    console.error('Error saving API key:', error);
    throw new Error('Failed to save API key. Please try again.');
  }
};

/**
 * Retrieves the saved Gemini API key from secure storage
 * 
 * @returns {Promise<string|null>} - A promise that resolves to the API key or null if not found
 */
export const getApiKey = async () => {
  try {
    return await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Error retrieving API key:', error);
    return null;
  }
};

/**
 * Checks if an API key is already stored
 * 
 * @returns {Promise<boolean>} - A promise that resolves to true if an API key is stored
 */
export const hasApiKey = async () => {
  const apiKey = await getApiKey();
  return apiKey !== null && apiKey !== '';
};

/**
 * Classifies the given Instagram reel caption text into one of the predefined categories
 * 
 * @param {string} caption - The Instagram reel caption text to classify
 * @returns {Promise<string>} - A promise that resolves to the predicted category
 */
export const classifyText = async (caption) => {
  try {
    // Get the API key from storage
    const apiKey = await getApiKey();
    
    if (!apiKey) {
      throw new Error('Please set your Gemini API key in the settings');
    }
    // System instruction for the Gemini model
    const systemInstruction = "Classify this Instagram reel text into exactly one of [Motivational, Gym, Communication, Ideas, Coding, UI, ML-AI, Job, Internships, love, sayari, songs]. Return only the category name.";
    
    // Prepare the request payload
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${systemInstruction}\n\nText to classify: ${caption}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 1,
        topP: 1,
        maxOutputTokens: 10
      }
    };

    // Try with Gemini 2.5 Pro first
    try {
      const response = await axios.post(
        `${API_URL_2_5_PRO}?key=${apiKey}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );
      
      // Extract and return the result
      return processApiResponse(response);
    } catch (error) {
      console.log('Gemini 2.5 Pro failed, falling back to Gemini 2.0:', error.message);
      
      // Fall back to Gemini 2.0
      const response = await axios.post(
        `${API_URL_2_0}?key=${apiKey}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Extract and return the result
      return processApiResponse(response);
    }

  } catch (error) {
    console.error('Error classifying text:', error);
    throw new Error(error.message || 'Failed to classify text. Please try again.');
  }
};

/**
 * Process the API response and extract the classification result
 * 
 * @param {Object} response - The API response object
 * @returns {string} - The classification result
 */
const processApiResponse = (response) => {
  // Extract the classification result
  const result = response.data.candidates[0].content.parts[0].text.trim();
  
  // Validate that the result is one of our expected categories
  const validCategories = ['Motivational', 'Gym', 'Communication', 'Ideas', 'Coding', 'UI', 'ML-AI', 'Job', 'Internships', 'love', 'sayari', 'songs'];
  
  if (validCategories.includes(result)) {
    return result;
  } else {
    // Default to a generic category if the result doesn't match any expected category
    return 'Other';
  }
  } catch (error) {
    console.error('Error classifying text:', error);
    throw new Error('Failed to classify text. Please try again.');
  }
};