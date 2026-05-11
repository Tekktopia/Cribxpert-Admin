import type { AppDispatch } from '../store/enhancedStore';
import { store } from '../store/enhancedStore';
import { supabase } from './supabase';
import { setSession, clearSession, setAuthLoading, setProfile } from '../store/slices/authSlice';

type AppStore = { dispatch: AppDispatch };

export function startAuthListener(appStore: AppStore = store) {
  let initialised = false;

  supabase.auth.getSession().then(({ data, error }) => {
    initialised = true;
    if (error || !data.session) {
      appStore.dispatch(setAuthLoading(false));
    } else {
      appStore.dispatch(setSession({ user: data.session.user, session: data.session }));
      fetchAndStoreProfile(appStore, data.session.user.id);
    }
  }).catch(() => {
    appStore.dispatch(setAuthLoading(false));
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!initialised) return; // ignore events before getSession resolves
    if (session) {
      appStore.dispatch(setSession({ user: session.user, session }));
      fetchAndStoreProfile(appStore, session.user.id);
    } else {
      appStore.dispatch(clearSession());
    }
  });

  return () => subscription.unsubscribe();
}

async function fetchAndStoreProfile(appStore: AppStore, userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (data) {
    appStore.dispatch(setProfile(data));
  }
}
