import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// Collections
const COLLECTIONS = {
  TEAMS: 'teams',
  NEWS: 'news',
  ITEMS: 'items',
  GALLERY: 'gallery',
  SCORES: 'scores',
  USERS: 'users'
};

// Teams
export const addTeam = async (teamData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.TEAMS), {
      ...teamData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getTeams = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.TEAMS));
    const teams = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, data: teams };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// News
export const addNews = async (newsData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.NEWS), {
      ...newsData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getNews = async () => {
  try {
    const q = query(collection(db, COLLECTIONS.NEWS), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const news = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, data: news };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Items (Competitions)
export const addItem = async (itemData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.ITEMS), {
      ...itemData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getItems = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.ITEMS));
    const items = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Gallery
export const addGalleryItem = async (galleryData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.GALLERY), {
      ...galleryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getGalleryItems = async () => {
  try {
    const q = query(collection(db, COLLECTIONS.GALLERY), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const gallery = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, data: gallery };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Scores
export const addScore = async (scoreData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.SCORES), {
      ...scoreData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getScores = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.SCORES));
    const scores = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, data: scores };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Real-time listeners
export const subscribeToNews = (callback) => {
  const q = query(collection(db, COLLECTIONS.NEWS), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const news = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(news);
  });
};

export const subscribeToScores = (callback) => {
  return onSnapshot(collection(db, COLLECTIONS.SCORES), (querySnapshot) => {
    const scores = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(scores);
  });
};
