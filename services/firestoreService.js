import {
  collection, onSnapshot, query, where, orderBy,
  getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc,
  setDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Subscribe to an entire collection in real-time.
 */
export function subscribeToCollection(collectionName, callback) {
  const ref = collection(db, collectionName);
  return onSnapshot(ref, (snapshot) => {
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(data);
  }, (error) => {
    console.error(`[Firestore] Error in ${collectionName}:`, error);
    callback([]);
  });
}

/**
 * Subscribe to a collection with where-clause constraints.
 */
export function subscribeWithQuery(collectionName, constraints = [], callback) {
  const ref = collection(db, collectionName);
  const queryConstraints = constraints.map((c) => where(c.field, c.operator, c.value));
  const q = query(ref, ...queryConstraints);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(data);
  }, (error) => {
    console.error(`[Firestore] Query error in ${collectionName}:`, error);
    callback([]);
  });
}

/**
 * Add a new document to a collection.
 */
export async function addDocument(collectionName, data) {
  try {
    const ref = collection(db, collectionName);
    const docRef = await addDoc(ref, { ...data, createdAt: new Date().toISOString() });
    return docRef.id;
  } catch (error) {
    console.error(`[Firestore] addDocument error:`, error);
    throw error;
  }
}

/**
 * Get a single document by ID.
 */
export async function getDocument(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error(`[Firestore] getDocument error:`, error);
    return null;
  }
}

/**
 * Update an existing document.
 */
export async function updateDocument(collectionName, docId, data) {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error(`[Firestore] updateDocument error:`, error);
    throw error;
  }
}

/**
 * Set (upsert) a document by explicit ID.
 */
export async function setDocument(collectionName, docId, data) {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.error(`[Firestore] setDocument error:`, error);
    throw error;
  }
}

/**
 * Delete a document by ID.
 */
export async function deleteDocument(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`[Firestore] deleteDocument error:`, error);
    throw error;
  }
}

/**
 * Add a document to a subcollection of a document.
 */
export async function addSubDocument(collectionName, docId, subcollectionName, data) {
  try {
    const ref = collection(db, collectionName, docId, subcollectionName);
    const docRef = await addDoc(ref, { ...data, createdAt: new Date().toISOString() });
    return docRef.id;
  } catch (error) {
    console.error(`[Firestore] addSubDocument error:`, error);
    throw error;
  }
}

/**
 * Update a document in a subcollection.
 */
export async function updateSubDocument(collectionName, docId, subcollectionName, subDocId, data) {
  try {
    const docRef = doc(db, collectionName, docId, subcollectionName, subDocId);
    await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error(`[Firestore] updateSubDocument error:`, error);
    throw error;
  }
}

/**
 * Delete a document from a subcollection.
 */
export async function deleteSubDocument(collectionName, docId, subcollectionName, subDocId) {
  try {
    const docRef = doc(db, collectionName, docId, subcollectionName, subDocId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`[Firestore] deleteSubDocument error:`, error);
    throw error;
  }
}

/**
 * Subscribe to a subcollection in real-time.
 */
export function subscribeToSubcollection(collectionName, docId, subcollectionName, callback) {
  const ref = collection(db, collectionName, docId, subcollectionName);
  return onSnapshot(ref, (snapshot) => {
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(data);
  }, (error) => {
    console.error(`[Firestore] Subcollection error:`, error);
    callback([]);
  });
}

/**
 * Subscribe to orders for a specific user.
 */
export function subscribeToUserOrders(userId, callback) {
  const ref = collection(db, 'orders');
  const q = query(ref, where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Sort client-side by createdAt descending
    data.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    callback(data);
  }, (error) => {
    console.error(`[Firestore] Orders error:`, error);
    callback([]);
  });
}
