import { getFirestore, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

async function cleanOldIPs() {
  const db = getFirestore();
  const now = new Date();
  const targetHour = 23;

  if (now.getHours() === targetHour) {
    const snapshot = await getDocs(collection(db, "visitors"));

    snapshot.forEach(async (document) => {
      const data = document.data();
      const timestamp = new Date(data.timestamp);
      const timeDiff = (now - timestamp) / (1000 * 60 * 60); // in hours

      if (timeDiff >= 24) {
        await deleteDoc(doc(db, "visitors", document.id));
      }
    });
  }
}

setInterval(cleanOldIPs, 1000 * 60 * 60);