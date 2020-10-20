import HomePage from './pages/home.svelte';

type ComponentModule = {default: unknown};
export default [
  {
    name: 'Wallet',
    path: 'wallet',
    asyncComponent: (): Promise<ComponentModule> => import('./pages/wallet.svelte'),
  },
  {
    name: 'Home',
    path: '',
    component: HomePage, // Home Page is bundled for faster user interaction
  },
  {
    name: 'Sign up',
    path: 'creator-sign-up',
    asyncComponent: (): Promise<ComponentModule> => import('./pages/sign-up.svelte'),
  },
  {
    name: 'Creator',
    path: 'creator/:id',
    asyncComponent: (): Promise<ComponentModule> => import('./pages/creator.svelte'),
  },
  {
    name: 'NotFound',
    path: '.*',
    asyncComponent: (): Promise<ComponentModule> => import('./pages/notfound.svelte'),
  },
  {
    name: 'Upload',
    path: 'upload',
    asyncComponent: (): Promise<ComponentModule> => import('./pages/upload.svelte'),
  },
];
