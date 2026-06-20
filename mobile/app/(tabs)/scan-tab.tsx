// SKINgenius — Scan Tab (navigates to full scan screen)
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function ScanTab() {
  useEffect(() => {
    router.replace('/scan');
  }, []);
  return null;
}
