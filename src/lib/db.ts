import { MessageProps } from "@/components/MessageBubble";

export interface Conversation {
  id: string;
  title: string;
  messages: MessageProps[];
  createdAt: number;
  updatedAt: number;
}

export interface SavedMaterial {
  id: string;
  title: string;
  content: string;
  source: string;
  timestamp: number;
}

const DB_NAME = "snugpt_offline_db";
const DB_VERSION = 1;

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported on the server side."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("conversations")) {
        db.createObjectStore("conversations", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("saved_materials")) {
        db.createObjectStore("saved_materials", { keyPath: "id" });
      }
    };
  });
}

export async function saveConversation(conv: Conversation): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("conversations", "readwrite");
    const store = tx.objectStore("conversations");
    const request = store.put(conv);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllConversations(): Promise<Conversation[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("conversations", "readonly");
    const store = tx.objectStore("conversations");
    const request = store.getAll();
    request.onsuccess = () => {
      const res = request.result as Conversation[];
      res.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(res);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteConversationFromDB(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("conversations", "readwrite");
    const store = tx.objectStore("conversations");
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function saveMaterial(material: SavedMaterial): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("saved_materials", "readwrite");
    const store = tx.objectStore("saved_materials");
    const request = store.put(material);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllMaterials(): Promise<SavedMaterial[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("saved_materials", "readonly");
    const store = tx.objectStore("saved_materials");
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteMaterial(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("saved_materials", "readwrite");
    const store = tx.objectStore("saved_materials");
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
