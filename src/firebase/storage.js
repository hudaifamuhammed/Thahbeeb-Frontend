import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

// Upload file to Firebase Storage
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { success: true, url: downloadURL };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Upload gallery image
export const uploadGalleryImage = async (file, caption) => {
  const timestamp = Date.now();
  const fileName = `gallery/images/${timestamp}_${file.name}`;
  return await uploadFile(file, fileName);
};

// Upload gallery video
export const uploadGalleryVideo = async (file, caption) => {
  const timestamp = Date.now();
  const fileName = `gallery/videos/${timestamp}_${file.name}`;
  return await uploadFile(file, fileName);
};

// Upload team member Excel file
export const uploadTeamExcel = async (file, teamId) => {
  const fileName = `teams/${teamId}/members.xlsx`;
  return await uploadFile(file, fileName);
};

// Delete file from Firebase Storage
export const deleteFile = async (url) => {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
