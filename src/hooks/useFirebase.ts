import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AppUser, SiteConfig } from '../types';

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userRef = doc(db, 'users', fbUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          const isOwner = fbUser.email === 'abibdep@gmail.com';
          const newUser: AppUser = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            badge: isOwner ? 'Owner' : 'User',
            isBanned: false,
            lastLogin: new Date().toISOString()
          };
          await setDoc(userRef, newUser);
          setUser(newUser);
        } else {
          setUser(userSnap.data() as AppUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  return { user, loading };
}

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>({
    siteName: 'VibeWall',
    logoUrl: 'https://img.icons8.com/clouds/200/sparkling-diamond.png',
    faviconUrl: '',
    maintenanceMode: false,
    maintenanceMessage: 'Kami sedang melakukan pemeliharaan rutin.'
  });

  useEffect(() => {
    return onSnapshot(doc(db, 'siteConfig', 'global'), (doc) => {
      if (doc.exists()) {
        setConfig(doc.data() as SiteConfig);
      }
    });
  }, []);

  return config;
}
