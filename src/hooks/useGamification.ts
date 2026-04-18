import { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, updateDoc, increment, arrayUnion, setDoc, serverTimestamp, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { BIOLOGY_CURRICULUM, calculateLevel, getXpForLevel } from '../constants/learning';

export const useGamification = (user: any) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        setUserData(snap.data());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addXp = useCallback(async (amount: number) => {
    if (!user || !userData) return;
    const newXp = (userData.xp || 0) + amount;
    const newLevel = calculateLevel(newXp);
    
    await updateDoc(doc(db, 'users', user.uid), {
      xp: increment(amount),
      level: newLevel,
      lastActive: serverTimestamp()
    });

    if (newLevel > (userData.level || 1)) {
      // Level up award logic could go here
    }
  }, [user, userData]);

  const updateTopicMastery = useCallback(async (topicId: string, masteryScore: number) => {
    if (!user || !userData) return;

    const currentTopicStats = userData.topicStats || {};
    const previousMastery = currentTopicStats[topicId] || 0;

    // Only update if mastery improved
    if (masteryScore > previousMastery) {
      const updates: any = {
        [`topicStats.${topicId}`]: masteryScore
      };

      // Check if this unlocks new topics
      const topic = BIOLOGY_CURRICULUM.find(t => t.id === topicId);
      if (topic && masteryScore >= topic.minMasteryToUnlockNext) {
        // Find topics that have this as a prerequisite
        const nextTopics = BIOLOGY_CURRICULUM.filter(t => 
          t.prerequisites.includes(topicId) && 
          t.prerequisites.every(pre => (currentTopicStats[pre] || 0) >= 80 || pre === topicId && masteryScore >= 80)
        );

        nextTopics.forEach(next => {
          if (!userData.unlockedTopics?.includes(next.id)) {
            updates.unlockedTopics = arrayUnion(next.id);
          }
        });
      }

      await updateDoc(doc(db, 'users', user.uid), updates);
    }
  }, [user, userData]);

  const createFlashcard = useCallback(async (front: string, back: string, topic: string) => {
    if (!user) return;
    const cardRef = doc(collection(db, 'users', user.uid, 'flashcards'));
    await setDoc(cardRef, {
      userId: user.uid,
      front,
      back,
      topic,
      easeFactor: 2.5,
      interval: 1,
      nextReview: new Date(),
      consecutiveCorrect: 0,
      createdAt: serverTimestamp()
    });
  }, [user]);

  const reviewFlashcard = useCallback(async (cardId: string, success: boolean) => {
    if (!user) return;
    const cardRef = doc(db, 'users', user.uid, 'flashcards', cardId);
    const snap = await getDoc(cardRef);
    if (!snap.exists()) return;

    const data = snap.data();
    let newEaseFactor = data.easeFactor;
    let newInterval = 1;
    let newConsecutiveCorrect = 0;

    if (success) {
      newConsecutiveCorrect = data.consecutiveCorrect + 1;
      if (newConsecutiveCorrect === 1) {
        newInterval = 1;
      } else if (newConsecutiveCorrect === 2) {
        newInterval = 4;
      } else {
        newInterval = Math.ceil(data.interval * data.easeFactor);
      }
    } else {
      newConsecutiveCorrect = 0;
      newInterval = 1;
      newEaseFactor = Math.max(1.3, data.easeFactor - 0.2);
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    await updateDoc(cardRef, {
      easeFactor: newEaseFactor,
      interval: newInterval,
      nextReview: nextReview.toISOString(),
      consecutiveCorrect: newConsecutiveCorrect
    });

    // Award small XP for reviewing
    await addXp(10);
  }, [user, addXp]);

  const upgradeToPro = useCallback(async () => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      isPro: true,
      proSince: serverTimestamp(),
      badges: arrayUnion('pro-member')
    });
    // Add Pro badge to local state if needed, but onSnapshot handles it
  }, [user]);

  return {
    userData,
    loading,
    isPro: userData?.isPro || false,
    addXp,
    updateTopicMastery,
    createFlashcard,
    reviewFlashcard,
    upgradeToPro
  };
};
