'use client';

import type React from 'react';
import { PropsWithChildren } from 'react';

import { CartProvider } from '@/components/providers';
import { MobileDeepLink } from '@/components/providers/MobileDeepLink/MobileDeepLink';
import { Cart } from '@/types/cart';

interface ProvidersProps extends PropsWithChildren {
  cart: Cart | null;
}

export function Providers({ children, cart }: ProvidersProps) {
  return (
    <CartProvider cart={cart}>
      <MobileDeepLink />
      {children}
    </CartProvider>
  );
}
